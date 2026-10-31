// Battery chemistries (lecture 12, p. 3–13): each has its own cell voltage, which the exam asks by heart. Pick one,
// build a pack for a voltage, and see a LiPo's safe window.
import { cellsFor } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

// Lecture 12, p. 4–10: cell voltage and what the slide says of each.
const CELLS = {
  alkaline: ["Alkaline", 1.5, "Zinc and manganese. AA, AAA, D: all 1.5 V. Not rechargeable."],
  nicd: ["NiCd", 1.2, "Memory effect; about 1500 cycles."],
  nimh: ["NiMH", 1.2, "No memory effect; about 750 cycles."],
  lead: ["Lead-acid", 2, "Heavy; can stay on charge; never discharge fully; 95 % recycled. A car battery is 6 cells."],
  lipo: ["Li-ion / LiPo", 3.7, "Light and strong, but needs protection: stop discharging at 3.2 V, charging at 4.2 V."],
};

export default {
  id: "chemistry",
  art: () => a.picture("Four cells of different sizes, labelled 1.5, 1.2, 2 and 3.7 volts",
    [["1.5", 20, 38], ["1.2", 62, 46], ["2", 104, 30], ["3.7", 146, 40]].map(([v, x, y], k) =>
      a.rect(x, y, 34, 120 - y - 10, k === 3 ? a.ACC : a.INK, 3) + a.rect(x + 11, y - 6, 12, 6, k === 3 ? a.ACC : a.INK, 2) + a.text(x + 17, 135, v, 13, k === 3 ? a.ACC : a.DIM)).join("")),
  mount(root) {
    let kind = "lipo", target = 7.4, lipo = 3.7;
    const cell = readout("Cell voltage"), pack = readout("Cells in series for the voltage you want"), safe = readout("A LiPo cell now");
    const update = () => {
      const [name, U, note] = CELLS[kind];
      cell.set(`${U} V`, "", note);
      const n = cellsFor(target, U);
      pack.set(`${n} cells`, "", `${n} × ${U} V = ${(n * U).toFixed(1)} V for ${name}`);
      safe.set(`${lipo.toFixed(2)} V`, lipo < 3.2 || lipo > 4.2 ? "danger" : "",
        lipo < 3.2 ? "Below 3.2 V: the protection cuts off; going lower damages the cell." : lipo > 4.2 ? "Above 4.2 V: overcharged, a fire risk; the charger must stop." : "Inside the safe window, 3.2 to 4.2 V.");
    };
    root.append(h("div", { class: "stage" }, h("div", { class: "controls" },
        choice("Chemistry", Object.entries(CELLS).map(([k, [n, v]]) => [k, `${n}, ${v} V`]), kind, v => { kind = v; update(); }),
        slider({ label: "Voltage you need", unit: "V", min: 1, max: 48, value: target, step: 0.1, onInput: v => { target = v; update(); } }),
        cell.el, pack.el),
      h("div", { class: "controls" },
        slider({ label: "LiPo cell voltage", unit: "V", min: 2.8, max: 4.5, value: lipo, step: 0.01, onInput: v => { lipo = v; update(); } }),
        safe.el,
        h("p", { class: "hint" }, "The overview table of lecture 12 (energy per kg, cycles, self-discharge) is given at the exam; the voltages are not."))));
    update();
  },
};
