// Series, parallel and the two combined, solved with the course's table method (syllabus §2.4): one column per
// resistor and one for the total, rows U, I, R and P; Ohm's law only ever within one column.
import { table as solveTable, si } from "../core/index.js";
import { h, slider, choice } from "../ui/kit.js";
import { svg, wire, resistor, source } from "../ui/schematic.js";
import * as a from "../ui/art.js";

function drawing(kind) {
  if (kind === "series") return svg(460, 220, "Three resistors in series on a source",
    source(50, 40, 190, "U"), wire([[50, 40], [90, 40]]), resistor(90, 40, 190, 40, "R1"), resistor(190, 40, 290, 40, "R2"),
    resistor(290, 40, 390, 40, "R3"), wire([[390, 40], [420, 40], [420, 190], [50, 190]]));
  if (kind === "parallel") return svg(460, 220, "Three resistors in parallel on a source",
    source(50, 40, 190, "U"), wire([[50, 40], [380, 40]]), wire([[50, 190], [380, 190]]),
    resistor(180, 40, 180, 190, "R1"), resistor(280, 40, 280, 190, "R2"), resistor(380, 40, 380, 190, "R3"));
  return svg(460, 220, "R1 and R2 in parallel, in series with R3, on a source",
    source(50, 40, 190, "U"), wire([[50, 40], [130, 40]]), wire([[130, 40], [130, 20], [160, 20]]), resistor(160, 20, 260, 20, "R1"),
    wire([[260, 20], [290, 20], [290, 40]]), wire([[130, 40], [130, 70], [160, 70]]), resistor(160, 70, 260, 70, "R2"),
    wire([[260, 70], [290, 70], [290, 40]]), wire([[290, 40], [330, 40], [330, 70]]), resistor(330, 70, 330, 170, "R3"),
    wire([[330, 170], [330, 190], [50, 190]]));
}

export default {
  id: "network",
  art: () => a.picture("Two resistors in parallel, in series with a third, on a source",
    a.line([[30, 68], [30, 40], [79, 40]]) + a.line([[70, 40], [70, 80], [79, 80]]) + a.line([[111, 40], [170, 40], [170, 62]]) +
      a.line([[111, 80], [120, 80], [120, 40]]) + a.resistor(95, 40, false, a.ACC) + a.resistor(95, 80, false, a.ACC) +
      a.resistor(170, 78, true) + a.line([[170, 94], [170, 115], [30, 115], [30, 82]]) + a.cell(30, 75)),
  mount(root) {
    let kind = "series", U = 9, Rs = [3000, 10000, 5000];
    const pic = h("div", { class: "drawing" });
    const table = h("table", { class: "method" });
    const check = h("p", { class: "hint", role: "status" });
    const update = () => {
      pic.replaceChildren(drawing(kind));
      const cols = solveTable(kind, U, Rs);
      const head = h("tr", {}, h("th", { scope: "col" }, ""), ["R1", "R2", "R3", "Total"].map(n => h("th", { scope: "col" }, n)));
      const row = (name, unit, f) => h("tr", {}, h("th", { scope: "row" }, `${name} [${unit}]`), cols.map(c => h("td", {}, si(f(c), unit))));
      table.replaceChildren(h("thead", {}, head), h("tbody", {},
        row("U", "V", ([R, I]) => I * R), row("I", "A", ([, I]) => I), row("R", "Ω", ([R]) => R), row("P", "W", ([R, I]) => I * I * R)));
      const [a, b, c, t] = cols.map(([R, I]) => I * R);
      check.textContent = kind === "series" ? `Check: U1 + U2 + U3 = ${si(a + b + c, "V")}, the source's ${si(t, "V")}.`
        : kind === "parallel" ? `Check: the total ${si(cols[3][0], "Ω")} is less than the smallest branch.`
        : `Check: U across R1 ∥ R2 plus U across R3 = ${si(a + c, "V")}; I1 + I2 = I3.`;
    };
    const sliders = Rs.map((R, k) => slider({ label: `Resistor R${k + 1}`, unit: "Ω", min: 1, max: 1e6, value: R, log: true,
      onInput: v => { Rs[k] = v; update(); } }));
    root.append(h("div", { class: "stage" },
      h("div", {}, pic, table, check),
      h("div", { class: "controls" },
        choice("Wiring", [["series", "Series"], ["parallel", "Parallel"], ["combined", "R1 ∥ R2, then R3"]], kind, v => { kind = v; update(); }),
        slider({ label: "Source U", unit: "V", min: 1, max: 24, value: U, step: 0.5, onInput: v => { U = v; update(); } }),
        sliders.map(s => s.el),
        h("p", { class: "hint" }, "Ohm's law holds within one column at a time. Fill the column you know two values of first."))));
    update();
  },
};
