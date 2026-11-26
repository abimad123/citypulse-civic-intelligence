# CityPulse AI — Project Rules & Architecture

## Domain & Categories (Strict)
Use these exact 5 civic categories and default municipal departments:
1. `Pothole` -> `Roads & Public Works`
2. `Garbage Accumulation` -> `Sanitation & Solid Waste`
3. `Damaged Streetlight` -> `Electrical & Street Lighting`
4. `Water Leakage` -> `Water Supply & Pipelines`
5. `Drainage Problem` -> `Drainage & Sewerage`

## 8-Stage Ticket Lifecycle
`Submitted` -> `AI Analyzed` -> `Authority Verified` -> `Assigned to Field` -> `In Progress` -> `Verification Uploaded` -> `Resolved` -> `Closed`

## Technical & Library Rules
- Frontend lives in `frontend/` (React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui).
- Preserve the shadcn CSS variables already generated in `frontend/src/index.css` when adding custom theme tokens or fonts.
- For MapLibre with `react-map-gl` v8+, always import from `react-map-gl/maplibre` and import `'maplibre-gl/dist/maplibre-gl.css'`.
- Design language: Linear/Vercel-grade minimalist precision. 1px borders (`border-slate-200`), zero heavy drop shadows, `JetBrains Mono` with `tabular-nums` for ticket IDs, GPS coordinates, confidence scores, and SLA timers.
- Every AI classification must show a confidence score and support Human-in-the-Loop (HITL) Confirm or Override with an immutable audit log entry.
- Keep mock datasets realistic to Ludhiana, Punjab wards (Model Town, Sarabha Nagar, Dugri, Gill Road, Focal Point, Civil Lines) including English + Hinglish code-mixed descriptions.
