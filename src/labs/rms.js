// RMS and peak (lecture 4, slide 12): the mains is called 230 V, but the wave reaches √2 × 230 V. RMS is the DC
// voltage that heats a resistor as much; it is the only voltage the course uses.
import { peakOf, si } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import { lineChart } from "../ui/chart.js";
import * as a from "../ui/art.js";

export default {
  id: "rms",
  art: () => a.picture("A sine wave with its peak marked and its lower RMS level dashed",
    a.line(Array.from({ length: 61 }, (_, k) => [15 + k * 170 / 60, 75 - 50 * Math.sin(k / 60 * 4 * Math.PI)]), a.INK, 3) +
      a.line([[15, 25], [185, 25]], a.HOT, 2, "4 5") + a.line([[15, 39.6], [185, 39.6]], a.ACC, 3, "8 6") +
      a.text(185, 20, "peak", 13, a.HOT, "end") + a.text(185, 55, "RMS", 13, a.ACC, "end")),
  mount(root) {
    let U = 230, f = 50;
    const chart = h("div", { class: "drawing" });
    const peak = readout("Peak = √2 × RMS"), pp = readout("Peak to peak"), meter = readout("A multimeter on AC shows");
    const update = () => {
      const p = peakOf(U), T = 1000 / f;
      const t = Array.from({ length: 201 }, (_, k) => k * 2 * T / 200);
      chart.replaceChildren(lineChart({
        lines: [{ x: t, y: t.map(ms => p * Math.sin(2 * Math.PI * ms / T)), name: "The wave" },
                { x: [0, 2 * T], y: [U, U], name: "RMS", cls: "rms-line" }],
        xLabel: "Time [ms]", yLabel: "Voltage [V]", yMin: -Math.ceil(p), yMax: Math.ceil(p),
        label: `A ${f} Hz sine of ${si(U, "V")} RMS: it peaks at ${si(p, "V")}`,
      }));
      peak.set(si(p, "V"));
      pp.set(si(2 * p, "V"));
      meter.set(si(U, "V"), "", "RMS: the voltage that heats a resistor as much as that DC voltage would.");
    };
    root.append(h("div", { class: "stage" }, chart, h("div", { class: "controls" },
      slider({ label: "RMS voltage", unit: "V", min: 1, max: 400, value: U, step: 1, onInput: v => { U = v; update(); } }),
      slider({ label: "Frequency", unit: "Hz", min: 10, max: 100, value: f, step: 1, onInput: v => { f = v; update(); } }),
      peak.el, pp.el, meter.el,
      h("p", { class: "hint" }, "The slide's example: 240 V RMS peaks at about 340 V."))));
    update();
  },
};
