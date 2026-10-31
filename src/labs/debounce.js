// Contact bounce (lecture 11, p. 35–37): one press of a real button opens and closes a few times in the first
// milliseconds. Counted raw, one press is several; the course's debounce waits until the reading has been steady for
// debounceDelay ms. The bounce is drawn from a seeded sequence: "Press again" gives a new one, the same each visit.
import { bouncyPress, debounce, risingEdges } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import { lineChart } from "../ui/chart.js";
import * as a from "../ui/art.js";

export default {
  id: "debounce",
  art: () => a.picture("A button signal that chatters at its edges, and the clean signal under it",
    a.line([[15, 60], [50, 60], [50, 25], [56, 25], [56, 60], [60, 60], [60, 25], [64, 25], [64, 52], [68, 52], [68, 25], [130, 25],
      [130, 60], [134, 60], [134, 30], [138, 30], [138, 60], [185, 60]], a.HOT, 2) +
      a.line([[15, 125], [75, 125], [75, 90], [155, 90], [155, 125], [185, 125]], a.ACC, 3) + a.text(100, 145, "50 ms", 14, a.DIM)),
  mount(root) {
    let delay = 50, bounceMs = 8, seed = 7;
    const chart = h("div", { class: "drawing" });
    const raw = readout("Presses counted without debounce"), clean = readout("Presses counted with debounce");
    const code = h("pre", { class: "code" });
    const update = () => {
      const signal = bouncyPress({ bounceMs, seed }), out = debounce(signal, delay);
      const t = signal.map((_, k) => k);
      chart.replaceChildren(lineChart({
        lines: [{ x: t, y: signal.map(v => v + 1.4), name: "digitalRead (raw)", cls: "faint" }, { x: t, y: out, name: "After debounce" }],
        xLabel: "Time [ms]", yLabel: "Level (raw above) [–]", yMin: 0, yMax: 2.5,
        label: `One press over 200 ms: the raw reading bounces at both edges; the debounced one changes once each way, ${delay} ms late`,
      }));
      const n = risingEdges(signal);
      raw.set(String(n), n > 1 ? "danger" : "", n > 1 ? "One press counted several times." : "");
      const m = risingEdges(out);
      clean.set(String(m), m !== 1 ? "warn" : "", m !== 1 ? (m === 0 ? "The wait is longer than the press: it missed it." : "The wait is shorter than the bounce.") : `Right, ${delay} ms after the press.`);
      code.textContent = `const unsigned long debounceDelay = ${delay}; // ms\n...\nif ((millis() - lastDebounceTime) > debounceDelay) {\n  if (reading != buttonState) buttonState = reading;\n}`;
    };
    root.append(h("div", { class: "stage" }, h("div", {}, chart, code), h("div", { class: "controls" },
      slider({ label: "debounceDelay", unit: "ms", min: 0, max: 120, value: delay, step: 1, format: v => `${v} ms`, onInput: v => { delay = v; update(); } }),
      slider({ label: "How long the contacts bounce", unit: "ms", min: 0, max: 20, value: bounceMs, step: 1, format: v => `${v} ms`, onInput: v => { bounceMs = v; update(); } }),
      h("button", { type: "button", onclick: () => { seed++; update(); } }, "Press again"),
      raw.el, clean.el,
      h("p", { class: "hint" }, "Other cures from the lecture (p. 36): buffer springs, a low-pass filter, a hysteretic transistor circuit. The bounce drawn here is an example, not a measurement: the course gives no bounce times."))));
    update();
  },
};
