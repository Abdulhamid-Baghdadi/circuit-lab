// Ohm's law as a circuit you can turn: the voltage and the resistance are the controls, the current follows, never
// the other way round (lesson 1, slide 38). Dots move along the wire at a speed set by the current.
import { ohm, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import { svg, wire, resistor, source, meter } from "../ui/schematic.js";
import * as a from "../ui/art.js";

// A quarter-watt resistor, the kind in the kit and on a breadboard.
const RATING = 0.25;

export default {
  id: "ohm",
  art: () => a.picture("A source and a resistor in a loop, the current arrow along the top wire",
    a.line([[40, 68], [40, 35], [140, 35], [140, 59]]) + a.line([[140, 91], [140, 115], [40, 115], [40, 82]]) + a.cell(40, 75) +
      a.resistor(140, 75, true) + a.arrow(70, 22, 112, 22, a.ACC) + a.text(91, 58, "I", 20, a.ACC) + a.text(18, 81, "U", 16, a.DIM) +
      a.text(164, 81, "R", 16, a.DIM)),
  mount(root) {
    let U = 5, R = 220;
    const A = meter(250, 40, "A", ""), V = meter(380, 130, "V", "", "right");
    const flow = wire([[60, 40], [320, 40], [320, 220], [60, 220], [60, 40]], "flow");
    const drawing = svg(460, 270, "A source, a resistor and an ammeter in series, a voltmeter across the resistor",
      flow, wire([[60, 40], [236, 40]]), wire([[264, 40], [320, 40], [320, 90]]), resistor(320, 90, 320, 170, "R"),
      wire([[320, 170], [320, 220], [60, 220]]), source(60, 40, 220, "U"),
      wire([[320, 90], [380, 90], [380, 116]]), wire([[380, 144], [380, 170], [320, 170]]),
      A.el, V.el);
    const current = readout("Current I = U / R"), heat = readout("Power in the resistor P = U × I");
    const update = () => {
      const { I } = ohm({ U, R });
      const P = U * I;
      A.set(si(I, "A")); V.set(si(U, "V"));
      current.set(si(I, "A"));
      heat.set(si(P, "W"), P > RATING ? "danger" : P > RATING / 2 ? "warn" : "",
        P > RATING ? `Too hot: a ${RATING} W resistor burns.` : P > RATING / 2 ? "Warm: over half its rating." : "");
      // Faster dots for more current; the log keeps µA and A both visible.
      const speed = Math.max(0.3, Math.min(8, 2 + Math.log10(I * 1000)));
      flow.style.setProperty("--speed", `${(4 / speed).toFixed(2)}s`);
    };
    root.append(
      h("div", { class: "stage" }, drawing,
        h("div", { class: "controls" },
          slider({ label: "Voltage U", unit: "V", min: 0.5, max: 24, value: U, step: 0.1, onInput: v => { U = v; update(); } }),
          slider({ label: "Resistance R", unit: "Ω", min: 10, max: 1e6, value: R, log: true, onInput: v => { R = v; update(); } }),
          choice("Draw the current as", [["technical", "Technical current, + to −"], ["electrons", "Electrons, − to +"]], "technical",
            v => { flow.classList.toggle("electrons", v === "electrons"); }),
          current.el, heat.el,
          h("p", { class: "hint" }, "Double the voltage: the current doubles, the power goes ×4. Try it. The course always draws the technical current, + to −; the electrons really move the other way (lecture 1, slide 33)."))));
    update();
  },
};
