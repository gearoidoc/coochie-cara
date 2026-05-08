# Coochie Cara

A private, local-first PWA period tracker. Built for personal use by me and my partner — not for distribution, not for the App Store, not a product.

## What it does

- Log period days, flow level, and spotting (with mid-cycle spotting tracked separately from period spotting)
- Track symptoms from a configurable list, plus free-text notes
- Calendar view with day-cell indicators for flow, spotting, symptoms, and notes
- Cycle predictions based on your own logged history (not a population average)
- Insights screen with median cycle/period length, regularity, and bar charts of cycle and period length over time
- Birth control log (date-ranged entries — pill, implant, hormonal IUD, copper IUD)

## What it deliberately doesn't do

- **No backend.** All data lives in your browser's IndexedDB. Nothing syncs anywhere.
- **No accounts, no login, no cloud.** If you clear browser storage, your data is gone. Export is on the roadmap.
- **No fertile window or ovulation predictions.** Estimating ovulation from cycle history alone is unreliable enough that surfacing it would be misleading. The app sticks to what it can actually predict from data: when your next period is likely to start, and how long it's likely to last.
- **No phase labels** (follicular, luteal, etc.). Same reason — naming phases requires the same ovulation math we opted out of.
- **No notifications, reminders, or daily check-in prompts.** Open the app when you want to log something.
- **Birth control data does not influence predictions.** The BC tab is a log, not an input. Predictions are natural-cycle only regardless of what method is logged as active.
- **No third-party analytics, telemetry, or tracking.** Nothing leaves your device.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v3
- Dexie (IndexedDB wrapper) + dexie-react-hooks for live queries
- date-fns for date math
- react-router-dom
- vite-plugin-pwa for service worker and manifest
- Vitest for the prediction engine tests
- Hand-rolled SVG for charts (no charting library)

Hosted on GitHub Pages, deployed via GitHub Actions on push to `main`.

## Architecture notes

- **Local-first.** All data is in IndexedDB. There is no server.
- **Days are the unit of storage.** Each day is keyed by a `YYYY-MM-DD` string. Cycles are derived from day records on read, never stored.
- **URL is the source of truth for date navigation.** The Today screen reads `:date?` from the route; calendar taps push to a date URL.
- **Predictions are pure functions over the day-record set.** No cached state, no stored predictions. Recomputed on every render. The engine lives in `src/lib/predictions.ts` with a Vitest suite covering cycle detection, filtering, and confidence tiers.
- **Cycles anchor on `onPeriod=true` only.** Mid-cycle spotting (`onPeriod=false, flow='spotting'`) does not reset cycle counts. This is enforced and commented in the prediction engine.
- **Confidence is explicit.** Below 2 completed cycles, no predictions are shown at all. Between 2-3 cycles, predictions show a "low confidence" label. Above 4 cycles, the label depends on cycle variance.

## Status

- Phase 1: scaffold ✅
- Phase 2: entry experience ✅
- Phase 3: calendar view ✅
- Phase 4: predictions ✅
- Phase 5: insights ✅
- Phase 6: export and polish — planned

## Running locally

```bash
npm install
npm run dev
```

Tests:

```bash
npm test
```

Build:

```bash
npm run build
```

## License

No license. All rights reserved. This is a personal project, not open source. You're welcome to read the code for ideas; please don't redistribute or repackage it.
