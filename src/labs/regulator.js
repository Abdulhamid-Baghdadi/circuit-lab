// Lowering a DC voltage (lecture 10, p. 17–19): a linear regulator such as the LM7805 burns the excess as heat;
// switching (PWM) loses little (p. 19). A series resistor, as in exercise 7, also burns the excess.
import { linearRegulator, si } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

// LM7805 limits from lecture 10, p. 18.
const MAX_IN = 15, MAX_I = 2;

export default {
  id: "regulator",
  art: () => a.picture("A regulator block between a high and a low voltage, giving off heat",
    a.line([[15, 80], [65, 80]]) + a.rect(65, 55, 70, 50) + a.text(100, 86, "7805", 16, a.INK) + a.line([[135, 80], [185, 80]]) +
      a.text(35, 70, "12 V", 14, a.DIM) + a.text(165, 70, "5 V", 14, a.ACC) +
      ["M82,45 q5,-6 0,-12 q-5,-6 0,-12", "M100,45 q5,-6 0,-12 q-5,-6 0,-12", "M118,45 q5,-6 0,-12 q-5,-6 0,-12"].map(d => a.path(d, a.HOT, 2)).join("")),
  mount(root) {
    let Uin = 12, I = 0.5;
    const lin = readout("Linear regulator: heat = (Uin − 5 V) × I"), eff = readout("Its efficiency, at best 5 V / Uin");
    const update = () => {
      const r = linearRegulator(Uin, 5, I);
      const warn = Uin > MAX_IN ? `Above ${MAX_IN} V: too much for an LM7805 (lecture 10, p. 18).` : I > MAX_I ? `Above ${MAX_I} A: too much for an LM7805 (p. 18).` : "";
      lin.set(r.works ? si(r.Ploss, "W") : "—", !r.works || Uin > MAX_IN || I > MAX_I ? "danger" : "",
        r.works ? warn : "It can only lower a voltage: below 5 V in, it cannot give 5 V out.");
      eff.set(r.works ? `${(r.efficiency * 100).toFixed(0)} % at best` : "—", "", r.works ? "Its own small current is left out; the input needs some volts above 5 V (the datasheet gives how many)." : "");
    };
    root.append(h("div", { class: "stage" }, h("div", { class: "controls" },
        slider({ label: "Input voltage Uin", unit: "V", min: 3, max: 24, value: Uin, step: 0.5, onInput: v => { Uin = v; update(); } }),
        slider({ label: "Load current I", unit: "A", min: 0.01, max: 3, value: I, step: 0.01, onInput: v => { I = v; update(); } })),
      h("div", { class: "controls" }, lin.el, eff.el,
        h("p", { class: "hint" }, "Pulsing (PWM) loses little (lecture 10, p. 19). To raise a voltage you need DC → AC → DC: a regulator or a resistor can only lower it."))));
    update();
  },
};
