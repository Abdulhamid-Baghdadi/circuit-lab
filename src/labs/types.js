// Variable types (lesson 7) and what happens past their end (lesson 9, typecasting; lecture 13, the Boeing 787): a
// whole number in a fixed number of bits wraps round, without a warning.
import { intType, intDivide, toInt } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

export default {
  id: "types",
  art: () => a.picture("A counter rolling over from its highest value back to its lowest",
    a.rect(25, 45, 150, 46) + a.text(100, 78, "32767", 26, a.INK) + a.arrow(100, 98, 100, 118, a.ACC, 3) + a.text(100, 140, "−32768", 20, a.HOT) +
      a.text(100, 35, "+1", 16, a.ACC)),
  mount(root) {
    let board = "R3", type = "int", value = 32760;
    const range = readout("Range"), stored = readout("What the variable holds");
    const typecast = h("table", { class: "method" });
    const update = () => {
      const t = intType(board, type);
      range.set(`${t.min.toLocaleString("en-GB")} to ${t.max.toLocaleString("en-GB")}`, "", `${t.bits} bits on the UNO ${board}`);
      const s = t.store(value);
      stored.set(s.toLocaleString("en-GB"), s !== value ? "danger" : "",
        s !== value ? `${value.toLocaleString("en-GB")} does not fit: it wrapped round. No error, no warning.` : "It fits.");
    };
    typecast.append(h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Code"), h("th", { scope: "col" }, "Gives"), h("th", { scope: "col" }, "Why"))),
      h("tbody", {}, [["(int)10.75", toInt(10.75), "the decimals are cut off, not rounded"], ["(int)23.67", toInt(23.67), "the same: 23, not 24"],
        ["100 / 3", intDivide(100, 3), "two whole numbers give a whole number"], ["(float)100 / 3", (100 / 3).toFixed(2), "make one a float first"],
        ["(int)'A'", 65, "a char is its ASCII number"]].map(([c, v, why]) =>
        h("tr", {}, h("td", { class: "text" }, h("code", {}, c)), h("td", {}, String(v)), h("td", { class: "text" }, why)))));
    root.append(h("div", { class: "stage" }, h("div", { class: "controls" },
        choice("Board", [["R3", "UNO R3 (lesson 7's table)"], ["R4", "UNO R4 (the kit)"]], board, v => { board = v; update(); }),
        choice("Type", [["byte", "byte"], ["int", "int"], ["unsigned int", "unsigned int"], ["long", "long"], ["unsigned long", "unsigned long"]], type,
          v => { type = v; update(); }),
        slider({ label: "Value to store", unit: "", min: -40000, max: 70000, value, step: 1, format: v => v.toLocaleString("en-GB"), onInput: v => { value = v; update(); } }),
        h("div", { class: "row" }, ...[-1, 1].map(d => h("button", { type: "button", onclick: () => { value += d; update(); } }, d > 0 ? "+1" : "−1"))),
        range.el, stored.el,
        h("p", { class: "hint" }, "On the UNO R4 an int is 4 bytes, like a long; lesson 7's 2-byte int is the UNO R3's. The Boeing 787 of lecture 13: a 32-bit counter of hundredths of a second overflows after 248 days.")),
      h("div", {}, h("h3", {}, "Typecasting (lesson 9)"), typecast)));
    update();
  },
};
