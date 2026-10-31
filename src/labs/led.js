// The LED's series resistor (lesson 3, slide 26): the LED keeps its own voltage, the resistor takes the rest. The
// student picks a resistor they can buy (E12) and sees the current and the brightness that result.
import { ledResistor, e12, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import { svg, wire, resistor, source, led } from "../ui/schematic.js";
import * as a from "../ui/art.js";

// Exercise 11's LED: red, 2 V, 20 mA. Other LEDs: their datasheet gives the voltage and the current.
const IMAX = 0.02;

export default {
  id: "led",
  art: () => a.picture("An LED with its series resistor, giving off light",
    a.line([[90, 15], [90, 24]]) + a.resistor(90, 40, true) + a.line([[90, 56], [90, 68]]) +
      a.line([[76, 68], [104, 68], [90, 92], [76, 68]]) + a.line([[76, 92], [104, 92]]) + a.line([[90, 92], [90, 135]]) +
      a.arrow(112, 70, 136, 56, a.ACC, 2, 7) + a.arrow(114, 86, 140, 74, a.ACC, 2, 7)),
  mount(root) {
    let U = 5, Uf = 2, I = 0.02;
    const pic = h("div", { class: "drawing" });
    const need = readout("Resistor needed R = (U − ULED) / I"), buy = readout("Nearest you can buy (E12, next higher)"),
          result = readout("With that resistor");
    const update = () => {
      if (U <= Uf) {
        need.set("—", "danger", `The supply must be above the LED's ${Uf} V, or it stays dark.`);
        buy.set("—"); result.set("—");
        pic.replaceChildren(svg(300, 260, "An LED with a series resistor on a source, dark", source(50, 40, 220, "U"),
          wire([[50, 40], [180, 40], [180, 50]]), resistor(180, 50, 180, 120, "R"), led(180, 120, 210, "LED", 0), wire([[180, 210], [180, 220], [50, 220]])));
        return;
      }
      const R = ledResistor(U, Uf, I), Rbuy = e12(R, "up"), Ireal = (U - Uf) / Rbuy, P = (U - Uf) * Ireal;
      need.set(si(R, "Ω"));
      buy.set(si(Rbuy, "Ω"), "", `Uresistor = ${si(U - Uf, "V")}`);
      result.set(`I = ${si(Ireal, "A")}, P = ${si(P, "W")} in the resistor`, Ireal > IMAX ? "warn" : "",
        Ireal > IMAX ? "More than the 20 mA of exercise 11's LED: check the datasheet of yours." : "");
      pic.replaceChildren(svg(300, 260, `An LED with a ${si(Rbuy, "Ω")} series resistor on a source`, source(50, 40, 220, "U"),
        wire([[50, 40], [180, 40], [180, 50]]), resistor(180, 50, 180, 120, si(Rbuy, "Ω")),
        led(180, 120, 210, "LED", 1), wire([[180, 210], [180, 220], [50, 220]])));
    };
    root.append(h("div", { class: "stage" }, pic, h("div", { class: "controls" },
      slider({ label: "LED voltage ULED", unit: "V", min: 1.5, max: 3.5, value: Uf, step: 0.1, onInput: v => { Uf = v; update(); },
        help: "From the LED's datasheet; exercise 11's red LED takes 2 V." }),
      slider({ label: "Supply U", unit: "V", min: 1, max: 12, value: U, step: 0.1, onInput: v => { U = v; update(); } }),
      slider({ label: "Wanted current I", unit: "A", min: 0.001, max: 0.03, value: I, step: 0.001, onInput: v => { I = v; update(); } }),
      need.el, buy.el, result.el,
      h("p", { class: "hint" }, "Remember KNAP: Kathode Negatief, Anode Positief. The flat side is the cathode (lesson 5)."))));
    update();
  },
};
