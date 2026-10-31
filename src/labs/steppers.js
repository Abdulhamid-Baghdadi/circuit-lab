// Stepper or servo (lecture 13, p. 22–26; lesson 14): a stepper counts its steps (1.8° each) but has no feedback,
// so steps it skips under too much load go unnoticed; a servo measures its angle and gets there.
import { stepper, servo } from "../core/index.js";
import { h, s, slider, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

function dial(x, deg, label, cls) {
  const r = (deg - 90) * Math.PI / 180;
  return s("g", {}, s("circle", { cx: x, cy: 110, r: 70, class: "dial" }),
    s("line", { x1: x, y1: 110, x2: x + 62 * Math.cos(r), y2: 110 + 62 * Math.sin(r), class: cls }),
    s("circle", { cx: x, cy: 110, r: 6, class: "hub" }), s("text", { x, y: 205, class: "label", "text-anchor": "middle" }, label));
}

export default {
  id: "steppers",
  art: () => a.picture("A stepper's toothed rotor beside a servo arm",
    a.circle(60, 75, 36) + Array.from({ length: 12 }, (_, k) => { const t = k * Math.PI / 6;
      return a.line([[60 + 36 * Math.cos(t), 75 + 36 * Math.sin(t)], [60 + 44 * Math.cos(t), 75 + 44 * Math.sin(t)]], a.INK, 3); }).join("") +
      a.circle(60, 75, 5, a.ACC, 2, a.ACC) + a.rect(118, 50, 60, 40) + a.line([[148, 70], [175, 40]], a.ACC, 5) + a.circle(148, 70, 5, a.INK, 2, a.INK)),
  mount(root) {
    let steps = 50, load = 0;
    const pic = h("div", { class: "drawing" });
    const st = readout("The stepper thinks it is at"), real = readout("It really is at"), sv = readout("The servo, told the same angle");
    const update = () => {
      // Too much load: from 50 % on, one step in (12 − load/10) is skipped, at least one in two; a made-up model to show the effect.
      const skipEvery = load >= 50 ? Math.max(2, Math.round(12 - load / 10)) : 0;
      const m = stepper(steps, 1.8, skipEvery), target = m.believed % 360, servoAt = servo(target);
      st.set(`${target.toFixed(1)}°`, "", `${steps} steps × 1.8°`);
      real.set(`${(m.actual % 360).toFixed(1)}°`, m.lost ? "danger" : "", m.lost ? `${m.lost} steps skipped, and the stepper does not know.` : "No steps lost.");
      sv.set(target > 180 ? "180°" : `${servoAt.toFixed(1)}°`, target > 180 ? "warn" : "", target > 180 ? "A standard servo turns 0–180° only." : "It measures and corrects: always where it was told.");
      pic.replaceChildren(s("svg", { viewBox: "0 0 460 220", role: "img", class: "schematic",
          "aria-label": `Stepper at ${(m.actual % 360).toFixed(0)} degrees, thinking ${target.toFixed(0)}; servo at ${servoAt.toFixed(0)} degrees` },
        dial(115, m.actual % 360, "stepper", "arm"), s("line", { x1: 115, y1: 110, x2: 115 + 62 * Math.cos((target - 90) * Math.PI / 180), y2: 110 + 62 * Math.sin((target - 90) * Math.PI / 180), class: "marker" }),
        dial(345, servoAt, "servo", "arm")));
    };
    root.append(h("div", { class: "stage" }, h("div", {}, pic, h("p", { class: "hint" }, "Dashed: where the stepper thinks it is.")), h("div", { class: "controls" },
      slider({ label: "Steps sent", unit: "", min: 0, max: 200, value: steps, step: 1, format: v => `${v} steps`, onInput: v => { steps = v; update(); },
        help: "200 steps of 1.8° make one turn." }),
      slider({ label: "Load on the shaft", unit: "%", min: 0, max: 100, value: load, step: 5, format: v => `${v} %`, onInput: v => { load = v; update(); },
        help: "Above 50 % this lab lets the stepper skip steps: a made-up model to show the effect, not a real torque curve." }),
      st.el, real.el, sv.el,
      h("p", { class: "hint" }, "That is why a 3D printer moves to its end switch first: the stepper does not know its 0 position."))));
    update();
  },
};
