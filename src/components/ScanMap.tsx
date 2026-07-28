"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type { Lead, ScanRecord } from "@/lib/types";
import type { StormAlert } from "@/lib/weather/nws";
import { urgencyRank } from "@/lib/leadFilter";
import { CONDITION_COLORS } from "@/components/ConditionBadge";
import { boundsAreaKm2, isScanAreaTooLarge, MAX_SCAN_AREA_KM2 } from "@/lib/scanBounds";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";
import { tf } from "@/lib/i18n/format";
import type { PlanTier } from "@/lib/usage";

type ScanResponse = { scan: ScanRecord; leads: Lead[] };

export default function ScanMap({ locale = "en", planTier = "free" }: { locale?: Locale; planTier?: PlanTier }) {
  const t = dictionaries[locale].scanMap;
  const tCondition = dictionaries[locale].condition;
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const stormLayerRef = useRef<LayerGroup | null>(null);

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [areaKm2, setAreaKm2] = useState<number | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [stormsOn, setStormsOn] = useState(false);
  const [stormsLoading, setStormsLoading] = useState(false);
  const [stormError, setStormError] = useState<string | null>(null);
  const [stormAlerts, setStormAlerts] = useState<StormAlert[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      const L = ((mod as { default?: typeof import("leaflet") }).default ?? mod) as typeof import("leaflet");
      if (cancelled || !mapDivRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(mapDivRef.current).setView([36.1085, -86.8005], 16);
      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxNativeZoom: 19,
          maxZoom: 20,
          attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
        }
      );
      const streets = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
      satellite.addTo(map);
      L.control.layers({ Satellite: satellite, Streets: streets }).addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      const updateArea = () => {
        const b = map.getBounds();
        setAreaKm2(
          boundsAreaKm2({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() })
        );
      };
      map.on("moveend", updateArea);
      map.on("zoomend", updateArea);
      updateArea();
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

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
      map.setView([body.lat, body.lng], 18);
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : t.couldntFindAddress);
    } finally {
      setSearchingAddress(false);
    }
  }

  function pan(dx: number, dy: number) {
    const map = mapRef.current;
    if (!map) return;
    const size = map.getSize();
    map.panBy([dx * size.x * 0.35, dy * size.y * 0.35]);
  }

  function renderStormLayer(alerts: StormAlert[]) {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (!stormLayerRef.current) stormLayerRef.current = L.layerGroup().addTo(map);
    const layer = stormLayerRef.current;
    layer.clearLayers();

    for (const alert of alerts) {
      if (!alert.geometry) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NWS geometry is plain GeoJSON, no need for the full ambient GeoJSON types here
      const geoLayer = L.geoJSON(alert.geometry as any, {
        style: { color: "#ff5a36", weight: 2, fillColor: "#ff5a36", fillOpacity: 0.15 },
      });
      geoLayer.bindPopup(
        `<strong>${alert.event}</strong><br/>${alert.areaDesc}<br/>${alert.hazard}` +
          `<br/><span style="font-size:11px;color:#666">Effective ${new Date(alert.effective).toLocaleString()}</span>` +
          `<br/><span style="font-size:11px;color:#666">${t.stormClickToJump}</span>`
      );
      geoLayer.on("click", () => {
        if (alert.centroid) map.setView([alert.centroid.lat, alert.centroid.lng], 15);
      });
      geoLayer.addTo(layer);
    }
  }

  async function toggleStorms() {
    if (stormsOn) {
      stormLayerRef.current?.clearLayers();
      setStormsOn(false);
      return;
    }

    setStormsLoading(true);
    setStormError(null);
    try {
      const res = await fetch("/api/storm-alerts");
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? t.stormError);
      setStormAlerts(data.alerts as StormAlert[]);
      renderStormLayer(data.alerts as StormAlert[]);
      setStormsOn(true);
    } catch (e) {
      setStormError(e instanceof Error ? e.message : t.stormError);
    } finally {
      setStormsLoading(false);
    }
  }

  async function runScan() {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;
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
        body: JSON.stringify(bounds),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 402) setLimitReached(true);
        throw new Error(body?.message ?? body?.error ?? `Scan failed (HTTP ${res.status})`);
      }
      const data = (await res.json()) as ScanResponse;

      const markers = markersRef.current!;
      markers.clearLayers();
      for (const lead of data.leads) {
        L.circleMarker([lead.lat, lead.lng], {
          radius: 9,
          color: "#ffffff",
          weight: 2,
          fillColor: CONDITION_COLORS[lead.condition.label] ?? "#64748b",
          fillOpacity: 0.95,
        })
          .bindPopup(
            `<strong>${lead.address}</strong><br/>` +
              (lead.condition.graded
                ? `${tCondition[lead.condition.label]} — score ${lead.condition.score}/100<br/>`
                : `${tCondition.Ungraded} — condition not verified<br/>`) +
              `<a href="/app/leads/${lead.id}">Open profile →</a>`
          )
          .addTo(markers);
      }
      setResult(data);
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
      <div className="relative">
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
        <div
          ref={mapDivRef}
          className="h-[68vh] w-full rounded-xl border border-slate-200 shadow-sm dark:border-slate-800"
        />
        {/* Pan controls — Leaflet already supports drag-to-pan; these give
            precise, discoverable directional control (useful on touch/trackpad
            and for fine-tuning right before a scan). */}
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

      <div className="flex max-h-[68vh] flex-col gap-3">
        <button
          onClick={runScan}
          disabled={scanning}
          className="rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-wait disabled:bg-amber-400"
        >
          {scanning ? t.scanning : t.scanButton}
        </button>
        <p className={`text-xs ${areaTooLarge ? "font-medium text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
          {areaKm2 !== null ? tf(t.visibleArea, { area: areaKm2.toFixed(1) }) : "…"} ·{" "}
          {tf(t.largerAreasTakeLonger, { max: MAX_SCAN_AREA_KM2 })}
        </p>

        {planTier === "apex" ? (
          <button
            type="button"
            onClick={toggleStorms}
            disabled={stormsLoading}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-wait ${
              stormsOn
                ? "border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {stormsLoading ? t.stormLoading : stormsOn ? t.stormHide : t.stormShow}
          </button>
        ) : (
          <Link
            href="/app/billing"
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {t.stormLocked}
          </Link>
        )}
        {stormError && <p className="text-xs font-medium text-red-600 dark:text-red-400">{stormError}</p>}
        {stormsOn && stormAlerts?.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.stormNoAlerts}</p>
        )}

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
