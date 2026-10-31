// How long a battery lasts: the load's power over the cell voltage gives the current, the capacity over the current
// gives the hours (lesson 12, p. 12 and 18). The cell voltages are the ones students learn by heart.
import { battery, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

// Nominal voltage per cell, lesson 12, p. 4–9 and the overview table on p. 13.
const CELLS = { alkaline: [1.5, "Alkaline 1.5 V"], nimh: [1.2, "NiMH 1.2 V"], lead: [2, "Lead-acid 2 V"], lipo: [3.7, "Li-ion / LiPo 3.7 V"] };

export default {
  id: "battery",
  art: () => a.picture("A battery two thirds full",
    a.rect(42, 42, 108, 66) + a.rect(150, 63, 10, 24, a.INK, 3, a.INK) + a.rect(50, 50, 62, 50, a.COOL, 0, a.COOL) +
      a.text(132, 81, "+", 22, a.INK) + a.text(100, 136, "Ah · Wh", 16, a.DIM)),
  mount(root) {
    let cell = "lipo", n = 2, mAh = 6500, P = 3, price = 0.5;
    const life = readout("Runs for t = Ah / I"), current = readout("Current I = P / U"), energy = readout("Energy Wh = Ah × U"),
          cost = readout("One full charge costs");
    const pack = readout("Pack voltage, cells in series");
    const update = () => {
      const U = CELLS[cell][0] * n, b = battery(mAh / 1000, U, P);
      pack.set(si(U, "V"));
      current.set(si(b.I, "A"));
      life.set(b.hours >= 48 ? `${(b.hours / 24).toFixed(1)} days` : `${b.hours.toFixed(1)} h`);
      energy.set(`${b.Wh.toFixed(2)} Wh`);
      cost.set(`€${(b.Wh / 1000 * price).toFixed(4)}`, "", `at €${price.toFixed(2)} per kWh`);
    };
    root.append(h("div", { class: "stage" }, h("div", { class: "controls" },
        choice("Cell", Object.entries(CELLS).map(([k, [, t]]) => [k, t]), cell, v => { cell = v; update(); }),
        slider({ label: "Cells in series", unit: "", min: 1, max: 6, value: n, step: 1, format: String, onInput: v => { n = v; update(); } }),
        slider({ label: "Capacity", unit: "mAh", min: 100, max: 20000, value: mAh, log: true, format: v => `${Math.round(v)} mAh`, onInput: v => { mAh = v; update(); } }),
        slider({ label: "Load power P", unit: "W", min: 0.01, max: 50, value: P, log: true, onInput: v => { P = v; update(); } }),
        slider({ label: "Electricity price", unit: "€/kWh", min: 0.1, max: 1, value: price, step: 0.01, format: v => `€${v.toFixed(2)}`, onInput: v => { price = v; update(); } })),
      h("div", { class: "controls" }, pack.el, current.el, life.el, energy.el, cost.el,
        h("p", { class: "hint" }, "Cells in series add their voltages (lesson 2, slides 30–32)."))));
    update();
  },
};
