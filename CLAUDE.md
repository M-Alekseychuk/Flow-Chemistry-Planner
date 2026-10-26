# Claude & Assistant Developer Guide (`CLAUDE.md`)

This guide provides core context and development commands for working with the **Flow Chemistry Designer** codebase.

---

## Commands

- **Development Server**: `npm run dev` (starts Vite on port `3000`, host `0.0.0.0`)
- **Type Checking / Lint**: `npm run lint` (`tsc --noEmit`)
- **Production Build**: `npm run build` (`vite build`)
- **Boundary Verification**: `bash scripts/check-boundaries.sh`

---

## Architectural Principles

1. **Reactive Flow Diagramming**: Built on top of `@xyflow/react`. Nodes communicate with `AppContext` to synchronize domain data, while edges calculate real-time pressure drops and residence times via `runSimulation()`.
2. **Synchronized State**: The sidebar **Feed Solutions (Reagents)** table and canvas feed modules are bi-directionally synchronized. Modifying one updates the other in real time.
3. **No External Backend**: Zero database requirement. Projects and custom module templates persist in `localStorage` and can be saved/restored via JSON schema exports.
4. **Publication-Ready Exports**: Uses `jspdf` to create clean, branded PDF experimental summaries with custom logos, BOM tables, and process parameters.

---

## Code Style & Conventions

- **Language**: TypeScript (strict mode enabled in `tsconfig.json`).
- **Styling**: Tailwind CSS v4 (configured via `@import "tailwindcss";` in `src/index.css`). Use Tailwind utility classes for all styling; avoid separate CSS files.
- **Icons**: `lucide-react` only. Do not mix other icon libraries.
- **Components**: Functional components with hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Inputs**: Use the standard `NodeInput` helper for interactive inputs on canvas nodes to handle formatting, decimal numbers, and auto-sizing consistently.
- **Colors**: Use Tailwind palette conventions (`emerald` for chemistry branding, `slate` for neutral surfaces). Maintain dark mode compatibility with `dark:` variants.
