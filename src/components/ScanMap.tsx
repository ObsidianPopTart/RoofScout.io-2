"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type { Lead, ScanRecord } from "@/lib/types";
import { urgencyRank } from "@/lib/leadFilter";
import { CONDITION_COLORS } from "@/components/ConditionBadge";
import { boundsAreaKm2, isScanAreaTooLarge, MAX_SCAN_AREA_KM2 } from "@/lib/scanBounds";

type ScanResponse = { scan: ScanRecord; leads: Lead[] };

export default function ScanMap() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [areaKm2, setAreaKm2] = useState<number | null>(null);

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

  function pan(dx: number, dy: number) {
    const map = mapRef.current;
    if (!map) return;
    const size = map.getSize();
    map.panBy([dx * size.x * 0.35, dy * size.y * 0.35]);
  }

  async function runScan() {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;
    setError(null);
    setLimitReached(false);

    if (map.getZoom() < 14) {
      setError("Zoom in closer — the scan needs neighborhood-level detail (zoom 14+).");
      return;
    }

    const b = map.getBounds();
    const bounds = { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() };
    if (isScanAreaTooLarge(bounds)) {
      setError(
        `That area is too large for one scan (max ${MAX_SCAN_AREA_KM2} km²) — zoom in to a smaller neighborhood.`
      );
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
                ? `${lead.condition.label} — score ${lead.condition.score}/100<br/>`
                : `Ungraded — condition not verified<br/>`) +
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
            aria-label="Pan up"
            onClick={() => pan(0, -1)}
            className="col-start-2 rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ↑
          </button>
          <div />
          <button
            type="button"
            aria-label="Pan left"
            onClick={() => pan(-1, 0)}
            className="rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Pan down"
            onClick={() => pan(0, 1)}
            className="rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ↓
          </button>
          <button
            type="button"
            aria-label="Pan right"
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
          {scanning ? "Scanning rooftops…" : "Scan visible area"}
        </button>
        <p className={`text-xs ${areaTooLarge ? "font-medium text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
          {areaKm2 !== null ? `Visible area: ≈${areaKm2.toFixed(1)} km²` : "…"} · Larger areas take longer to
          analyze (max {MAX_SCAN_AREA_KM2} km² per scan).
        </p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <p>{error}</p>
            {limitReached && (
              <Link href="/app/billing" className="mt-1 inline-block font-semibold text-red-800 underline dark:text-red-300">
                Upgrade your plan →
              </Link>
            )}
          </div>
        )}

        {result ? (
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {result.scan.leadCount} neglected roofs found
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">worst first · healthy roofs filtered out</div>
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
                        {lead.condition.graded ? `${lead.condition.label} · ${lead.condition.score}` : "Ungraded"}
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
                View all leads →
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-medium text-slate-800 dark:text-slate-100">How to run a scan</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4">
              <li>Pan and zoom until you can see the rooftops you want to canvass.</li>
              <li>
                Click <span className="font-medium">Scan visible area</span>.
              </li>
              <li>
                The AI inspects a close-up satellite photo of each roof, keeps the neglected ones,
                and drops healthy roofs automatically.
              </li>
            </ol>
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              Demo mode simulates the analysis. With the Google Solar API connected, this same flow
              returns real rooftops with measured areas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
