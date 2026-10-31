// The chain from a knob to a servo, as in the course's jury question: a voltage on A0, the number analogRead gives,
// map() to an angle, the servo turning. A staircase shows that the converter only knows whole steps.
import { adcRead, lsb, map, si } from "../core/index.js";
import { h, s, slider, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

const W = 460, H = 260, PAD = 52;

/** The converter's staircase around the voltage U: a window of a few steps, so the steps can be seen. */
function staircase(U, bits) {
  const step = lsb(5, bits), span = step * 8, lo = Math.max(0, U - span / 2), hi = lo + span;
  const x = u => PAD + (u - lo) / span * (W - PAD - 12);
  const v0 = adcRead(lo, 5, bits), v1 = adcRead(hi, 5, bits) + 1;
  const y = v => H - PAD - (v - v0) / Math.max(1, v1 - v0) * (H - PAD - 16);
  const pts = [];
  for (let v = v0; v <= v1; v++) {
    const a = Math.max(lo, v * step), b = Math.min(hi, (v + 1) * step);
    if (a < b) pts.push(`${x(a)},${y(v)} ${x(b)},${y(v)}`);
  }
  return s("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", class: "chart",
      "aria-label": `Staircase of analogRead around ${si(U, "V")}: each step is ${si(step, "V")} wide` },
    s("line", { x1: PAD, y1: H - PAD, x2: W - 8, y2: H - PAD, class: "axis" }),
    s("line", { x1: PAD, y1: 10, x2: PAD, y2: H - PAD, class: "axis" }),
    s("polyline", { points: pts.join(" "), class: "series", fill: "none" }),
    s("line", { x1: x(U), y1: 10, x2: x(U), y2: H - PAD, class: "marker" }),
    s("text", { x: PAD, y: H - PAD + 18, class: "tick" }, si(lo, "V")),
    s("text", { x: W - 8, y: H - PAD + 18, class: "tick", "text-anchor": "end" }, si(hi, "V")),
    s("text", { x: PAD - 6, y: H - PAD, class: "tick", "text-anchor": "end" }, String(v0)),
    s("text", { x: PAD - 6, y: 22, class: "tick", "text-anchor": "end" }, String(v1)),
    s("text", { x: (W + PAD) / 2, y: H - 10, class: "axis-label", "text-anchor": "middle" }, "Voltage on A0 [V]"),
    s("text", { x: 14, y: (H - PAD) / 2, class: "axis-label", "text-anchor": "middle", transform: `rotate(-90 14 ${(H - PAD) / 2})` },
      "analogRead [–]"));
}

function servo(angle) {
  const a = (180 - angle) * Math.PI / 180, cx = 110, cy = 110;
  return s("svg", { viewBox: "0 0 220 130", role: "img", class: "servo", "aria-label": `A servo arm at ${angle}°` },
    s("path", { d: "M 20 110 A 90 90 0 0 1 200 110", class: "track", fill: "none" }),
    s("text", { x: 20, y: 126, class: "tick", "text-anchor": "middle" }, "0°"),
    s("text", { x: 200, y: 126, class: "tick", "text-anchor": "middle" }, "180°"),
    s("line", { x1: cx, y1: cy, x2: cx + 80 * Math.cos(a), y2: cy - 80 * Math.sin(a), class: "arm" }),
    s("circle", { cx, cy, r: 8, class: "hub" }));
}

// The card's picture: eight whole steps under the ramp.
const stairs = () => Array.from({ length: 8 }, (_, k) => [[20 + k * 20, 130 - k * 13.75], [40 + k * 20, 130 - k * 13.75]]).flat();

export default {
  id: "adc",
  art: () => a.picture("A straight voltage ramp and the staircase of whole steps that follows it",
    a.line([[20, 130], [180, 20]], a.DIM, 2) + a.line(stairs(), a.ACC) + a.text(20, 145, "0 V", 12, a.DIM, "start") +
      a.text(186, 18, "1023", 12, a.DIM, "end")),
  mount(root) {
    let U = 2.5, bits = 10;
    const chart = h("div", { class: "drawing" }), arm = h("div", { class: "drawing small" });
    const code = h("pre", { class: "code" });
    const read = readout("analogRead(A0)"), angle = readout("map(value, 0, top, 0, 180)"), step = readout("One step is");
    const update = () => {
      const top = 2 ** bits - 1, v = adcRead(U, 5, bits), deg = map(v, 0, top, 0, 180);
      read.set(String(v), "", `of 0 to ${top}`);
      angle.set(`${deg}°`, "", "map() cuts off the decimals");
      step.set(si(lsb(5, bits), "V"), "", `5 V / 2^${bits} = 5 / ${2 ** bits}`);
      chart.replaceChildren(staircase(U, bits));
      arm.replaceChildren(servo(deg));
      code.textContent = `int value = analogRead(A0);        // ${v}\nint angle = map(value, 0, ${top}, 0, 180); // ${deg}\nmyservo.write(angle);`;
    };
    root.append(h("div", { class: "stage" }, h("div", {}, chart, arm, code), h("div", { class: "controls" },
      slider({ label: "Voltage on A0", unit: "V", min: 0, max: 5, value: U, step: 0.001, onInput: x => { U = x; update(); } }),
      choice("Resolution", [["10", "10 bits (default)"], ["14", "14 bits (UNO R4, analogReadResolution(14))"]], "10",
        x => { bits = Number(x); update(); }),
      read.el, angle.el, step.el,
      h("p", { class: "hint" }, "Move the voltage by less than one step: the number does not change."))));
    update();
  },
};
