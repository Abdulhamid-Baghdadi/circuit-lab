// Real batteries (lecture 2, slides 30–37): cells in series add their voltages, in parallel they keep it and their
// resistance inside divides; that resistance makes the voltage at the load drop as the load draws more.
import { cellPack, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

export default {
  id: "cells",
  art: () => a.picture("Four cells, two by two, with a small resistor drawn inside each",
    [0, 1].flatMap(row => [0, 1].map(col => {
      const x = 40 + col * 70, y = 30 + row * 55;
      return a.rect(x, y, 50, 34, a.INK, 3) + a.rect(x + 50, y + 11, 6, 12, a.INK, 2, a.INK) + a.text(x + 25, y + 23, "1.5 V", 13, a.ACC);
    })).join("") + a.text(100, 140, "series · parallel", 14, a.DIM)),
  mount(root) {
    let wiring = "series", E = 1.5, r = 0.2, R = 10;
    const pack = readout("The pack: EMF and resistance inside"), load = readout("Voltage at the load U = E − I × r"),
          current = readout("Current I = E / (r + R)"), lost = readout("Heat inside the pack");
    const update = () => {
      const p = cellPack(wiring, 4, E, r, R);
      pack.set(`${si(p.E, "V")}, ${si(p.r, "Ω")}`);
      load.set(si(p.U, "V"), "", `${si(p.E - p.U, "V")} stays inside the pack`);
      current.set(si(p.I, "A"));
      lost.set(si(p.lost, "W"));
    };
    root.append(h("div", { class: "stage" }, h("div", { class: "controls" },
        choice("Four cells", [["series", "In series"], ["parallel", "In parallel"], ["2x2", "Two by two"]], wiring, v => { wiring = v; update(); }),
        choice("Cell", [["1.5", "AA, 1.5 V"], ["2", "Lead-acid, 2 V"]], "1.5", v => { E = Number(v); update(); }),
        slider({ label: "Resistance inside each cell r", unit: "Ω", min: 0.01, max: 2, value: r, log: true, onInput: v => { r = v; update(); } }),
        slider({ label: "Load R", unit: "Ω", min: 0.1, max: 1000, value: R, log: true, onInput: v => { R = v; update(); } })),
      h("div", { class: "controls" }, pack.el, load.el, current.el, lost.el,
        h("p", { class: "hint" }, "The lecture's example: 10 V with 0.2 Ω inside on a 1 Ω load gives 8.33 V, not 10 V."))));
    update();
  },
};
