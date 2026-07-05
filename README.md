# Nimiq UI Kit

Your browsable reference for the whole Nimiq design system — design tokens, foundations,
live CSS **and** Vue components, identicons, and utilities — rendered from the real, current
Nimiq packages.

**Live demo:** https://nimiqtoolbox.github.io/nimiq-ui-kit/

## What's inside

- **Foundations** — brand & logo, the full colour palette + light-opacity ladder + crypto
  colours, the signature radial gradients, the Muli / Fira Mono type scale, spacing (8px grid),
  radius, elevation, motion, breakpoints, and the complete icon set.
- **Components** — every `@nimiq/style` CSS component and all 34 `@nimiq/vue-components`,
  rendered live and interactive with prop controls and copyable code.
- **Identicons, utilities & patterns** — a live identicon playground, running `@nimiq/utils`
  demos (amount formatting, address validation, request-links…), and composed wallet patterns.
- **Copyable tokens** — `tokens/tokens.css` (CSS custom properties) and `tokens/tokens.json`
  (machine-readable). Every icon also carries a plain-language summary in its `aria-label` and
  on `window.NimiqIconSummaries`, so agents can identify it without vision.

A self-contained static site — no build, no dependencies: just `index.html`, `assets/`, `tokens/`.

## For agents / LLMs

The page's content is rendered at runtime by `assets/js/kit.js`, so fetching `index.html`
without executing JavaScript shows only empty mount points. Hand-generated static artifacts
let any LLM read the **full** kit without a browser:

- **[`llms.txt`](llms.txt)** — a discovery index ([llmstxt.org](https://llmstxt.org/) format).
- **[`llms-full.txt`](llms-full.txt)** — the entire kit as one flat markdown file: tokens (as
  tables), foundations, CSS components, every Vue component with props + copyable examples,
  identicons, utilities and icons. **Start here.**
- **[`components.json`](components.json)** — structured manifest of the Vue catalog (31 demos
  covering 34 component tags), extracted from the `GROUPS` object in `kit.js`.
- **[`tokens/tokens.json`](tokens/tokens.json)** — machine-readable design tokens.
- **[`AGENTS.md`](AGENTS.md)** — how to consume the kit and hand-regenerate these artifacts.

Every rendered icon also carries a plain-language summary in its `aria-label` / `data-summary`
and on `window.NimiqIconSummaries`, so agents can identify icons without vision.

## Built from

Every value, class and component comes from the real, current sources:

| Source | Provides |
|---|---|
| [@nimiq/style](https://github.com/nimiq/nimiq-style) `0.8.5` | Colours, gradients, type scale, buttons, inputs, cards, notices, icon sprite |
| [@nimiq/vue-components](https://github.com/nimiq/vue-components) | The 34 live Vue components |
| [@nimiq/identicons](https://github.com/nimiq/iqons) `1.6.2` | Identicon avatars |
| [@nimiq/utils](https://github.com/nimiq/nimiq-utils) | Formatting, validation, request-links, tweening, clipboard |
| [nimiq/wallet](https://github.com/nimiq/wallet) | Muli / Fira Mono fonts, opacity ladder, crypto colours, patterns |

The `@nimiq/vue-components` UMD bundle and the `@nimiq/utils` browser bundle under `assets/js/`
are compiled from those sources; the live demos load Vue 2 alongside the UMD bundle and mount
each component with reactive prop controls.
