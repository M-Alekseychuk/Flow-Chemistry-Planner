# State Reference & Active Context

## Active Version: `v1.1`

## Key Runtime State
- **Storage Strategy**: Pure client-side `localStorage` caching with full JSON export / import capabilities.
- **Port & Host**: Runs on port `3000` via Vite (`0.0.0.0`).
- **No External Database Required**: Zero backend database requirement; all data is contained in local JSON and memory.
- **Dark Mode**: Supports dark and light modes, toggled via header and persisted in `localStorage('flow-darkmode')`.
- **Canvas Viewport**: Automatically captured and restored on project switch.

## Verification Checklist
- [x] Feed solution two-way synchronization operational (sidebar &harr; canvas).
- [x] Stream color switch operational with accessible uniform mode.
- [x] JSON import moved to main menu Dashboard.
- [x] Custom modules persist and load correctly into sidebar on JSON import.
- [x] Procedure report decommissioned cleanly.
- [x] PDF export fully functional with custom branding and setup photo attachment.
- [x] TypeScript compiler (`tsc --noEmit`) passes with 0 errors.
