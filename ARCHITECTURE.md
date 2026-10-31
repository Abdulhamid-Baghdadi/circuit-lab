# Architecture

Binds the design rules (UA-SMARTLab/design-rules) to this project's names.

## Layers, bottom first

| Layer | Files | May use | Front door |
|---|---|---|---|
| core | `src/core/**` | nothing | `src/core/index.js` |
| kit | `src/ui/**` | core | `src/ui/kit.js`, `src/ui/schematic.js` |
| labs | `src/labs/**` | core, kit | each lab's default export `{ id, mount(element) }`; the list in `src/labs/index.js` |
| app | `src/app.js` | core, kit, labs | the page, `index.html` |

The core is pure: no DOM, network, clock or randomness (`forbid` in `architecture.json`). The kit draws and knows no law.
A lab holds one idea. The core names no lab; the app takes the list.

## Data

`data/labs.json` (`"format": "circuit-lab labs"`, version 2) holds the lectures (number, date and title from each
lecture file's first slide, and the labs each teaches), then each lab's words and practice questions. Every
question has a `compute` block that `src/core/practice.js` works out; `tests/unit/labs-data.test.js` fails when the
worked answer and the sheet's answer disagree.

## Held by tests

- Layering, cycles, packages, forbidden names, files in no layer: `scripts/check-architecture.js` (copied from the
  Scoping Review Workbench), run by `tests/unit/architecture.test.js`. Command: `node scripts/check-architecture.js`.
- Citations of design principles: `tests/unit/design-citations.test.js`, skipped where the design rules are not
  installed.
- The laws: `tests/unit/core.test.js`, each against a hand calculation or a course example it names.

Trusted to the agent: one idea per lab, the words in labs.json matching the UI.

## Where it departs from the rules

- No file format round-trip test: the app reads `labs.json` and never writes it.
- The dependency matrix is not drawn yet; `python ~/.claude/skills/web-app-design/scripts/check_layers.py . --page` draws it.

## README pictures

- `docs/ohm-light.gif`, `docs/ohm-dark.gif`: `node scripts/record-readme.mjs` with the site served on port 8765
  (headless Edge over its DevTools port, then ffmpeg; 4.7 s, plays once).
- `docs/light.png`, `docs/dark.png`: headless Edge `--screenshot` of `#divider` with
  `--blink-settings=preferredColorScheme=1` (light) or `0` (dark), `--virtual-time-budget=8000`, window 1280 × 1000;
  a file under 50 kB caught the page before it loaded: take it again.
- `tests/unit/readme.test.js` checks that every picture the README shows exists and has alt text.
