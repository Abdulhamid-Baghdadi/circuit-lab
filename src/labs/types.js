// Variable types (lesson 7) and what happens past their end (lesson 9, typecasting; lecture 13, the Boeing 787). An
// unsigned type wraps round by the rules of C++; for a signed type C++ defines no result, which lesson 9 calls "an
// incorrect result", so the lab shows none.
import { intType, intDivide, toInt } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

export default {
  id: "types",
  art: () => a.picture("A byte rolling over from 255 back to 0",
    a.rect(25, 45, 150, 46) + a.text(100, 78, "255", 26, a.INK) + a.arrow(100, 98, 100, 118, a.ACC, 3) + a.text(100, 140, "0", 20, a.HOT) +
      a.text(100, 35, "+1", 16, a.ACC)),
  mount(root) {
    const board = "R3";
    let type = "unsigned int", value = 65530;
    const range = readout("Range"), stored = readout("What the variable holds");
    const typecast = h("table", { class: "method" });
    const update = () => {
      const t = intType(board, type);
      range.set(`${t.min.toLocaleString("en-GB")} to ${t.max.toLocaleString("en-GB")}`, "", `${t.bits} bits (lesson 7's table)`);
      const fits = value >= t.min && value <= t.max, signed = t.min < 0;
      if (fits) stored.set(value.toLocaleString("en-GB"), "", "It fits.");
      else if (signed) stored.set("an incorrect result", "danger", `${value.toLocaleString("en-GB")} does not fit a signed ${type}. Lesson 9: overflow gives an incorrect result; C++ does not say which.`);
      else stored.set(t.store(value).toLocaleString("en-GB"), "danger", `${value.toLocaleString("en-GB")} does not fit: an unsigned ${type} wraps round, counted modulo 2^${t.bits}. No error, no warning.`);
    };
    typecast.append(h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Code"), h("th", { scope: "col" }, "Gives"), h("th", { scope: "col" }, "Why"))),
      h("tbody", {}, [["(int)10.75", toInt(10.75), "the decimals are cut off, not rounded"], ["(int)23.67", toInt(23.67), "the same: 23, not 24"],
        ["100 / 3", intDivide(100, 3), "two whole numbers give a whole number"], ["(float)100 / 3", (100 / 3).toFixed(2), "make one a float first"],
        ["(int)'A'", 65, "a char is its ASCII number"]].map(([c, v, why]) =>
        h("tr", {}, h("td", { class: "text" }, h("code", {}, c)), h("td", {}, String(v)), h("td", { class: "text" }, why)))));
    root.append(h("div", { class: "stage" }, h("div", { class: "controls" },
        choice("Type", [["byte", "byte"], ["int", "int"], ["unsigned int", "unsigned int"], ["long", "long"], ["unsigned long", "unsigned long"]], type,
          v => { type = v; update(); }),
        slider({ label: "Value to store", unit: "", min: -40000, max: 70000, value, step: 1, format: v => v.toLocaleString("en-GB"), onInput: v => { value = v; update(); } }),
        h("div", { class: "row" }, ...[-1, 1].map(d => h("button", { type: "button", onclick: () => { value += d; update(); } }, d > 0 ? "+1" : "−1"))),
        range.el, stored.el,
        h("p", { class: "hint" }, "Lecture 13, p. 34, the Boeing 787: a 32-bit integer of at most 2 147 483 647, counting time, overflowed after 248 days.")),
      h("div", {}, h("h3", {}, "Typecasting (lesson 9)"), typecast)));
    update();
  },
};
