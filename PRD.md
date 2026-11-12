# CalcLens: Product Requirements Document (PRD)
 
**Version:** 1.1 · **Type:** Full-stack web app · **Status:** Ready to build
**One-line pitch:** Type or snap a photo of a calculus problem and instantly see its graph (2D or 3D) with the slope (tangent) line, for ordinary and partial derivatives.
 
---
 
## 0. Read this first (rules for Antigravity)
 
**Antigravity does everything.** Scaffolding, `npm install`, shadcn/ui setup, writing code, creating files, running builds and dev servers. The human's **only** job is to **paste the Gemini API key** into `server/.env`.
 
| Who | Does what |
|---|---|
| **Antigravity (agent)** | All commands (Section 10), all code, all files, builds, dev servers, local git commits |
| **Human** | Pastes the Gemini API key into `server/.env`. That is the only required manual step |
 
**Rules for Antigravity:**

1. **main folder CalcLens** i already made the main folder dont make a new project base folder 
2. **Run all commands yourself:** `npm create vite`, `npm install`, `npx shadcn@latest init` / `add`, builds, and dev servers.take permissiom before running any command.
3. **API key handling:** create `server/.env` yourself with the placeholder line `GEMINI_API_KEY=PASTE_YOUR_KEY_HERE`. Never ask for the key in chat, and never read, print, log, or commit the real key. When the code is ready, tell the human: *"Open `server/.env` and paste your Gemini API key."* The server must detect the missing or placeholder key and print that same instruction in the console.
4. **Do not delete or overwrite existing files** in this folder (like `PRD.md`, `README.md`, `docs/`) without telling the human first.
5. **Do not `git push` or deploy** unless the human asks. Local `git add` and `git commit` are fine.
6. **UI uses shadcn/ui + lucide-react + Tailwind CSS v4** (Section 6). Do not hand-build components that shadcn already provides.
7. Build **phase by phase** (Section 16). After each phase, summarize what was done and what to check, then continue to the next phase unless something is blocked.
8. Match the visuals in `docs/ui-preview.png`, `docs/ui-2d.png`, and `docs/ui-3d.png` (Google Stitch exports). If the human attaches Stitch screenshots in the chat and these files do not exist, save them into `docs/` with those names. If the PRD and the images disagree on layout, the images win. If they disagree on behavior, the PRD wins.
---
 
## 1. Product overview
 
### 1.1 Problem
Students understand derivatives much faster when they can *see* the slope, but most graphing tools need the equation typed in a special syntax and rarely show partial derivatives in 3D. Handwritten problems from a notebook or textbook must be re-typed by hand.
 
### 1.2 Solution
CalcLens lets the user:
1. Enter a function by **typing** it or **uploading an image** of it (handwritten or printed).
2. See the **graph**: 2D curve for one variable, 3D surface for two variables.
3. See the **slope line** at a point the user can move with sliders:
   - Ordinary derivative: tangent line.
   - Partial derivatives: ∂f/∂x line, ∂f/∂y line, and the tangent plane.
4. See the derivative formula in proper math notation and its numeric value at the chosen point.
### 1.3 Goals
- Image or text to graph in under 5 seconds on a normal connection.
- Slope lines update smoothly while dragging a slider (no visible lag).
- Clean, calm UI where the graph is the hero.
### 1.4 Non-goals (version 1)
- More than two variables.
- Implicit equations (for example `x² + y² = 1`) and parametric curves.
- Integrals (that is a separate project).
- User accounts, database, or saved projects on a server.
### 1.5 Target users
College and high-school students learning differential calculus and multivariable calculus; teachers who want a quick demo for class.
 
---
 
## 2. User flow
 
1. User opens the app and sees the **Main workspace** with an empty graph state.
2. User picks **Type equation** or **Upload image**.
3. *(Image path)* The image is sent to the backend, Gemini extracts the equation, and the app shows a **Detected equation** card (rendered math, editable).
4. App detects the number of variables:
   - 1 variable means **2D mode**.
   - 2 variables means **3D mode**.
5. User presses **Visualize**.
6. Graph appears with the point and slope line(s). User drags sliders to move the point; slope lines and values update live.
7. User can toggle lines, open "Show steps", switch light/dark theme.
---
 
## 3. Functional requirements
 
Priority: **P0** = must have for the demo, **P1** = should have, **P2** = nice to have.
 
### 3.1 Input
 
