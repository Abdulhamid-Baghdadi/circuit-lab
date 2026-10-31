// Logic gates (lecture 11, p. 19–28): flip the two inputs, pick a gate, and the output and its row of the truth
// table follow, with the same test written in Arduino code.
import { GATES } from "../core/index.js";
import { h, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

const CODE = { NOT: "!a", AND: "a && b", OR: "a || b", NAND: "!(a && b)", NOR: "!(a || b)", XOR: "a != b", XNOR: "a == b" };

export default {
  id: "gates",
  art: () => a.picture("An AND gate with two inputs and one output",
    a.path("M70,35 L105,35 A40,40 0 0 1 105,115 L70,115 Z") + a.line([[25, 55], [70, 55]]) + a.line([[25, 95], [70, 95]]) +
      a.line([[145, 75], [185, 75]], a.ACC) + a.text(18, 60, "1", 16, a.ACC, "end") + a.text(18, 100, "1", 16, a.ACC, "end") +
      a.text(170, 66, "1", 16, a.ACC) + a.text(98, 82, "&", 20, a.INK)),
  mount(root) {
    let gate = "AND", A = 1, B = 0;
    const toggles = h("div", { class: "bits" });
    const table = h("table", { class: "method" });
    const out = readout("Output");
    const code = h("pre", { class: "code" });
    const update = () => {
      const one = gate === "NOT";
      const bit = (name, v, set) => h("button", { type: "button", class: "bit", "aria-pressed": String(v === 1), "aria-label": `Input ${name}: ${v}`,
        onclick: () => { set(1 - v); update(); } }, h("span", { class: "digit" }, String(v)), h("span", { class: "weight" }, `input ${name}`));
      toggles.replaceChildren(bit("A", A, v => { A = v; }), ...(one ? [] : [bit("B", B, v => { B = v; })]));
      const y = GATES[gate](A, B);
      out.set(y ? "1 (HIGH)" : "0 (LOW)");
      const rows = one ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
      table.replaceChildren(
        h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "A"), one ? null : h("th", { scope: "col" }, "B"), h("th", { scope: "col" }, "Output"), h("th", { scope: "col" }, ""))),
        h("tbody", {}, rows.map(([ra, rb]) => {
          const here = ra === A && (one || rb === B);
          return h("tr", { class: here ? "now" : "" }, h("td", {}, String(ra)), one ? null : h("td", {}, String(rb)),
            h("td", {}, String(GATES[gate](ra, rb))), h("td", {}, here ? "← now" : ""));
        })));
      code.textContent = `bool a = ${A}${one ? "" : `, b = ${B}`};\nbool out = ${CODE[gate]};   // ${y}`;
    };
    root.append(h("div", { class: "stage" }, h("div", {}, toggles, table, code), h("div", { class: "controls" },
      choice("Gate", Object.keys(GATES).map(g => [g, g]), gate, v => { gate = v; update(); }),
      out.el,
      h("p", { class: "hint" }, "NAND alone can build every other gate. The lecture's 74HC30 is one NAND with 8 inputs: its output goes LOW only when all 8 are HIGH."))));
    update();
  },
};
