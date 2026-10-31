// Bits you can flip (lesson 11): each place shows its weight, the sum is the number, and the same pattern read as
// two's complement shows how a processor stores a negative number.
import { places, fromTwos, twos, flashComparators } from "../core/index.js";
import { h, readout, choice } from "../ui/kit.js";

export default {
  id: "binary",
  mount(root) {
    let bits = 4, value = 0b1011;
    const row = h("div", { class: "bits", role: "group", "aria-label": "The bits, most significant first" });
    const unsigned = readout("Read as a whole number (unsigned)"), signed = readout("Read as two's complement (signed)");
    const steps = h("p", { class: "hint" });
    const flash = readout("A flash ADC of this many bits needs 2ⁿ − 1 comparators");
    const update = () => {
      const p = places(value, bits), pattern = p.map(x => x.digit).join("");
      row.replaceChildren(...p.map((x, k) => h("button", { type: "button", class: "bit", "aria-pressed": String(x.digit === 1),
          "aria-label": `Bit worth ${x.weight}: ${x.digit}`, onclick: () => { value ^= x.weight; update(); row.children[k].focus(); } },
        h("span", { class: "digit" }, String(x.digit)), h("span", { class: "weight" }, String(x.weight)))));
      const sum = p.filter(x => x.digit).map(x => x.weight);
      unsigned.set(String(value), "", `${pattern}₂ = ${sum.length ? sum.join(" + ") : "0"}`);
      const n = fromTwos(pattern);
      signed.set(String(n), "", pattern[0] === "1" ? "The first bit is 1, so negative." : "The first bit is 0, so the same as unsigned.");
      if (n < 0) {
        const inverted = pattern.replace(/./g, c => c === "1" ? "0" : "1");
        steps.textContent = `Invert ${pattern} to ${inverted}, add 1: ${twos(-n, bits)} = ${-n}. So ${pattern} is −${-n}.`;
      } else steps.textContent = `−${n || 1} would be ${twos(-(n || 1), bits)}: invert ${twos(n || 1, bits)} and add 1.`;
      flash.set(String(flashComparators(bits)));
    };
    root.append(h("div", { class: "stage" }, h("div", {}, row, steps), h("div", { class: "controls" },
      choice("Number of bits", [["4", "4 bits (a nibble)"], ["8", "8 bits (a byte)"]], "4",
        v => { bits = Number(v); value &= 2 ** bits - 1; update(); }),
      unsigned.el, signed.el, flash.el,
      h("p", { class: "hint" }, "Click a bit to flip it. Each place is worth twice the one to its right."))));
    update();
  },
};