| ID | Priority | Requirement |
|---|---|---|
| F1 | P0 | Text input with quick-insert buttons: `x²`, `√`, `sin`, `cos`, `ln`, `π`, `^` |
| F2 | P0 | Image upload: drag and drop and click to browse. Accepts PNG, JPG, WEBP, max 5 MB |
| F3 | P0 | **Detected equation** card: shows the extracted function in rendered math (KaTeX) with an **Edit** button so the user can correct mistakes before plotting |
| F4 | P0 | Auto-detect 2D or 3D from the number of free variables |
| F5 | P1 | If typed text fails to parse, show a **Fix with AI** button that sends the text to Gemini for normalization |
| F6 | P1 | Paste image from clipboard (Ctrl+V) |
 
### 3.2 Graphing and slope
 
| ID | Priority | Requirement |
|---|---|---|
| F7 | P0 | 2D mode: plot `y = f(x)` with a highlighted point and an orange tangent line |
| F8 | P0 | 3D mode: plot the surface `z = f(x, y)` with a marked point, ∂f/∂x line, ∂f/∂y line |
| F9 | P0 | Slider(s) to move the point: one slider (x) in 2D, two sliders (x, y) in 3D. Update live |
| F10 | P0 | Show derivative formula (KaTeX) and its value at the point. Info chip near the point: `x = 1.5, f(x) = 2.25, slope = 3` |
| F11 | P1 | 3D toggles: show ∂f/∂x line, show ∂f/∂y line, show tangent plane |
| F12 | P1 | Derivative selector (segmented control): **Ordinary dy/dx**, **Partial ∂/∂x**, **Partial ∂/∂y** (see Section 5.4 for behavior) |
| F13 | P1 | Collapsible **Show steps** section with a Gemini-written explanation |
| F14 | P1 | Light and dark theme toggle |
| F15 | P1 | Advanced: change the plotting range |
| F16 | P2 | Export graph as PNG |
| F17 | P2 | Recent equations history (localStorage) |
 
### 3.3 States
Empty, loading (`Reading your equation...`), ready, error (`Couldn't read that, try editing it manually`). See Section 14.
 
---
 
## 4. UI / UX specification
 
Designed in Google Stitch. Reference images are in `docs/`. The UI is built with **shadcn/ui components**, **lucide-react icons**, and **Tailwind CSS v4**.
 
### 4.1 Design tokens (shadcn CSS variables)
 
shadcn uses CSS variables in `client/src/index.css`. After `shadcn init`, set these (and add one custom token for the slope color):
 
| Token | Value | Used for |
|---|---|---|
| `--primary` | Indigo `#4F46E5` | Buttons, curve/surface accent, active tabs |
| `--slope` (custom) | Orange `#F97316` | Tangent line, slope lines, point highlight |
| `--background` (light) | `#F8FAFC` | Page |
| `--card` (light) | `#FFFFFF` | Cards, panels |
| `--background` (dark, `.dark`) | `#0F172A` | Page |
| `--card` (dark, `.dark`) | `#1E293B` | Cards, panels |
| `--radius` | `0.75rem` | Cards, inputs, buttons |
| Fonts | Inter (UI), JetBrains Mono (equations and code) | |
 
Expose the custom token to Tailwind v4 so `bg-slope`, `text-slope`, and `border-slope` work:
 
```css
:root { --slope: #F97316; }
@theme inline { --color-slope: var(--slope); }
```
 
If Stitch's final design uses slightly different colors, **use the Stitch colors** and keep the same token structure.use stitch 2d 3d design with good css art and structure
### 4.2 Which shadcn component is used where
 
| UI element | shadcn component |
|---|---|
| Input tabs (Type equation / Upload image) | `Tabs` |
| Math text box | `Textarea` or `Input` |
| Buttons (Visualize, quick-insert, theme toggle, Edit) | `Button` |
| Left panel, Detected equation card, result cards | `Card` |
| Derivative selector (segmented control) | `ToggleGroup` |
| Point sliders | `Slider` |
| 3D toggles (∂f/∂x, ∂f/∂y, tangent plane) | `Switch` + `Label` |
| Show steps | `Collapsible` |
| Errors and "please check this equation" notes | `Alert` |
| Mode label (`2D`, `3D`), `approximate` tag | `Badge` |
| Loading state | `Skeleton` |
| Icon button hints | `Tooltip` |
| Toasts (network errors, copy, etc.) | `Sonner` |
| Dividers | `Separator` |

**Note** use shadcn as per requirement for ui
 
### 4.3 Icons (lucide-react)
Use `lucide-react` everywhere. Suggested: `Upload`, `ImageIcon`, `Sparkles` (Fix with AI), `Sun` / `Moon` (theme), `Pencil` (Edit), `ChevronDown` (steps), `TriangleAlert` (errors), `Info`, `RotateCcw` (reset), `Download` (export), `Calculator` or `Sigma` (logo).
 
### 4.4 Layout
 
