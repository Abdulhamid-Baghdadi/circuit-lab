// The binary-weighted DAC of lecture 11, p. 50–52: three bits through R, 2R and 4R into an inverting opamp. Flip
// the bits and the output steps; the staircase shows all eight codes, and more bits give finer steps.
import { binaryDac, si } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import { lineChart } from "../ui/chart.js";
import * as a from "../ui/art.js";

export default {
  id: "dac",
  art: () => a.picture("Three bits feeding an opamp, and the falling staircase of voltages it makes",
    ["1", "0", "1"].map((d, k) => a.rect(15, 22 + k * 36, 26, 28, d === "1" ? a.ACC : a.DIM, 2) + a.text(28, 42 + k * 36, d, 18, d === "1" ? a.ACC : a.DIM)).join("") +
      a.line([[41, 36], [70, 36], [70, 72]], a.INK, 2) + a.line([[41, 72], [70, 72]], a.INK, 2) + a.line([[41, 108], [70, 108], [70, 72]], a.INK, 2) +
      a.line([[70, 72], [80, 72]], a.INK, 2) + a.line([[80, 50], [80, 94], [110, 72], [80, 50]]) +
      a.line([[125, 30], [140, 30], [140, 45], [155, 45], [155, 60], [170, 60], [170, 75], [185, 75]], a.ACC, 3)),
  mount(root) {
    let bits = [1, 0, 1], Rf = 1000;
    const row = h("div", { class: "bits" });
    const chart = h("div", { class: "drawing" });
    const out = readout("Vout = −Rf × (U1/R + U2/2R + U3/4R)"), step = readout("One step (the LSB) is");
    const update = () => {
      const names = ["MSB, through R", "through 2R", "LSB, through 4R"];
      row.replaceChildren(...bits.map((b, k) => h("button", { type: "button", class: "bit", "aria-pressed": String(b === 1),
        "aria-label": `Bit ${k + 1}, ${names[k]}: ${b}`, onclick: () => { bits[k] = 1 - b; update(); } },
        h("span", { class: "digit" }, String(b)), h("span", { class: "weight" }, names[k]))));
      const v = binaryDac(bits, 5, 1000, Rf);
      out.set(si(v, "V"), "", `code ${bits.join("")} = ${parseInt(bits.join(""), 2)}`);
      step.set(si(Math.abs(binaryDac([0, 0, 1], 5, 1000, Rf)), "V"));
      const codes = Array.from({ length: 8 }, (_, c) => c);
      const xs = codes.flatMap(c => [c, c + 1]), ys = codes.flatMap(c => {
        const y = binaryDac([c >> 2 & 1, c >> 1 & 1, c & 1], 5, 1000, Rf);
        return [y, y];
      });
      const now = parseInt(bits.join(""), 2);
      chart.replaceChildren(lineChart({
        lines: [{ x: xs, y: ys, name: "All eight codes" }, { x: [now, now + 1], y: [v, v], name: "Now", cls: "rms-line" }],
        xLabel: "Code [000 to 111]", yLabel: "Vout [V]", yMin: Math.min(...ys), yMax: 0,
        label: `The DAC's staircase: eight codes from 0 V down to ${si(Math.min(...ys), "V")}; code ${bits.join("")} gives ${si(v, "V")}`,
      }));
    };
    root.append(h("div", { class: "stage" }, h("div", {}, row, chart), h("div", { class: "controls" },
      slider({ label: "Feedback resistor Rf", unit: "Ω", min: 200, max: 2000, value: Rf, step: 100, onInput: x => { Rf = x; update(); },
        help: "With Rf = R, 111 gives −8.75 V (lecture 11, p. 50); with Rf = 800 Ω, −7.00 V (p. 51), which makes R = 1 kΩ at 5 V." }),
      out.el, step.el,
      h("p", { class: "hint" }, "Each bit has half the weight of the one before it, like the places of a binary number. The opamp inverts, so the output is negative."))));
    update();
  },
};
