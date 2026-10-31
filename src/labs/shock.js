// Ohm's law applied to a person: the body resistance of lesson 4, slide 8 and the table of effects of slide 7. The
// row the current falls in is marked in words, not by colour alone.
import { ohm, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

// Lesson 4, slide 8.
const CONTACT = { rubber: [10e6, "Rubber shoes, insulated, about 10 MΩ"], leather: [15e3, "Leather shoes, about 15 kΩ"],
                  damp: [5e3, "Damp room or puddle, about 5 kΩ"] };
// Lesson 4, slide 7: the current from which each effect starts, DC and AC. Tissue burns has no AC value on the slide.
const EFFECTS = [
  [1e-3, 0.4e-3, "Tingling"],
  [5e-3, 1e-3, "Pain, shock"],
  [30e-3, 10e-3, "Pain, still just able to let go, strong shock"],
  [150e-3, 30e-3, "Extreme pain, risk of cardiac arrest"],
  [1, 120e-3, "High risk of cardiac arrest within 3 seconds"],
  [10, null, "Tissue burns"],
];

export default {
  id: "shock",
  art: () => a.picture("A person reaching towards a lightning bolt",
    a.circle(45, 38, 10) + a.line([[45, 48], [45, 95]]) + a.line([[30, 130], [45, 95], [60, 130]]) +
      a.line([[28, 80], [45, 62], [82, 54]]) + a.line([[15, 135], [185, 135]], a.DIM, 2) +
      a.line([[122, 15], [96, 72], [116, 72], [100, 128], [142, 58], [120, 58], [138, 15], [122, 15]], a.HOT, 3)),
  mount(root) {
    let contact = "leather", ac = true, U = 230;
    const current = readout("Current through the body I = U / R");
    const table = h("table", { class: "method" });
    const update = () => {
      const { I } = ohm({ U, R: CONTACT[contact][0] });
      const col = ac ? 1 : 0;
      const reached = EFFECTS.filter(e => e[col] !== null && I >= e[col]).length;
      const worst = reached ? EFFECTS[reached - 1][2] : "Nothing felt";
      current.set(si(I, "A"), reached >= 4 ? "danger" : reached >= 2 ? "warn" : "", `${worst}.${ac && I >= 0.03 ? " A 30 mA differential breaker trips." : ""}`);
      table.replaceChildren(
        h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "From DC"), h("th", { scope: "col" }, "From AC"), h("th", { scope: "col" }, "Effect"), h("th", { scope: "col" }, ""))),
        h("tbody", {}, EFFECTS.map((e, k) => h("tr", { class: k === reached - 1 ? "here" : "" },
          h("td", {}, si(e[0], "A")), h("td", {}, e[1] === null ? "–" : si(e[1], "A")), h("td", { class: "text" }, e[2]),
          h("td", {}, k === reached - 1 ? "← you" : "")))));
    };
    root.append(h("div", { class: "stage" }, h("div", {}, table, h("p", { class: "source" }, "Table: EAVP lesson 4, slide 7.")),
      h("div", { class: "controls" },
        choice("Standing on", Object.entries(CONTACT).map(([k, [, t]]) => [k, t]), contact, v => { contact = v; update(); }),
        choice("Kind of voltage", [["ac", "AC (mains)"], ["dc", "DC"]], "ac", v => { ac = v === "ac"; update(); }),
        slider({ label: "Voltage touched U", unit: "V", min: 1, max: 400e3, value: U, log: true, onInput: v => { U = v; update(); } }),
        current.el,
        h("p", { class: "hint" }, "AC is more dangerous than DC at the same current. Try 230 V on each floor."),
        h("p", { class: "hint" }, "Two kinds of protection (lecture 4): the earth-leakage breaker (30 mA, or 300 mA for the whole house) protects people; the fuse or circuit breaker (10 to 40 A) protects cables and devices. Only the first one saves you here."))));
    update();
  },
};
