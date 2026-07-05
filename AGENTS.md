# AGENTS.md — Nimiq UI Kit

Guidance for LLMs and coding agents working with, or consuming, this repository. This is a **zero-build static site** (`index.html` + `assets/` + `tokens/`): no bundler, no `package.json`, no install step. Do not add a build tool, generator script, or dependency — the artifacts here are maintained **by hand**.

## Read these, do not scrape the DOM

The site's real content — the Vue component catalog, all code samples, color swatches, the opacity ladder, gradients and icon grids — is injected at runtime by `assets/js/kit.js`. Fetching `index.html` without executing JavaScript yields only empty mount `<div>`s. So, to understand the kit, read the static artifacts instead of rendering the page:

| You want… | Read |
|---|---|
| Everything, one file | `llms-full.txt` |
| A discovery index | `llms.txt` |
| Design tokens (machine-readable) | `tokens/tokens.json` (CSS mirror: `tokens/tokens.css`) |
| The Vue component manifest | `components.json` |
| The extended icon set | `assets/nimiq-icons.json` (Iconify; skip `hidden: true`) |
| The UI icon sprite ids + summaries | `llms-full.txt` (Icons section) or `assets/icons/nimiq-style.icons.svg` |

`index.html` also advertises `llms.txt` / `llms-full.txt` via `<link rel="alternate" type="text/markdown">`, plus JSON-LD (`TechArticle` + a `Dataset` for the tokens) and Open Graph / Twitter meta in its `<head>`.

## Conventions to know

- **CSS custom properties** are namespaced `--nimiq-*` (e.g. `--nimiq-blue`, `--nimiq-light-blue-bg`). Wallet-derived text tints use `--text-<step>`.
- **Utility classes** use the `.nq-*` prefix: `.nq-<color>` sets text color, `.nq-<color>-bg` sets the background (which applies the signature gradient). Components are `.nq-button`, `.nq-input`, `.nq-card`, `.nq-notice`, `.nq-label`, `.nq-link`, `.nq-h1`/`.nq-h2`/`.nq-h3`, `.nq-text`/`.nq-text-s`.
- **8px grid:** `html { font-size: 8px }`, so `1rem = 8px` and `Nrem = N × 8px`. Sizes in tokens are given as both rem and px.
- **Gradient system:** every `--nimiq-<color>-bg` follows one formula — `radial-gradient(100% 100% at bottom right, <accent>, var(--nimiq-<color>))`. A brighter accent glows from the bottom-right into the base color. Hover variants are `--nimiq-<color>-bg-darkened`.
- **Opacity ladder:** the wallet's greyscale text system is Nimiq Blue at descending alpha — `--text-<step>` where the value is `rgba(31, 35, 72, step/100)`, for steps `100, 80, 70, 60, 50, 40, 35, 30, 25, 22, 20, 16, 14, 12, 10, 6`.
- **On-dark swaps:** inside a `.nq-*-bg` surface, light-blue and red switch to brighter `--nimiq-*-on-dark` values.
- **Amount units:** crypto amounts are integers in the smallest unit (**luna** for NIM; NIM has 5 decimals, so 1 NIM = 100000 luna). Fiat amounts are decimals.
- **Icon summaries (vision-free):** every rendered icon carries a plain-language description in its `aria-label`, `title` and `data-summary`. The sprite summaries are also exposed programmatically on `window.NimiqIconSummaries` (an id → description map). Use these to identify an icon without looking at the glyph.

## Component count — read this before quoting a number

`README.md` and `index.html` say **"34 components"** / "34 live Vue components". That is imprecise as a demo count. The truth, derived from the `GROUPS` object in `assets/js/kit.js`:

- **31 interactive demos** are mounted, split 10 / 6 / 10 / 3 / 2 across the groups Amounts & Identity, Inputs, Feedback & Overlay, Layout & Pages, QR.
- They reference **34 distinct component tags** — the 31 demo tags **plus** `PageHeader`, `PageBody` and `PageFooter`, which are composed inside the single `SmallPage` demo (see `SmallPage.relatedTags` in `components.json`).

So "34" is defensible as a **tag** count but not as a **demo** count. `components.json` has 31 entries (one per demo) and its `$meta.componentCount` documents both numbers. The in-page "34" text lives in the HTML body and was intentionally left unchanged.

## Sources of truth → which artifact each feeds

When the kit changes, regenerate the artifacts by hand from these sources (no script):

| Source of truth | Feeds |
|---|---|
| `tokens/tokens.json` (+ `tokens/tokens.css` mirror) | The token tables in `llms-full.txt`; the JSON-LD `Dataset` in `index.html` |
| `assets/js/kit.js` → `GROUPS` (~lines 400–547) | `components.json`; the Vue catalog in `llms-full.txt`. Extract each demo's `tag`, `knobs` (name/label/type/options/def → props), Vue `template`, and evaluate `code(state)` with the knob defaults for the copyable example |
| `assets/js/kit.js` → token arrays (~lines 47–65) | Cross-check the color/ladder/gradient tables |
| `assets/js/kit.js` → `ICON_DESC` (~lines 120–160, also `window.NimiqIconSummaries`) | The sprite-icon summary table in `llms-full.txt` |
| `assets/icons/nimiq-style.icons.svg` | The list of sprite symbol ids (39) |
| `assets/nimiq-icons.json` | The extended-icon name list (icons where `hidden` is not set — 89 `logos-*`) |
| `index.html` section ledes + demo markup | The Foundations prose and CSS-component snippets in `llms-full.txt` |

Regeneration rules of thumb: keep `components.json` a faithful 1:1 map of the `GROUPS` demos; mark any prop that is inferred from a template/example (rather than an interactive knob) as `inferred`; never invent a prop, value, or default that is not in the sources; and update the `componentCount` note if the number of demos changes.

## Editing boundaries (this repo)

- Never introduce a build step, `package.json`, or runtime dependency — the site must stay drop-in static.
- Vendor bundles under `assets/js/` (`vue*.js`, `NimiqVueComponents.umd.min.js`, `identicons.bundle.min.js`, `nimiq-utils.kit.js`) and vendored CSS are compiled artifacts — treat as read-only.
- Keep the machine-readable artifacts in sync with each other: `tokens.json` ⇄ `tokens.css`, and `components.json` ⇄ the Vue catalog in `llms-full.txt`.

## Standards this format follows

- **`llms.txt` / `llms-full.txt`** — the [llmstxt.org](https://llmstxt.org/) proposal: an H1 title, a `>` blockquote summary, optional detail paragraphs, then `##` sections of `- [name](url): note` links, with a skippable `## Optional` section for secondary links. `llms-full.txt` is the widely-used companion that inlines the full documentation as one markdown file.
- **`AGENTS.md`** — the [agents.md](https://agents.md/) convention: a hand-written "README for agents" with the project-specific context, conventions and boundaries an agent needs.
- **Design tokens** — informed by the W3C [Design Tokens Community Group (DTCG)](https://www.designtokens.org/) format (stable v2025.10), whose tokens are `{ "$value", "$type" }` objects. This kit intentionally keeps its **existing** `tokens/tokens.json` shape (grouped, human-first, with `hex`/`rgb`/`var`/class fields and explicit `formula` strings) rather than converting to DTCG `$value`/`$type`, because that shape carries the class/var mapping and gradient/ladder formulas the kit depends on. A DTCG export could be produced from it if needed.
- **`components.json`** — a bespoke, flattened manifest inspired by the [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) and Storybook `stories.json`/args shapes (tag, props/attributes, events, slots, example), simplified for direct LLM reading. See `$meta.schemaNote`.
