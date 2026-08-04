"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  NavigationControl,
  GlobeControl,
  type GeoJSONSource,
} from "maplibre-gl";
import type { Lead, ScanRecord } from "@/lib/types";
import type { StormAlert } from "@/lib/weather/nws";
import type { StormReport } from "@/lib/weather/spc";
import { urgencyRank } from "@/lib/leadFilter";
import { CONDITION_COLORS } from "@/components/ConditionBadge";
import { boundsAreaKm2, isScanAreaTooLarge, MAX_SCAN_AREA_KM2 } from "@/lib/scanBounds";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";
import { tf } from "@/lib/i18n/format";
import type { PlanTier } from "@/lib/usage";

type ScanResponse = { scan: ScanRecord; leads: Lead[] };
type BaseLayer = "satellite" | "streets";

const SATELLITE_SOURCE_ID = "satellite";
const STREETS_SOURCE_ID = "streets";
const STORMS_SOURCE_ID = "storms";
const RADAR_SOURCE_ID = "radar";

// GeoJSON with no features — used to initialize the storms source before any
// fetch has happened, and to clear it when the layer is toggled off.
const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection" as const, features: [] };

function alertsToFeatureCollection(alerts: StormAlert[]) {
  return {
    type: "FeatureCollection" as const,
    features: alerts
      .filter((a) => a.geometry)
      .map((a) => ({
        type: "Feature" as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NWS geometry is plain GeoJSON, no need for the full ambient GeoJSON types here
        geometry: a.geometry as any,
        properties: {
          event: a.event,
          areaDesc: a.areaDesc,
          hazard: a.hazard,
          effective: a.effective,
          centroidLat: a.centroid?.lat ?? null,
          centroidLng: a.centroid?.lng ?? null,
        },
      })),
  };
}

// A single ranked, clickable feed combining active NWS warnings and
// significant (>= 1 in) SPC hail reports — the point of this is that a user
// never has to go looking for storm activity on the map themselves; they
// read a list and click the item they want to target.
interface StormFeedItem {
  id: string;
  kind: "alert" | "hail";
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  sortValue: number;
  label: string; // saved onto the resulting ScanRecord when this item is scanned
}

const HAIL_THRESHOLD_INCHES = 1; // below this, hail is unlikely to threaten a roof

function buildStormFeed(alerts: StormAlert[], reports: StormReport[]): StormFeedItem[] {
  const alertItems: StormFeedItem[] = alerts
    .filter((a) => a.centroid)
    .map((a) => ({
      id: `alert-${a.id}`,
      kind: "alert",
      title: a.event,
      subtitle: `${a.areaDesc} — ${a.hazard}`,
      lat: a.centroid!.lat,
      lng: a.centroid!.lng,
      sortValue: a.event.includes("Tornado") ? 1000 : 900,
      label: `${a.event} — ${a.areaDesc}`.slice(0, 80),
    }));

  const hailItems: StormFeedItem[] = reports
    .filter((r) => r.type === "hail" && (r.magnitudeValue ?? 0) >= HAIL_THRESHOLD_INCHES)
    .map((r) => ({
      id: `report-${r.date}-${r.time}-${r.lat}-${r.lng}`,
      kind: "hail",
      title: r.magnitudeLabel,
      subtitle: `${r.location}, ${r.county} ${r.state} — ${r.date}`,
      lat: r.lat,
      lng: r.lng,
      sortValue: (r.magnitudeValue ?? 1) * 10,
      label: `${r.magnitudeLabel} — ${r.location}, ${r.state}`.slice(0, 80),
    }));

  return [...alertItems, ...hailItems].sort((a, b) => b.sortValue - a.sortValue).slice(0, 30);
}

