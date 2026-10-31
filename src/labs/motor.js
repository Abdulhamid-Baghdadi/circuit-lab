// Sizing a motor as lesson 13, p. 29 does: the ideal power to lift a load, then the worst case with a margin.
import { liftPower, si } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

export default {
  id: "motor",
  art: () => a.picture("A motor pulling a load up over a pulley",
    a.circle(45, 40, 16) + a.text(45, 46, "M", 16) + a.circle(150, 30, 10) + a.line([[45, 24], [150, 20]], a.INK, 2) +
      a.line([[160, 30], [160, 84]], a.INK, 2) + a.rect(140, 84, 40, 34, a.INK, 3) + a.line([[15, 135], [185, 135]], a.DIM, 2) +
      a.arrow(120, 116, 120, 66, a.ACC)),
  mount(root) {
    let m = 30, height = 2.5, t = 30, margin = 4;
    const force = readout("Force F = m × g"), speed = readout("Speed v = h / t"), ideal = readout("Ideal power P = F × v"),
          design = readout("Choose a motor of at least");
    const update = () => {
      const p = liftPower(m, height, t);
      force.set(si(p.F, "N"));
      speed.set(si(p.v, "m/s"));
      ideal.set(si(p.P, "W"), "", "No acceleration, no friction: in theory only.");
      design.set(si(p.P * margin, "W"), "", `${margin}× the ideal: heavier load, starting, friction, and not at its limit.`);
    };
    root.append(h("div", { class: "stage" }, h("div", { class: "controls" },
        slider({ label: "Mass m", unit: "kg", min: 0.1, max: 500, value: m, log: true, format: v => `${v} kg`, onInput: v => { m = v; update(); } }),
        slider({ label: "Height h", unit: "m", min: 0.1, max: 10, value: height, step: 0.1, onInput: v => { height = v; update(); } }),
        slider({ label: "Time t", unit: "s", min: 1, max: 120, value: t, step: 1, onInput: v => { t = v; update(); } }),
        slider({ label: "Safety factor", unit: "", min: 1, max: 6, value: margin, step: 0.5, format: v => `${v}×`, onInput: v => { margin = v; update(); },
          help: "Lecture 13, p. 29: for its door, 60 kg + acceleration + friction gives about 100 W, four times the ideal 25 W. That is this door, not a general rule." })),
      h("div", { class: "controls" }, force.el, speed.el, ideal.el, design.el,
        h("p", { class: "hint" }, "The same work done twice as fast needs twice the power."))));
    update();
  },
};
