// From the transformer's AC to DC a circuit can use: no diode, one diode, or a Graetz bridge, then a capacitor that
// fills the gaps (lesson 10, p. 6–9). The wave is stepped from the definitions in the core, not drawn from a formula.
import { rectifier, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import { lineChart } from "../ui/chart.js";

export default {
  id: "rectifier",
  mount(root) {
    let kind = "bridge", Upeak = 12, C = 470e-6, R = 100;
    const chart = h("div", { class: "drawing" });
    const avg = readout("Average output"), ripple = readout("Ripple, top to bottom");
    const update = () => {
      const r = rectifier({ kind, Upeak, f: 50, C, R });
      const ms = r.t.map(t => t * 1000);
      chart.replaceChildren(lineChart({
        lines: [{ x: ms, y: r.source, name: "AC in", cls: "faint" }, { x: ms, y: r.out, name: "Output on the load" }],
        xLabel: "Time [ms]", yLabel: "Voltage [V]", yMin: -Upeak, yMax: Upeak,
        label: `The 50 Hz input and the output of a ${kind === "none" ? "circuit without diodes" : kind === "half" ? "single diode" : "Graetz bridge"}` +
               `${C && kind !== "none" ? ` with ${si(C, "F")}` : ""}; ripple ${si(r.ripple, "V")}`,
      }));
      avg.set(si(r.average, "V"));
      ripple.set(si(r.ripple, "V"), kind !== "none" && r.ripple > 0.1 * Upeak ? "warn" : "",
        kind === "none" ? "Still AC: it averages to nothing." : r.ripple > 0.1 * Upeak ? "More than 10 % of the peak: a bigger capacitor helps." : "");
    };
    root.append(h("div", { class: "stage" }, chart, h("div", { class: "controls" },
      choice("Diodes", [["none", "None (AC)"], ["half", "One diode"], ["bridge", "Graetz bridge"]], kind, v => { kind = v; update(); }),
      slider({ label: "Peak voltage", unit: "V", min: 3, max: 30, value: Upeak, step: 0.5, onInput: v => { Upeak = v; update(); } }),
      slider({ label: "Smoothing capacitor C", unit: "F", min: 1e-6, max: 4.7e-3, value: C, log: true, onInput: v => { C = v; update(); } }),
      slider({ label: "Load R", unit: "Ω", min: 10, max: 10e3, value: R, log: true, onInput: v => { R = v; update(); },
        help: "A smaller load resistance draws more current and empties the capacitor faster." }),
      avg.el, ripple.el,
      h("p", { class: "hint" }, "Each conducting diode takes about 0.7 V; in a bridge two conduct at a time."))));
    update();
  },
};