export default function ScanMap({ locale = "en", planTier = "free" }: { locale?: Locale; planTier?: PlanTier }) {
  const t = dictionaries[locale].scanMap;
  const tCondition = dictionaries[locale].condition;
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const leadMarkersRef = useRef<Marker[]>([]);
  const feedMarkerRef = useRef<Marker | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("satellite");
  const [radarOn, setRadarOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [areaKm2, setAreaKm2] = useState<number | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [stormsLoading, setStormsLoading] = useState(false);
  const [stormError, setStormError] = useState<string | null>(null);
  const [stormAlerts, setStormAlerts] = useState<StormAlert[] | null>(null);
  const [stormReports, setStormReports] = useState<StormReport[] | null>(null);
  const [stormDays, setStormDays] = useState(3);
  const [activeStormLabel, setActiveStormLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    // Empty style to start — sources/layers are added once in the 'load'
    // handler below, after MapLibre has a style to attach them to.
    const map = new MapLibreMap({
      container: mapDivRef.current,
      style: { version: 8, sources: {}, layers: [] },
      center: [-95, 38], // continental US — a deliberately global-looking start
      zoom: 3.2,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: true }), "top-left");
    map.addControl(new GlobeControl(), "top-left");

    map.on("load", () => {
      // Globe at low zoom, automatically flattens to standard Mercator once
      // zoomed in past the neighborhood level scanning actually needs.
      map.setProjection({ type: "globe" });
      map.setSky({
        "sky-color": "#0a0d12",
        "horizon-color": "#7de0c4",
        "fog-color": "#0a0d12",
        "fog-ground-blend": 0.5,
      });

      map.addSource(SATELLITE_SOURCE_ID, {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
      });
      map.addLayer({ id: "satellite-layer", type: "raster", source: SATELLITE_SOURCE_ID });

      map.addSource(STREETS_SOURCE_ID, {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
      map.addLayer({
        id: "streets-layer",
        type: "raster",
        source: STREETS_SOURCE_ID,
        layout: { visibility: "none" },
      });

      // Live weather radar (NEXRAD composite reflectivity) — free, public,
      // no API key, from Iowa Environmental Mesonet. Refreshes every ~5min
      // server-side; drawn semi-transparent over the base map.
      map.addSource(RADAR_SOURCE_ID, {
        type: "raster",
        tiles: ["https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 12,
        attribution: "Radar &copy; Iowa Environmental Mesonet",
      });
      map.addLayer({
        id: "radar-layer",
        type: "raster",
        source: RADAR_SOURCE_ID,
        layout: { visibility: "none" },
        paint: { "raster-opacity": 0.65 },
      });

      map.addSource(STORMS_SOURCE_ID, { type: "geojson", data: EMPTY_FEATURE_COLLECTION });
      map.addLayer({
        id: "storms-fill",
        type: "fill",
        source: STORMS_SOURCE_ID,
        layout: { visibility: "none" },
        paint: { "fill-color": "#ff5a36", "fill-opacity": 0.15 },
      });
      map.addLayer({
        id: "storms-line",
        type: "line",
        source: STORMS_SOURCE_ID,
        layout: { visibility: "none" },
        paint: { "line-color": "#ff5a36", "line-width": 2 },
      });

      map.on("mouseenter", "storms-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "storms-fill", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", "storms-fill", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties as Record<string, string | number | null>;
        new Popup({ offset: 12 })
          .setLngLat(e.lngLat)
          .setHTML(
            `<strong>${props.event}</strong><br/>${props.areaDesc}<br/>${props.hazard}` +
              `<br/><span style="font-size:11px;color:#666">Effective ${new Date(String(props.effective)).toLocaleString()}</span>` +
              `<br/><span style="font-size:11px;color:#666">${t.stormClickToJump}</span>`
          )
          .addTo(map);
        if (props.centroidLat != null && props.centroidLng != null) {
          map.flyTo({ center: [Number(props.centroidLng), Number(props.centroidLat)], zoom: 15 });
        }
      });

      const updateArea = () => {
        const b = map.getBounds();
        setAreaKm2(
          boundsAreaKm2({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() })
        );
      };
      map.on("moveend", updateArea);
      map.on("zoomend", updateArea);
      updateArea();
      setMapReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once; t.stormClickToJump is static per-locale-mount
  }, []);

  function toggleBaseLayer() {
    const map = mapRef.current;
    if (!map) return;
    const next: BaseLayer = baseLayer === "satellite" ? "streets" : "satellite";
    map.setLayoutProperty("satellite-layer", "visibility", next === "satellite" ? "visible" : "none");
    map.setLayoutProperty("streets-layer", "visibility", next === "streets" ? "visible" : "none");
    setBaseLayer(next);
  }

  function toggleRadar() {
    const map = mapRef.current;
    if (!map) return;
    const next = !radarOn;
    map.setLayoutProperty("radar-layer", "visibility", next ? "visible" : "none");
    setRadarOn(next);
  }

  async function searchAddress(e: React.FormEvent) {
    e.preventDefault();
    const map = mapRef.current;
    const query = addressQuery.trim();
    if (!map || !query) return;

    setAddressError(null);
    setSearchingAddress(true);
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(query)}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? t.couldntFindAddress);
      map.flyTo({ center: [body.lng, body.lat], zoom: 18 });
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : t.couldntFindAddress);
    } finally {
      setSearchingAddress(false);
    }
  }

  function pan(dx: number, dy: number) {
    const map = mapRef.current;
    const el = mapDivRef.current;
    if (!map || !el) return;
    map.panBy([dx * el.clientWidth * 0.35, dy * el.clientHeight * 0.35]);
  }

  async function fetchStormData(days: number) {
    const map = mapRef.current;
    if (!map) return;

    setStormsLoading(true);
    setStormError(null);
    try {
      const res = await fetch(`/api/storm-alerts?days=${days}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? t.stormError);
      const alerts = data.alerts as StormAlert[];
      const reports = data.reports as StormReport[];
      setStormAlerts(alerts);
      setStormReports(reports);
      (map.getSource(STORMS_SOURCE_ID) as GeoJSONSource).setData(alertsToFeatureCollection(alerts));
      map.setLayoutProperty("storms-fill", "visibility", "visible");
      map.setLayoutProperty("storms-line", "visibility", "visible");
    } catch (e) {
      setStormError(e instanceof Error ? e.message : t.stormError);
    } finally {
      setStormsLoading(false);
    }
  }

  function changeStormDays(days: number) {
    setStormDays(days);
    fetchStormData(days);
  }

  // Apex users get the feed automatically the moment the map's ready — no
  // toggle to find, no map to go hunting around on.
  useEffect(() => {
    if (planTier === "apex" && mapReady && stormAlerts === null) {
      fetchStormData(stormDays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on planTier/mapReady changing; fetchStormData/stormDays/stormAlerts are read fresh each call
  }, [planTier, mapReady]);

  function viewAndScanStorm(item: StormFeedItem) {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({ center: [item.lng, item.lat], zoom: 16 });

    feedMarkerRef.current?.remove();
    const el = document.createElement("div");
    el.style.width = "20px";
    el.style.height = "20px";
    el.style.borderRadius = "50%";
    el.style.border = "3px solid #fff";
    const color = item.kind === "alert" ? "#dc2626" : "#f97316";
    el.style.background = color;
    el.style.boxShadow = `0 0 0 3px ${color}55, 0 2px 6px rgba(0,0,0,0.45)`;
    feedMarkerRef.current = new Marker({ element: el }).setLngLat([item.lng, item.lat]).addTo(map);

    setActiveStormLabel(item.label);
  }

  function renderLeads(data: ScanResponse) {
    const map = mapRef.current;
    if (!map) return;
    leadMarkersRef.current.forEach((m) => m.remove());
    leadMarkersRef.current = [];
    for (const lead of data.leads) {
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid #fff";
      el.style.boxShadow = "0 0 4px rgba(0,0,0,0.5)";
      el.style.background = CONDITION_COLORS[lead.condition.label] ?? "#64748b";
      el.style.cursor = "pointer";

      const popup = new Popup({ offset: 14 }).setHTML(
        `<strong>${lead.address}</strong><br/>` +
          (lead.condition.graded
            ? `${tCondition[lead.condition.label]} — score ${lead.condition.score}/100<br/>`
            : `${tCondition.Ungraded} — condition not verified<br/>`) +
          `<a href="/app/leads/${lead.id}">Open profile →</a>`
      );
      const marker = new Marker({ element: el }).setLngLat([lead.lng, lead.lat]).setPopup(popup).addTo(map);
      leadMarkersRef.current.push(marker);
    }
    setResult(data);
  }

  // Large scans run in the background on the server (see /api/scan) — this
  // polls the scan's status until it's done instead of holding one long
  // request open, which the platform would eventually time out.
  async function pollUntilDone(scanId: string) {
    const POLL_INTERVAL_MS = 3000;
    const MAX_WAIT_MS = 10 * 60 * 1000;
    const deadline = Date.now() + MAX_WAIT_MS;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const res = await fetch(`/api/scan/${scanId}`);
      if (!res.ok) throw new Error(`Scan status check failed (HTTP ${res.status})`);
      const data = (await res.json()) as ScanResponse;
      if (data.scan.status === "complete") {
        renderLeads(data);
        return;
      }
      if (data.scan.status === "failed") {
        throw new Error("Scan failed while analyzing rooftops.");
      }
      // still "processing" — keep polling
    }
    throw new Error("Scan is taking longer than expected. Check the Leads page shortly.");
  }

  async function runScan() {
    const map = mapRef.current;
    if (!map) return;
    setError(null);
    setLimitReached(false);

    if (map.getZoom() < 14) {
      setError(t.zoomInError);
      return;
    }

    const b = map.getBounds();
    const bounds = { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() };
    if (isScanAreaTooLarge(bounds)) {
      setError(tf(t.tooLargeError, { max: MAX_SCAN_AREA_KM2 }));
      return;
    }

    setScanning(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeStormLabel ? { ...bounds, stormSourceLabel: activeStormLabel } : bounds),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 402) setLimitReached(true);
        throw new Error(body?.message ?? body?.error ?? `Scan failed (HTTP ${res.status})`);
      }
      const data = (await res.json()) as ScanResponse;
      setActiveStormLabel(null); // one-shot tag — the label is now saved on the ScanRecord itself

      if (data.scan.status === "processing") {
        await pollUntilDone(data.scan.id);
      } else {
        renderLeads(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  const sortedLeads = result
    ? [...result.leads].sort((a, b) => urgencyRank(a.condition) - urgencyRank(b.condition))
    : [];

  const areaTooLarge = areaKm2 !== null && areaKm2 > MAX_SCAN_AREA_KM2;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_330px]">
      <div>
        <form onSubmit={searchAddress} className="mb-2 flex gap-2">
          <input
            type="text"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            placeholder={t.addressPlaceholder}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={searchingAddress}
            className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-wait disabled:bg-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            {searchingAddress ? t.searching : t.go}
          </button>
        </form>
        {addressError && (
          <p className="mb-2 text-xs font-medium text-red-600 dark:text-red-400">{addressError}</p>
        )}
        <div className="relative">
          <div
            ref={mapDivRef}
            className="h-[68vh] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800"
          />
          {mapReady && (
            <div className="absolute top-3 right-3 z-[1000] flex gap-1.5">
              {planTier === "apex" && (
                <button
                  type="button"
                  onClick={toggleRadar}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold shadow transition ${
                    radarOn
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-white/90 text-slate-700 hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {radarOn ? t.radarHide : t.radarShow}
                </button>
              )}
              <button
                type="button"
                onClick={toggleBaseLayer}
                className="rounded-md bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {baseLayer === "satellite" ? t.showStreets : t.showSatellite}
              </button>
            </div>
          )}
          {/* Pan controls — precise, discoverable directional control (useful
              on touch/trackpad and for fine-tuning right before a scan),
              alongside MapLibre's own drag-to-pan and drag-to-rotate. */}
          <div className="absolute bottom-3 right-3 z-[1000] grid grid-cols-3 grid-rows-2 gap-1">
            <div />
          <button
            type="button"
            aria-label={t.panUp}
            onClick={() => pan(0, -1)}
            className="col-start-2 rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ↑
          </button>
          <div />
          <button
            type="button"
            aria-label={t.panLeft}
            onClick={() => pan(-1, 0)}
            className="rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ←
          </button>
          <button
            type="button"
            aria-label={t.panDown}
            onClick={() => pan(0, 1)}
            className="rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ↓
          </button>
          <button
            type="button"
            aria-label={t.panRight}
            onClick={() => pan(1, 0)}
            className="rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            →
          </button>
          </div>
        </div>
      </div>

      <div className="flex max-h-[68vh] flex-col gap-3">
        {planTier === "apex" ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.stormFeedTitle}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.stormFeedSubtitle}</div>
              </div>
              <button
                type="button"
                onClick={() => fetchStormData(stormDays)}
                disabled={stormsLoading}
                className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-wait dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t.stormFeedRefresh}
              </button>
            </div>

            <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>{t.stormDayRangeLabel}</span>
              {[1, 3, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => changeStormDays(d)}
                  disabled={stormsLoading}
                  className={`rounded-md border px-2 py-1 font-semibold transition disabled:cursor-wait ${
                    stormDays === d
                      ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {tf(t.stormDayCount, { count: d })}
                </button>
              ))}
            </div>

            {stormError && (
              <p className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400">{stormError}</p>
            )}

            {stormsLoading && stormAlerts === null && (
              <p className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{t.stormFeedLoading}</p>
            )}

            {stormAlerts !== null && stormReports !== null && (
              <>
                {(() => {
                  const feed = buildStormFeed(stormAlerts, stormReports);
                  return feed.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{t.stormFeedEmpty}</p>
                  ) : (
                    <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                      {feed.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2 px-3 py-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ background: item.kind === "alert" ? "#dc2626" : "#f97316" }}
                                aria-hidden
                              />
                              <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                                {item.title}
                              </span>
                            </div>
                            <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                              {item.subtitle}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => viewAndScanStorm(item)}
                            className="shrink-0 rounded-md border border-orange-300 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-800 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900"
                          >
                            {t.stormFeedViewScan}
                          </button>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </>
            )}
          </div>
        ) : (
          <Link
            href="/app/billing"
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {t.stormLocked}
          </Link>
        )}
        {activeStormLabel && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300">
            <span className="truncate">{tf(t.stormFeedActiveLabel, { label: activeStormLabel })}</span>
            <button type="button" onClick={() => setActiveStormLabel(null)} className="shrink-0 font-semibold underline">
              {t.stormFeedClear}
            </button>
          </div>
        )}

        <button
          onClick={runScan}
          disabled={scanning || !mapReady}
          className="rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-wait disabled:bg-amber-400"
        >
          {scanning ? t.scanning : t.scanButton}
        </button>
        <p className={`text-xs ${areaTooLarge ? "font-medium text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
          {areaKm2 !== null ? tf(t.visibleArea, { area: areaKm2.toFixed(1) }) : "…"} ·{" "}
          {tf(t.largerAreasTakeLonger, { max: MAX_SCAN_AREA_KM2 })}
        </p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <p>{error}</p>
            {limitReached && (
              <Link href="/app/billing" className="mt-1 inline-block font-semibold text-red-800 underline dark:text-red-300">
                {t.upgradeYourPlan}
              </Link>
            )}
          </div>
        )}

        {result ? (
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {tf(t.neglectedRoofsFound, { count: result.scan.leadCount })}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t.worstFirstHealthy}</div>
              {!result.scan.label.startsWith("Area scan") && !result.scan.label.startsWith("Live scan") && (
                <div className="mt-1 text-xs font-medium text-orange-700 dark:text-orange-400">
                  {tf(t.scanSourceLabel, { label: result.scan.label })}
                </div>
              )}
            </div>
            <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {sortedLeads.map((lead) => (
                <li key={lead.id}>
                  <Link href={`/app/leads/${lead.id}`} className="block px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{lead.address}</span>
                      <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: CONDITION_COLORS[lead.condition.label] }}
                          aria-hidden
                        />
                        {lead.condition.graded
                          ? `${tCondition[lead.condition.label]} · ${lead.condition.score}`
                          : tCondition.Ungraded}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {lead.owner ? `${lead.owner.name} · ` : ""}≈
                      {lead.roof.areaSqFt.toLocaleString("en-US")} sq ft
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
              <Link href="/app/leads" className="text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300">
                {t.viewAllLeads}
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-medium text-slate-800 dark:text-slate-100">{t.howToRunScan}</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4">
              <li>{t.howToStep1}</li>
              <li>
                {t.howToStep2Pre}
                <span className="font-medium">{t.howToStep2Button}</span>
                {t.howToStep2Post}
              </li>
              <li>{t.howToStep3}</li>
            </ol>
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{t.demoModeNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
