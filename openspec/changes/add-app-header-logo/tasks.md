## 1. Add Logo Asset Import

- [ ] 1.1 Import `logo-kanban-flight-sim.svg` as a URL string in `src/App.tsx` using Vite's module import (`import logoUrl from './assets/logo-kanban-flight-sim.svg'`)

## 2. Render App Header

- [ ] 2.1 Add a header `<div>` as the first child inside the root `<div>` in `App.tsx`, before the config error banner and controls bar
- [ ] 2.2 Inside the header `<div>`, render an `<img>` element with `src={logoUrl}`, an appropriate `alt` attribute, and explicit `height` (e.g., `28`) to pin the logo size
- [ ] 2.3 Inside the header `<div>`, render an `<h1>` element with the text "Kanba-Flight-Sim", styled with inline CSS to match the dark theme (white/light text, no default margin)
- [ ] 2.4 Style the header `<div>` with inline CSS: `display: flex`, `alignItems: center`, `gap`, and snug vertical padding consistent with the existing layout
