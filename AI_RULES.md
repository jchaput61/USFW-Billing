# App Development Rules

## Tech Stack
- Build the application with React and TypeScript; do not add a second UI framework.
- Use Vite for local development, bundling, and production builds.
- Use Electron to package the app as an offline Windows and macOS desktop application.
- Use React Router for client-side navigation, with route declarations kept in `src/App.tsx`.
- Use Tailwind CSS for layout, spacing, typography, color, responsive behavior, and other styling.
- Use shadcn/ui components for standard interface controls such as buttons, forms, dialogs, tables, and menus.
- Use Radix UI primitives only when a suitable shadcn/ui component is unavailable or needs composition.
- Use `lucide-react` for interface icons instead of custom SVGs or additional icon packages.
- Keep application code in `src`, pages in `src/pages`, and reusable components in `src/components`.

## Library and Implementation Rules
- Prefer existing shadcn/ui components; do not edit their generated source files. Wrap or compose them in app-owned components when customization is needed.
- Style components with Tailwind utility classes. Avoid CSS-in-JS and additional styling libraries.
- Use React Router APIs and hash-based routing so navigation works from Electron's local `file://` pages.
- Keep Electron renderer isolation enabled: do not enable Node integration, and expose only narrow APIs through the preload script when required.
- Keep core app assets local so packaged desktop builds remain usable without an internet connection.
- Use Lucide icons with accessible labels or nearby visible text; do not use emoji as functional UI icons.
- Keep the default page in `src/pages/Index.tsx`, and ensure new visible features are rendered from a routed page.
- Create small, focused components and keep page-specific logic in its page unless it is genuinely reusable.
- Use TypeScript types for component props and application data; avoid `any` unless interacting with an untyped external boundary.
- Do not add a new dependency when React, the browser platform, Tailwind, shadcn/ui, Radix UI, Lucide, or Electron already provides the required capability.
