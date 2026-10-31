// Number bases and binary addition (lecture 11, p. 6–16): one number in decimal, binary, octal and hexadecimal, and
// two binary numbers added column by column with their carries.
import { inBase, addBinary } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

export default {
  id: "bases",
  art: () => a.picture("The number 26 written as 11010, 32 and 1A",
    a.text(100, 40, "26", 26, a.INK) + a.text(100, 75, "11010", 22, a.ACC) + a.text(60, 115, "32", 20, a.COOL) + a.text(140, 115, "1A", 20, a.HOT) +
      a.text(60, 135, "octal", 11, a.DIM) + a.text(140, 135, "hex", 11, a.DIM)),
  mount(root) {
    let n = 26, x = 7, y = 5;
    const forms = h("table", { class: "method" });
    const sum = h("pre", { class: "code add" });
    const result = readout("Sum");
    const update = () => {
      forms.replaceChildren(h("thead", {}, h("tr", {}, ["Base", "Written", "Grouped"].map(t => h("th", { scope: "col" }, t)))),
        h("tbody", {}, [[10, "decimal", ""], [2, "binary", "groups of 4 bits = 1 hex digit"], [8, "octal", "groups of 3 bits"], [16, "hexadecimal", "0–9, then A–F"]]
          .map(([b, name, note]) => h("tr", {}, h("td", { class: "text" }, `${name} (${b})`), h("td", {}, inBase(n, b)), h("td", { class: "text" }, note)))));
      const r = addBinary(x, y, 4), bin = v => v.toString(2).padStart(4, "0");
      sum.textContent = ` carry  ${r.carries.join("")}\n         ${bin(x)}   (${x})\n       + ${bin(y)}   (${y})\n       ------\n         ${bin(r.sum)}   (${r.sum})`;
      result.set(`${bin(r.sum)} = ${r.sum}`, r.overflow ? "danger" : "", r.overflow ? `${x} + ${y} = ${x + y} needs a fifth bit: in 4 bits the carry falls off.` : "1 + 1 = 10: write 0, carry 1.");
    };
    root.append(h("div", { class: "stage" }, h("div", { class: "controls" },
        h("h3", {}, "One number, four ways"),
        slider({ label: "Number", unit: "", min: 0, max: 255, value: n, step: 1, format: String, onInput: v => { n = v; update(); } }),
        forms),
      h("div", { class: "controls" },
        h("h3", {}, "Adding in binary"),
        slider({ label: "First number", unit: "", min: 0, max: 15, value: x, step: 1, format: String, onInput: v => { x = v; update(); } }),
        slider({ label: "Second number", unit: "", min: 0, max: 15, value: y, step: 1, format: String, onInput: v => { y = v; update(); } }),
        sum, result)));
    update();
  },
};