**Main workspace (desktop)**
- Top navbar: logo `CalcLens` on the left; theme toggle and "How it works" link on the right.
- Left panel (about 30 percent): input tabs, math input or upload zone, Detected equation card, derivative selector, **Visualize** button.
- Right panel (about 70 percent): the graph area (hero). Empty state shows a faint grid and the text `Your graph will appear here`.
**2D result**
- Smooth curve, highlighted point, orange tangent line.
- Floating chip at the point with `x`, `f(x)`, `slope`.
- Slider `Move point (x)`, zoom and reset toolbar.
- Result card: `f'(x) = ...` in KaTeX and a collapsible **Show steps**.
**3D result**
- Rotatable surface with a color gradient and axes x, y, z.
- Marked point with two orange slope lines and an optional semi-transparent tangent plane.
- Two sliders (x and y). Three toggle switches.
- Two result cards side by side: `∂f/∂x = ...` and `∂f/∂y = ...` with values at the point.
**Mobile**
- Stacked: input, then graph, then sliders, then result cards.
---
 
## 5. Math specification
 
### 5.1 Input forms the app must accept (examples)
 
| User input | Mode |
|---|---|
| `x^2` | 2D |
| `sin(x) + x^3` | 2D |
| `x^2*y + sin(y)` | 3D |
| `exp(x)*cos(y)` | 3D |
| Image of `f(x,y) = x² + y²` | 3D |
 
### 5.2 Input normalization (frontend, `normalizeInput.js`)
Before parsing, convert common symbols to math.js syntax:
`²` to `^2`, `³` to `^3`, `π` to `pi`, `√(` to `sqrt(`, `×` to `*`, `÷` to `/`, `ln(` to `log(` (math.js `log` is the natural log), strip a leading `y =`, `z =`, `f(x) =`, `f(x,y) =`.
 
### 5.3 Variable detection (`parseExpression.js`)
- Parse with math.js. Collect `SymbolNode`s that are **not** function names and **not** constants (`pi`, `e`, `tau`).
- Tip: `node.filter((n, path) => n.isSymbolNode && path !== 'fn')`.
- Sort variables alphabetically, but prefer `x` before `y`.
- 0 variables: error `NO_VARIABLE`. 1 variable: 2D. 2 variables: 3D. More than 2: error `TOO_MANY_VARIABLES`.
- Use `math.compile(expression)` **once** and reuse it for all sampling.
### 5.4 Derivative behavior
 
| Mode | Selector options | Behavior |
|---|---|---|
| 2D (1 variable) | Only **Ordinary dy/dx** is enabled. Others are disabled | Tangent line at point `a` |
| 3D (2 variables) | **Partial ∂/∂x** and **Partial ∂/∂y** are enabled. Ordinary is disabled | The selected partial is highlighted (its slope line and result card are emphasized). The other partial is still drawn if its toggle is on. Default: both lines on |
 
### 5.5 Formulas
 
Let the chosen point be `a` (2D) or `(a, b)` (3D).
 
**Ordinary derivative (2D)**
- Slope: `m = f'(a)`
- Tangent line: `y = f(a) + f'(a)(x − a)`
- Draw it as a line across the visible x-range.
**Partial derivatives (3D)**
- `fx = ∂f/∂x (a, b)`, `fy = ∂f/∂y (a, b)`
- ∂f/∂x line (y held at `b`): points `(a + t, b, f(a,b) + fx·t)` for `t ∈ [−L, L]`, direction vector `(1, 0, fx)`.
- ∂f/∂y line (x held at `a`): points `(a, b + t, f(a,b) + fy·t)` for `t ∈ [−L, L]`, direction vector `(0, 1, fy)`.
- Tangent plane: `z = f(a,b) + fx(x − a) + fy(y − b)`, drawn over `[a−L, a+L] × [b−L, b+L]`, opacity about 0.35.
- `L` is about 25 percent of the visible range.
**Symbolic derivative**
- Use `math.derivative(expr, 'x')` (and `'y'` for the second partial). Display with `.toTex()` and evaluate with `.evaluate({x: a, y: b})`.
- If math.js cannot differentiate symbolically, fall back to the **central difference** `(f(a+h) − f(a−h)) / 2h` with `h = 1e-5`, and show a `approximate` badge.
### 5.6 Sampling
- 2D: 400 points across `x ∈ [−10, 10]` (default).
- 3D: 60 × 60 grid across `x, y ∈ [−5, 5]` (default).
- Replace `NaN` or `Infinity` values with `null` so Plotly leaves a gap and does not crash (for example `1/x`, `log(x)`, `sqrt(x)` outside their domain).
- If the point lies outside the function's domain, show a friendly message and keep the last valid point.
---
 
## 6. Tech stack and frameworks
 
