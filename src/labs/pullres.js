// A button on a digital pin (lecture 5, slides 42–44): without a resistor the open pin is "an antenna" and reads
// whatever it picks up; a 10 kΩ pull-down (or the built-in pull-up) gives it a defined level. A floating read is
// shown as "?": it has no defined value, so the lab invents none.
import { buttonPin, si } from "../core/index.js";
import { h, s, slider, readout, choice } from "../ui/kit.js";
import { svg, wire, resistor } from "../ui/schematic.js";
import * as a from "../ui/art.js";

const SAMPLES = 40;

function button(x, y1, y2, pressed) {
  const mid = (y1 + y2) / 2;
  return s("g", { class: "part" }, wire([[x, y1], [x, mid - 14]]), wire([[x, mid + 14], [x, y2]]),
    s("circle", { cx: x, cy: mid - 14, r: 3, class: "body" }), s("circle", { cx: x, cy: mid + 14, r: 3, class: "body" }),
    s("line", { x1: x, y1: mid + 14, x2: pressed ? x : x + 18, y2: mid - 14, class: "plate" }),
    s("text", { x: x - 14, y: mid + 5, class: "label", "text-anchor": "end" }, pressed ? "pressed" : "open"));
}

export default {
  id: "pullres",
  art: () => a.picture("A button to 5 V and a resistor to ground, with the pin between them",
    a.text(60, 22, "5 V", 14, a.DIM) + a.line([[60, 28], [60, 45]]) + a.circle(60, 48, 3, a.INK, 2) + a.line([[60, 74], [76, 50]]) +
      a.circle(60, 74, 3, a.INK, 2) + a.line([[60, 77], [60, 89]]) + a.resistor(60, 105, true, a.ACC) + a.line([[60, 121], [60, 132]]) +
      a.line([[46, 132], [74, 132]]) + a.arrow(60, 84, 125, 84, a.INK, 2) + a.text(150, 90, "D2", 18, a.INK) + a.text(150, 60, "0 / 1", 14, a.ACC)),
  mount(root) {
    let wiring = "none", pressed = false, R = 10e3;
    const pic = h("div", { class: "drawing" });
    const trace = h("div", { class: "trace", role: "img" });
    const read = readout("digitalRead(2)"), current = readout("Current through the resistor while pressed");
    const press = h("button", { type: "button", class: "press", "aria-pressed": "false",
      onclick: () => { pressed = !pressed; update(); } }, "Press the button");
    const update = () => {
      const p = buttonPin(wiring, pressed, R);
      press.setAttribute("aria-pressed", String(pressed));
      press.textContent = pressed ? "Release the button" : "Press the button";
      const upper = wiring === "pullup" ? resistor(220, 40, 220, 120, si(R, "Ω")) : button(220, 40, 120, pressed);
      const lower = wiring === "pullup" ? button(220, 140, 220, pressed) : wiring === "pulldown" ? resistor(220, 140, 220, 220, si(R, "Ω")) : null;
      pic.replaceChildren(svg(460, 260, `Pin D2 between ${wiring === "pullup" ? "a resistor to 5 V and a button to ground" : wiring === "pulldown" ? "a button to 5 V and a resistor to ground" : "a button to 5 V and nothing to ground"}`,
        s("text", { x: 220, y: 28, class: "label", "text-anchor": "middle" }, "5 V"), upper, wire([[220, 120], [220, 140]]),
        wire([[220, 130], [360, 130]]), s("text", { x: 368, y: 135, class: "label" }, "D2"), lower,
        lower ? s("text", { x: 220, y: 248, class: "label", "text-anchor": "middle" }, "GND") : s("text", { x: 236, y: 190, class: "label" }, "nothing: the pin floats"),
        lower ? wire([[200, 232], [240, 232]]) : null));
      // Forty reads in a row: a defined level repeats; a floating pin has no defined value.
      const reads = Array.from({ length: SAMPLES }, () => p.level ?? "?");
      trace.replaceChildren(...reads.map(v => h("span", { class: `bit-${v}` }, String(v))));
      trace.setAttribute("aria-label", `Forty reads in a row: ${reads.join(" ")}`);
      read.set(p.level === null ? "undefined" : p.level ? "HIGH (1)" : "LOW (0)", p.level === null ? "danger" : "",
        p.level === null ? "The open pin picks up whatever is near: an antenna." : wiring === "pullup" ? "With a pull-up, pressed reads LOW: the logic turns round." : "");
      current.set(wiring === "none" ? "—" : si(buttonPin(wiring, true, R).I, "A"), "", wiring === "none" ? "" : "I = 5 V / R while the button is held.");
    };
    root.append(h("div", { class: "stage" }, h("div", {}, pic, h("p", { class: "hint" }, "The last forty reads:"), trace),
      h("div", { class: "controls" },
        choice("Wiring", [["none", "Button only"], ["pulldown", "Pull-down to GND"], ["pullup", "Pull-up to 5 V (INPUT_PULLUP)"]], wiring, v => { wiring = v; update(); }),
        press,
        slider({ label: "Resistor", unit: "Ω", min: 100, max: 100e3, value: R, log: true, onInput: v => { R = v; update(); } }),
        read.el, current.el,
        h("p", { class: "hint" }, "The course's guideline: 10 kΩ. Red wire to 5 V, black to GND."))));
    update();
  },
};
