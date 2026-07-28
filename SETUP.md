# RoofScout — Live Mode Setup

RoofScout runs in **demo mode** (simulated data) until you add API keys. This guide gets you to
**live mode**: real buildings, measured roofs, real satellite imagery, and AI condition grading.

## What live mode uses

| Data | Source | Cost |
|---|---|---|
| Building locations | OpenStreetMap (Overpass API) | Free |
| Roof area / pitch / segments | Google Solar API | Google Cloud pricing (free monthly credit usually covers development) |
| Satellite imagery | Google Maps Static API | Same |
| Street addresses | Google Geocoding API | Same |
| Roof condition grading | Claude vision (Anthropic API) | Per-image API cost |
| Owner info | *Not yet connected* — needs a parcel-data provider (Regrid / ATTOM) | — |

## Step 1 — Google Cloud project (you must do this part)

1. Go to https://console.cloud.google.com and create a project (e.g. "roofscout").
2. Enable billing on the project (required for the APIs below; development usage typically
   stays within Google's free monthly credit — set a budget alert to be safe).
3. In **APIs & Services → Library**, enable these three APIs:
   - **Solar API**
   - **Maps Static API**
   - **Geocoding API**
4. In **APIs & Services → Credentials**, click **Create credentials → API key**.
5. Recommended: click the key → **API restrictions** → restrict it to just those three APIs.
6. Copy the key.

## Step 2 — Anthropic API key

1. Go to https://platform.claude.com and create an API key.
2. Copy it. (Skip this step if you want measurements without AI grading for now.)

## Step 3 — Configure RoofScout

1. In the `roofscout` folder, copy `.env.local.example` to `.env.local`.
2. Paste your keys in.
3. Restart the dev server.

The banner at the top of the app flips from amber ("Demo mode") to green ("Live mode") when
the Google key is detected.

## Step 4 — Run a live scan

Zoom the scan map to a real neighborhood (works best in areas with Google Solar coverage —
most US metro areas) and click **Scan visible area**. Live scans take longer than demo scans
(~5–30 seconds) because each rooftop is measured, photographed, and graded.

## Cost control

- `ROOFSCOUT_MAX_BUILDINGS` caps rooftops per scan (default 15).
- `ROOFSCOUT_VISION_MODEL=claude-haiku-4-5` cuts grading cost ~5x.
- Rooftops without Solar API coverage are skipped automatically (no charge for grading).
- The support chat widget (bottom-right on every page) reuses `ANTHROPIC_API_KEY` and defaults
  to `claude-haiku-4-5`; override with `ROOFSCOUT_SUPPORT_MODEL`. It's anonymous and stateless
  (no per-user rate limiting), so abuse control is a hard 16-message cap per browser session —
  add real per-IP throttling before this gets meaningful public traffic.

## Compliance notes

- Do not cold-call leads without scrubbing numbers against the federal Do-Not-Call registry
  (TCPA). Door-knocking and direct mail are safer channels for this data.
- Keep this tool behind a login before deploying it anywhere public (auth is milestone M4).
- Owner data, when connected, is public county record — but treat it carefully anyway.