| Layer | Choice |
|---|---|
| Frontend framework | **React** (with **Vite**), plain JavaScript |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite` plugin) |
| UI components | **shadcn/ui** (Radix-based, copied into `src/components/ui`) |
| Icons | **lucide-react** |
| UI utility packages | `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` |
| Theme (light/dark) | **next-themes** (works in Vite; also used by the shadcn `Sonner` component) |
| Math engine | **math.js** |
| Math rendering | **KaTeX** |
| Graphing (2D and 3D) | **Plotly.js** via `react-plotly.js` |
| Backend | **Node.js + Express** (ES modules) |
| AI (image to equation, steps) | **Google Gemini API** via `@google/genai`. Model name set by env var |
| Uploads | **multer** (memory storage, nothing saved to disk) |
| Hosting | Frontend on **Vercel** (or Netlify), backend on **Render** (or Railway) |
 
Why not Next.js: the app is a single interactive page and the backend is tiny. React + Vite + Express is simpler to run and deploy. The backend exists mainly to keep the Gemini API key secret.
 
**Runtime requirement:** Node.js 20 or newer.
 
---
 
## 7. Architecture and data flow
 
```
[Browser: React + Vite]
   |  1. user types equation  ----------------------------> parse locally with math.js
   |  2. user uploads image
   v
POST /api/extract (multipart)  -->  [Express]  -->  Gemini Vision
                                        |               |
                                        |   JSON { latex, expression, variables, intent }
   <------------------------------------+---------------+
   |
   v
normalize -> parse -> detect variables -> 2D or 3D
   |
   v
math.js: compile f, derivative(s)  ->  sample curve/surface  ->  compute slope line(s)/plane
   |
   v
