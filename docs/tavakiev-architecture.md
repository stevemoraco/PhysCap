# Tavakiev Solar Experience Architecture

## Goals
- Deliver WebGPU-class interactive manufacturing visualization with photoreal gold/emerald aesthetics.
- Support fallback to existing Three.js scene when WebGPU is unavailable.
- Integrate 500k-word Tavakiev data lake into citeable, navigable knowledge panels.
- Gather rich telemetry (3D interactions, CTA usage, dwell) and wire into personalization + AI reporting.
- Capture spoken investor feedback with transcripts stored in Postgres and surfaced in dashboards.
- Provide complete test coverage (unit, integration, e2e) for critical flows.

## Frontend Structure
- `components/experiences/SolarManufacturingExperience.tsx`
  - Detect WebGPU support (`navigator.gpu`).
  - Initialize TypeGPU pipeline with HDR environment map, caustic shader, adaptive render resolution.
  - Mirror orientation + touch to camera parallax; integrate CTA overlay for each production stage.
  - Expose events via callback for telemetry hook.
- `components/experiences/SolarManufacturingFallback.tsx`
  - Wrap existing Three.js implementation (renamed from `SolarManufacturing3D`).
- `components/tavakiev/*`
  - `NarrativeTimeline` renders business plan sections with citations, knowledge graph viewer, CTA per milestone.
  - `FinancialStack` charts IRA credit stack (Recharts) with hover tooltips referencing dataset.
  - `RiskNavigator` consumes risk data lake slices and exposes filters, search, citations.
- `components/feedback/VoiceCapture.tsx`
  - Web Speech API + MediaRecorder fallback.
  - Streams transcript to backend for persistence + analysis.

## Data Flow
- New Drizzle tables: `user_profiles` (extended metadata), `feedback_transcripts`, `interaction_events` (rich metadata JSONB), `tavakiev_sources` (ingested documents).
- Background ingestion pipeline placeholder (`scripts/ingest-tavakiev.ts`) to load dataset once provided.
- API routes:
  - `POST /api/users/profile` upsert profile attributes.
  - `POST /api/feedback/voice` accept transcript + audio asset reference.
  - `POST /api/interactions/batch` for aggregated events.
  - `GET /api/tavakiev/sections` serve structured narrative with citations.

## Personalization
- On first authenticated visit, present profile modal capturing profession, expertise, goals.
- Store profile; drive conditional rendering (copy, recommended CTAs, hero messaging).
- Add `PersonalizationContext` to surface profile + computed segments across app.

## Telemetry & Analytics
- Extend `useInteractionTracking` to track:
  - CTA clicks w/ context.
  - 3D focus events (`objectId`, dwell duration).
  - Narrative section expansions, risk filters, downloads.
- Batch events to reduce network chatter.
- Dashboard activity tab shows new event types with icons.

## Testing Strategy
- Unit: Vitest for hooks (auth, personalization, telemetry), service utilities, API route handlers (via supertest).
- Component: React Testing Library for feedback modal, profile modal, narrative timeline.
- E2E: Playwright flows covering landing -> login -> profile completion -> voice feedback -> report generation.
- Visual regression: Playwright screenshot baseline for hero + Tavakiev sections.
- CI script `npm run test:e2e` (serial) + `npm run test:unit`.

## Deployment Notes
- Ensure WebGPU fallback to WebGL.
- Provide feature detection gating to avoid crashes on unsupported devices.
- Document ingestion script expectations for future data drop.
