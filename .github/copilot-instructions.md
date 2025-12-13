---
applyTo: "**"
---

# copilot-instructions.md

## Role & Goal

You are GitHub Copilot working on a **client-side SPA**. Your goal is to implement features **strictly following the project architecture** (Layouts / Pages / UI Components / Data loaders / Lib utilities) and the custom **Router**. Do not invent new architectural patterns.

---

## Mandatory project architecture

Follow this folder responsibility split:

- `layouts/` = reusable page structure (header/footer/sidebar) using `<slot>` placeholders
- `pages/` = route-level pages (one folder per route), can be static or dynamic
- `ui/` = reusable UI components (render-only; reusable; can be static/dynamic)
- `data/` = data loaders (fetching / API calls)
- `lib/` = shared utilities (router, utils, animations, helpers)
- `main.js` = route + layout registration & router start

Use the same patterns described in the docs: layouts + pages + UI components + slots + DocumentFragments.

---

## Router rules (must follow)

### Route registration

Use:

- `router.addRoute(path, handler, options)`
- `router.addLayout(pathPrefix, layoutFn)`
- `router.start()`

Define layouts first (from generic to specific), then routes, and define the `*` 404 route **last**.

### SPA navigation

All internal links must use `data-link` or they will reload the page. Example:

```html
<a href="/products" data-link>Produits</a>
```

Never generate internal navigation links without `data-link`.

### Dynamic routes

Use `:paramName` in paths and accept a `params` object in handlers:

```js
router.addRoute("/products/:id", ProductDetailPage);

export function ProductDetailPage(params) {
  // params.id
}
```

### Layout selection

Router chooses the layout with the **longest matching prefix**. Do not implement your own layout logic.

### Auth guards

If a route is protected, register it with `{ requireAuth: true }`. Router handles redirect to `loginPath`. Do not re-implement auth redirects manually.

---

## Layouts requirements (`layouts/`)

### Layouts MUST:

1. Return a **DocumentFragment**
2. Contain a default `<slot></slot>` where the page content goes
3. Replace named slots like `<slot name="header"></slot>` with UI components

Example pattern:

- `layouts/root/template.html`
- `layouts/root/layout.js` uses `htmlToFragment()` and replaces named slots with `HeaderView.dom()` etc.

Do not put page-specific logic inside layouts.

---

## Pages requirements (`pages/`)

### Static pages

Return the HTML template string as-is (simple pages).

### Dynamic pages (MANDATORY MVC pattern)

Dynamic pages MUST follow the MVC pattern:

- `M` (Model): state/data storage
- `C` (Controller): init + event handlers + orchestration
- `V` (View): DOM creation + event binding

Use this strict split:

- `V.createPageFragment()` creates a fragment using `htmlToFragment(template)`
- replace `<slot name="...">` with UI component DOM
- `V.attachEvents(fragment)` attaches event listeners
- `C.init()` loads data via a loader in `data/` then returns `V.init(...)`

Keep handlers named like `handler_clickSomething`.

Pages should return **DocumentFragment** for complex pages. Prefer fragments over raw HTML for anything interactive.

---

## UI components requirements (`ui/`)

Every UI component must expose:

- `html(data)` → returns HTML string
- `dom(data)` → returns DocumentFragment (via `htmlToFragment`)

Dynamic UI components must use the template placeholder pattern `{{key}}` and render via the existing renderer utility (e.g., `genericRenderer`).

UI components must be **render-only**:

- no routing logic
- no data fetching
- no global state
- no direct DOM insertion into `#app` (router owns rendering)

---

## Data loaders (`data/`)

All fetching / API calls go into `data/*.js` loaders (example `ProductData.fetchAll()`). Pages call data loaders; UI never fetches.

---

## Lib utilities (`lib/`)

### Required utilities usage

- Convert HTML string → fragment with `htmlToFragment()`
- Use the renderer helper for `{{placeholders}}` (e.g., `genericRenderer`)
  Do not create alternative template engines.

### Animations (MANDATORY)

All animations must be implemented with **GSAP** and centralized in:

- `lib/animations.js`

Rules:

1. Do not scatter GSAP code across pages/components.
2. Export named functions from `lib/animations.js` like:
   - `animatePageEnter(rootEl)`
   - `animateListItems(containerEl)`
   - `animateModalOpen(modalEl)`

3. Pages/components only _call_ these functions in `V.init()` or `V.attachEvents()`.
4. Avoid hard-coding selectors inside animation functions when possible; pass elements in.

Example structure:

```js
// lib/animations.js
import { gsap } from "gsap";

export function animatePageEnter(rootEl) {
  gsap.from(rootEl, { opacity: 0, y: 8, duration: 0.4 });
}
```

---

## Slots usage rules

Use slots as the only supported composition mechanism between layout/page/components:

- Layout templates use `<slot name="header"></slot>`, `<slot></slot>`, `<slot name="footer"></slot>`
- Page templates can use named slots (e.g. `<slot name="products"></slot>`) and replace them with UI component DOM

Replacement pattern:

```js
pageFragment.querySelector('slot[name="products"]').replaceWith(productsDOM);
```

---

## Output & return types (STRICT)

Route handlers may return:

- HTML string, or
- DocumentFragment

For interactive pages, always return a DocumentFragment. Router supports Promises; async handlers are allowed.

---

## Error handling (async pages)

All async handlers must use try/catch and return a user-friendly fallback HTML/fragment if loading fails.

---

## Naming & style conventions

- Event handlers: `handler_*`
- Keep DOM creation separate from event binding (`V.createPageFragment` vs `V.attachEvents`)
- Do not mutate the DOM outside fragments before returning them (build fragment → attach events → return fragment).

---

## Router integration checklist (before final code)

When generating any feature:

1. If new route → add it in `main.js` using `router.addRoute`
2. If route group needs shared structure → create a layout and register with `router.addLayout`
3. All internal links must contain `data-link`
4. If route is protected → `{ requireAuth: true }`
5. 404 route `*` must remain last

---

## Don’ts (hard rules)

- Do not introduce frameworks (React/Vue/etc.). This is a vanilla modular SPA.
- Do not bypass the router by calling `window.location = ...` for internal navigation.
- Do not fetch data in UI components.
- Do not duplicate routing, layout selection, slot replacement logic.
- Do not implement animations outside `lib/animations.js` (GSAP only).