Plotly renders graph  <--  sliders update the point (no server calls)
```
 
All math and plotting runs **in the browser**. The server is only used for Gemini calls.
 
**Client state shape**
 
```js
{
  rawInput: "",            // what the user typed or the extracted expression
  expression: "",          // normalized math.js expression
  latex: "",
  variables: [],           // ["x"] or ["x","y"]
  mode: "2d" | "3d" | null,
  derivativeMode: "ordinary" | "partial_x" | "partial_y",
  point: { x: 1, y: 1 },
  range: { x: [-10, 10], y: [-5, 5] },
  toggles: { dfdx: true, dfdy: true, plane: true },
  status: "idle" | "loading" | "ready" | "error",
  error: null | { code, message }
}
```
 
---
 
## 8. Packages
 
### 8.1 Client (`client/`)
 
| Package | Purpose |
|---|---|
| `react`, `react-dom` | UI (installed by the Vite template) |
| `vite`, `@vitejs/plugin-react` | Dev server and build (installed by the Vite template) |
| `tailwindcss`, `@tailwindcss/vite` | Styling |
| `shadcn` (CLI, run with `npx shadcn@latest`) | Adds shadcn/ui components and config |
| `@radix-ui/*`, `sonner` | Installed automatically by the shadcn CLI when components are added |
| `lucide-react` | Icons |
| `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` | shadcn utility packages |
| `next-themes` | Light/dark theme provider |
| `mathjs` | Parse, evaluate, differentiate |
| `katex` | Render math (use `katex.renderToString` in a small `MathDisplay` component, plus `import "katex/dist/katex.min.css"`) |
| `plotly.js-dist-min`, `react-plotly.js` | Graphs. Use the factory pattern to keep the bundle smaller (see Section 8.3) |
 
### 8.2 Server (`server/`)
 
| Package | Purpose |
|---|---|
| `express` | HTTP server |
| `cors` | Allow only the frontend origin |
| `dotenv` | Load `.env` |
| `multer` | Handle image uploads (memory storage) |
| `@google/genai` | Gemini API client |
| `express-rate-limit` | Prevent abuse and protect the API quota |
| `helmet` | Security headers |
| `nodemon` (dev) | Auto-restart in development |
 
### 8.3 Plotly in Vite (use this pattern)
 
```jsx
import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);
export default Plot;
```
 
Use `Plotly.react` style updates (pass new `data`, keep `layout` stable, set `revision`) so sliders do not rebuild the whole chart.
 
### 8.4 shadcn setup notes (JavaScript project)
 
- shadcn needs the `@/` import alias. Create `client/jsconfig.json`:
```json
  { "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }
```
- Add the alias and the Tailwind plugin in `client/vite.config.js`:
```js
  import path from "path";
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";
 
  export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  });
```
- `client/src/index.css` starts with `@import "tailwindcss";` (and `@import "tw-animate-css";` as added by shadcn init).
- In `components.json`, set `"tsx": false` so components are generated as `.jsx`.
- The `cn` helper lives in `src/lib/utils.js`:
```js
  import { clsx } from "clsx";
  import { twMerge } from "tailwind-merge";
  export function cn(...inputs) { return twMerge(clsx(inputs)); }
```
- The shadcn `Sonner` component imports `next-themes`. Wrap the app in `ThemeProvider` from `next-themes` (`attribute="class"`, `defaultTheme="system"`) and use its `useTheme` hook for the theme toggle.
- If shadcn setup keeps failing in plain JavaScript, the agent may switch the client to the `react-ts` Vite template and tell the human. Do not silently change languages otherwise.
---
 
## 9. Folder structure
 
The project root is **the folder that already exists** (the one that contains this `PRD.md`). Everything below goes **directly inside it**. Do not create an extra wrapper folder.
 
```
./                                   <- existing project folder (project root)
├── PRD.md
├── README.md
├── .gitignore                       # must include: node_modules, .env, dist
├── docs/
│   ├── ui-preview.png               # main Stitch screenshot (used in README)
│   ├── ui-2d.png
│   └── ui-3d.png
├── client/
│   ├── .env.example                 # VITE_API_URL=http://localhost:5000
│   ├── .env                         # created by the agent from the example
│   ├── components.json              # shadcn config (created by shadcn init)
│   ├── jsconfig.json                # "@/" alias
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css                # tailwind, shadcn variables, --slope token
│       ├── components/
│       │   ├── ui/                  # shadcn components (generated by the CLI)
│       │   ├── Navbar.jsx
│       │   ├── ThemeToggle.jsx      # next-themes + Sun/Moon icons
│       │   ├── InputPanel.jsx       # Tabs: Type equation | Upload image
│       │   ├── MathInput.jsx        # textarea + quick-insert buttons
│       │   ├── ImageUpload.jsx      # drag-and-drop zone, preview, clipboard paste
│       │   ├── EquationPreview.jsx  # "Detected equation" card, KaTeX, Edit button
│       │   ├── DerivativeSelector.jsx  # ToggleGroup
│       │   ├── Graph2D.jsx          # curve + tangent line + point
│       │   ├── Graph3D.jsx          # surface + partial lines + tangent plane
│       │   ├── PlotlyChart.jsx      # Plotly factory wrapper (Section 8.3)
│       │   ├── PointSliders.jsx     # Slider
│       │   ├── Toggles3D.jsx        # Switch + Label
│       │   ├── ResultCards.jsx      # derivative formulas and values
│       │   ├── StepsPanel.jsx       # Collapsible explanation
│       │   ├── MathDisplay.jsx      # KaTeX renderer
│       │   ├── EmptyState.jsx
│       │   ├── LoadingState.jsx     # Skeleton
│       │   └── ErrorState.jsx       # Alert
│       ├── lib/
│       │   ├── utils.js             # cn() helper (shadcn)
│       │   ├── normalizeInput.js    # symbols -> math.js syntax
│       │   ├── parseExpression.js   # compile, detect variables, 2D or 3D
│       │   ├── derivatives.js       # symbolic + numeric fallback
│       │   ├── sampleFunction.js    # 2D points, 3D grid, NaN -> null
│       │   └── tangent.js           # tangent line, partial lines, tangent plane
│       ├── hooks/
│       │   └── useCalculus.js       # main state and actions
│       └── services/
│           └── api.js               # extractFromImage, extractFromText, explain
└── server/
    ├── .env.example                 # see Section 11
    ├── .env                         # created by the agent; the HUMAN pastes the API key here
    ├── package.json
    └── src/
        ├── index.js                 # app setup, helmet, cors, routes, listen
        ├── config/
        │   └── env.js               # reads and validates env vars
        ├── routes/
        │   ├── extract.routes.js    # POST /api/extract, POST /api/extract-text
        │   ├── explain.routes.js    # POST /api/explain
        │   └── health.routes.js     # GET /api/health
        ├── controllers/
        │   ├── extract.controller.js
        │   └── explain.controller.js
        ├── services/
        │   └── gemini.service.js    # all Gemini calls live here
        ├── prompts/
        │   ├── extractEquation.js   # system prompt (Section 13)
        │   └── explainSteps.js
        └── middleware/
            ├── upload.js            # multer: memory storage, 5 MB, image types only
            ├── rateLimit.js
            └── errorHandler.js
```
 
---
 
## 10. Setup commands (run by Antigravity)
 
Antigravity runs these itself, from the **project root** (the current folder). Adapt shell syntax to the operating system. If a command prompts for choices, pick **React** and **JavaScript**, and do not start the dev server from the prompt.
 
### Step 0: Check where you are
Confirm `PRD.md` is in the current folder. This is the project root. Do not create another project folder.
```bash
node -v        # must be v20 or higher
npm -v
git --version
```
If the folder is not a git repo yet, run `git init`. Create `docs/` if it does not exist.
 
### Step 1: Client (React + Vite + Tailwind + shadcn/ui)
```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install tailwindcss @tailwindcss/vite
npm install lucide-react class-variance-authority clsx tailwind-merge tw-animate-css next-themes
npm install mathjs katex plotly.js-dist-min react-plotly.js
```
Then configure the `@/` alias, `vite.config.js`, and `index.css` (Section 8.4) and set up shadcn:
```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea tabs card toggle-group slider switch label collapsible alert badge skeleton tooltip sonner separator
cd ..
```
During `shadcn init`: framework Vite, JavaScript (`"tsx": false`), CSS variables on, base color Slate or Zinc. The primary color is changed to indigo afterwards (Section 4.1).
 
### Step 2: Server (Node + Express)
```bash
mkdir server
cd server
npm init -y
npm install express cors dotenv multer @google/genai express-rate-limit helmet
npm install -D nodemon
npm pkg set type=module
npm pkg set scripts.dev="nodemon src/index.js"
npm pkg set scripts.start="node src/index.js"
cd ..
```
 
### Step 3: Environment files
Create `server/.env.example` and `client/.env.example` (Section 11). Then copy them to real `.env` files:
- `client/.env` can be filled in completely (`VITE_API_URL=http://localhost:5000`).
- `server/.env` must contain the **placeholder** `GEMINI_API_KEY=PASTE_YOUR_KEY_HERE`. **The human replaces it with the real key.** Never read or print that file afterwards.
### Step 4: `.gitignore`
Make sure the root `.gitignore` contains `node_modules`, `.env`, and `dist` before any commit.
 
### Step 5: Verify
- `cd client && npm run build` must pass.
- Start the server (`cd server && npm run dev`) and check `GET /api/health`.
- Start the client (`cd client && npm run dev`) and confirm the page loads at `http://localhost:5173`.
### The only human step
When the app is ready, the human opens **`server/.env`** and pastes their Gemini API key (from Google AI Studio, aistudio.google.com, **Get API key**), then restarts the server.
 
### Deployment
Not part of the build. Only when the human asks. See `README.md`, section **Deployment**.
 
---
 
## 11. Environment variables
 
**`server/.env.example`**
```
GEMINI_API_KEY=PASTE_YOUR_KEY_HERE
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```
`GEMINI_MODEL`: use a current Gemini Flash model name available in Google AI Studio. It is an env var so it can be changed without code edits.
 
**`client/.env.example`**
```
VITE_API_URL=http://localhost:5000
```
 
The server must **refuse to start** with a clear console message if `GEMINI_API_KEY` is missing or still equal to `PASTE_YOUR_KEY_HERE`: *"Open server/.env and paste your Gemini API key."*
 
---
 
## 12. API specification
 
Base URL: `VITE_API_URL`. All responses are JSON.
 
### `GET /api/health`
```json
{ "ok": true, "service": "calclens-server" }
```
 
### `POST /api/extract` (image to equation)
- Content type: `multipart/form-data`, field name `image`.
- Allowed types: `image/png`, `image/jpeg`, `image/webp`. Max 5 MB.
Success:
```json
{
  "ok": true,
  "data": {
    "latex": "x^{2}y + \\sin y",
    "expression": "x^2*y + sin(y)",
    "variables": ["x", "y"],
    "intent": "partial_x",
    "confidence": 0.93,
    "notes": ""
  }
}
```
Error:
```json
{ "ok": false, "error": { "code": "UNREADABLE", "message": "Could not read an equation from this image." } }
```
 
### `POST /api/extract-text` (P1: "Fix with AI")
Request: `{ "text": "x squared times y plus sin y" }`. Response: same shape as `/api/extract`.
 
### `POST /api/explain` (P1: steps)
Request:
```json
{ "expression": "x^2*y + sin(y)", "variable": "x", "type": "partial", "point": { "x": 1, "y": 0 } }
```
Response:
```json
{ "ok": true, "data": { "steps": ["Treat y as a constant.", "Differentiate x^2 to get 2x.", "..."] } }
```
 
### Error codes
 
| Code | HTTP | Meaning |
|---|---|---|
| `NO_FILE` | 400 | No image sent |
| `UNSUPPORTED_TYPE` | 415 | Not PNG, JPG, or WEBP |
| `FILE_TOO_LARGE` | 413 | Over 5 MB |
| `UNREADABLE` | 422 | Gemini could not find an equation |
| `RATE_LIMITED` | 429 | Too many requests |
| `GEMINI_FAILED` | 502 | Gemini API error or timeout |
| `SERVER_ERROR` | 500 | Anything else |
 
Client-only error codes: `PARSE_ERROR`, `NO_VARIABLE`, `TOO_MANY_VARIABLES`, `DOMAIN_ERROR`.
 
---
 
## 13. Gemini prompts (used at runtime by the server)
 
Ask Gemini for JSON output (set `responseMimeType: "application/json"`) and always `JSON.parse` inside a try/catch.
 
### 13.1 Extraction system prompt (`prompts/extractEquation.js`)
 
```
You are a math OCR and normalization engine for a calculus visualizer.
Input: an image (printed or handwritten) or text that contains ONE mathematical function.
Return ONLY valid JSON. No markdown, no commentary.
 
Schema:
{
  "latex": string,        // clean LaTeX of the right-hand side only
  "expression": string,   // math.js-compatible syntax of the right-hand side only
  "variables": string[],  // independent variables, alphabetical, maximum 2
  "intent": "ordinary" | "partial_x" | "partial_y" | "unknown",
  "confidence": number,   // 0 to 1
  "notes": string         // short note if something was ambiguous, otherwise ""
}
 
Rules:
1. If the input shows "y = ...", "z = ...", "f(x) = ..." or "f(x,y) = ...", return only the right-hand side.
2. Use math.js syntax: explicit multiplication with *, powers with ^, functions sin cos tan asin acos atan sinh cosh tanh exp log sqrt abs, constants pi and e. In math.js, log(x) is the NATURAL log and log10(x) is base 10.
3. If the input asks for a derivative (dy/dx, f'(x), ∂f/∂x, ∂f/∂y), still return the ORIGINAL function, not its derivative, and set "intent" to match.
4. If there are more than two variables, return the first two alphabetically in "variables" and explain in "notes".
5. If there is no readable math expression, return {"error": "UNREADABLE", "message": "<short reason>"}.
6. Never solve, simplify, or differentiate. Only transcribe and normalize.
```
 
### 13.2 Steps prompt (`prompts/explainSteps.js`)
```
You are a patient calculus tutor. Given a function, the variable to differentiate with respect to,
whether it is ordinary or partial, and an optional point, explain the derivative in 3 to 6 short steps.
Use plain text with simple math notation. If partial, state clearly which variables are treated as constants.
End with the numeric value at the point if a point is given.
Return ONLY JSON: { "steps": string[] }.
```
 
---
 
## 14. Error handling and edge cases
 
| Situation | Behavior |
|---|---|
| Image has no equation | `ErrorState`: "Couldn't read that, try editing it manually." Offer the text input |
| Low confidence (`< 0.6`) | Show the Detected equation card with a yellow `Alert`: "Please check this equation" |
| Typed text will not parse | Inline error under the input + **Fix with AI** button (P1) |
| More than 2 variables | Message: "CalcLens supports up to two variables (x and y)" |
| Constant function (for example `5`) | Treat as 2D with variable `x`; slope is 0 |
| Division by zero or domain errors | Use `null` gaps in the plot, show "undefined at this point" in the chip |
| Network or Gemini failure | Sonner toast + retry button; text input still works without Gemini |
| Sliders at extreme values | Clamp to the plotting range |
| Very long expression | Reject over 200 characters |
| Missing API key on the server | Console message: "Open server/.env and paste your Gemini API key." |
 
---
 
## 15. Non-functional requirements
 
**Performance**
- Compile the expression once; cache the derivative node.
- Surface data is computed with `useMemo` and only recomputed when the expression or range changes. Moving the point only recomputes the small slope-line and plane data.
- Throttle slider updates with `requestAnimationFrame`.
**Security**
- Gemini key lives only in `server/.env`. It is never sent to the browser.
- CORS allows only `CLIENT_ORIGIN`.
- `helmet` enabled. Rate limit: about 20 requests per minute per IP on `/api/*`.
- Upload: memory storage, type and size validated, files never written to disk, images never logged.
- Never use `eval`. Evaluate only through math.js.
**Accessibility**
- Labels on every input and slider, keyboard-operable controls (shadcn/Radix helps with this), visible focus ring.
- Do not rely on color alone: lines are also labeled in the legend.
- Respect `prefers-color-scheme` for the default theme.
**Browser support:** latest Chrome, Edge, Firefox, Safari.
 
---
 
## 16. Build phases (for Antigravity)
 
After each phase, give a short summary and what to check, then continue unless blocked.
 
**Phase 0: Setup**
Run everything in Section 10 (client scaffold, Tailwind, shadcn init and components, server scaffold, env files, `.gitignore`). Work inside the existing project folder.
 
**Phase 1: Server**
Express app, `env.js` validation (including the placeholder-key message), helmet, cors, rate limit, upload middleware, `gemini.service.js`, `/api/health`, `/api/extract`, error handler.
*Check:* `GET /api/health` works; `/api/extract` works once the human has pasted the key.
 
**Phase 2: Client shell and theme**
shadcn variables and `--slope` token, fonts, `ThemeProvider` + `ThemeToggle`, Navbar, layout (left input panel, right graph panel), empty state.
 
**Phase 3: Math core and 2D**
`normalizeInput`, `parseExpression`, `derivatives`, `sampleFunction`, `tangent`, `MathInput`, `EquationPreview`, `Graph2D`, `PointSliders`, `ResultCards`.
*Check:* `x^2` at `x = 1.5` shows slope 3.
 
**Phase 4: 3D and partial derivatives**
`Graph3D`, partial lines, tangent plane, `Toggles3D`, `DerivativeSelector`, two sliders, result cards.
*Check:* `x^2*y + sin(y)` at `(1, 0)`.
 
**Phase 5: Image flow**
`ImageUpload`, `api.js`, loading and error states, editable Detected equation, clipboard paste.
 
**Phase 6: Polish and handoff**
Show steps (`/api/explain`), Fix with AI, responsive layout, accessibility pass, `npm run build` passes. Final message to the human: how to run both servers and the reminder to paste the Gemini API key into `server/.env`.
 
---
 
## 17. Acceptance criteria and test cases
 
| # | Input | Point | Expected |
|---|---|---|---|
| 1 | `x^2` | x = 1.5 | f = 2.25, f' = 2x, slope = 3 |
| 2 | `sin(x)` | x = 0 | slope = 1 |
| 3 | `x^2 + y^2` | (1, 2) | f = 5, ∂f/∂x = 2x = 2, ∂f/∂y = 2y = 4 |
| 4 | `x^2*y + sin(y)` | (1, 0) | f = 0, ∂f/∂x = 2xy = 0, ∂f/∂y = x² + cos y = 2 |
| 5 | `1/x` | x = 0 | Gap in the curve, chip says "undefined" |
| 6 | Image of a printed `f(x) = x³` | n/a | Detected equation shows `x^3`, 2D graph |
| 7 | Image with no math | n/a | Error state, text input still usable |
| 8 | `x*y*z` | n/a | Error: up to two variables |
 
The project is **done** when all P0 requirements work, tests 1 to 8 pass, the UI matches the Stitch images, `npm run build` succeeds in `client/`, and the app runs end to end locally after the human pastes the Gemini API key. Deployment is described in `README.md`.
 
---
 
## 18. Master prompt (paste this into Antigravity)
 
```
You are building "CalcLens", a calculus visualizer web app (React + Vite + Tailwind v4 + shadcn/ui
+ lucide-react on the frontend, Node + Express on the backend, Gemini for image-to-equation).
 
1. Read PRD.md completely before writing any code. It is the source of truth.
2. This folder is ALREADY the project root. Work directly inside it. Do NOT create a new project
   folder or a nested copy. Put client/ and server/ right here.
3. Run all commands yourself: scaffold with Vite, npm install, npx shadcn@latest init/add,
   builds and dev servers (see PRD Section 10). The only thing I do manually is paste my Gemini
   API key into server/.env.
4. Create server/.env with the placeholder GEMINI_API_KEY=PASTE_YOUR_KEY_HERE. Never read, print,
   log or commit the real key. When everything is ready, tell me to open server/.env and paste it.
5. Use shadcn/ui components, lucide-react icons, and the utility packages listed in PRD Section 6
   and 8. Follow the component mapping in PRD Section 4.2 and the design tokens in Section 4.1.
6. Use docs/ui-preview.png, docs/ui-2d.png and docs/ui-3d.png as the visual reference.
   If I attach screenshots in this chat and those files do not exist, save them there first.
7. Do not delete or overwrite existing files (PRD.md, README.md, docs/) without telling me.
   Do not git push or deploy unless I ask.
8. Use plain JavaScript (no TypeScript), functional React components and hooks, and ES modules
   on the server.
9. Keep all math (parsing, derivatives, tangent lines, sampling) in client/src/lib as small, pure,
   testable functions. Keep all Gemini calls in server/src/services/gemini.service.js.
10. Follow the formulas in PRD Section 5 exactly, and make the test cases in Section 17 pass.
11. Build in the phases from PRD Section 16. After each phase, give a short summary and continue.
 
Start with Phase 0.
```
 
---
 
## 19. Future scope
 
- Implicit curves and parametric equations.
- Second derivatives, curvature, and the gradient vector field.
- Integral mode (area and volume under a curve) as a companion project.
- Saved sessions and shareable links.
- Step-by-step solution export to PDF.
 