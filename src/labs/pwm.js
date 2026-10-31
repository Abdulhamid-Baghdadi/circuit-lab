// analogWrite as what it is: a pin switching between 0 V and 5 V, high for value/255 of the time. The average is
// what an LED's brightness or a motor's speed follows (lesson 5, slide 54).
import { pwm, si } from "../core/index.js";
import { h, s, slider, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

const W = 460, H = 220, PAD = 48, PERIODS = 3;

function wave(duty) {
  const x = t => PAD + t / PERIODS * (W - PAD - 10), yHi = 30, yLo = H - PAD;
  const pts = [];
  for (let k = 0; k < PERIODS; k++) {
    pts.push([x(k), duty > 0 ? yHi : yLo], [x(k + duty), duty > 0 ? yHi : yLo], [x(k + duty), yLo], [x(k + 1), yLo]);
    if (k + 1 < PERIODS && duty > 0) pts.push([x(k + 1), yHi]);
  }
  const yAvg = yLo - duty * (yLo - yHi);
  return s("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", class: "chart",
      "aria-label": `A square wave high ${Math.round(duty * 100)} % of each period; its average is drawn as a dashed line` },
    s("line", { x1: PAD, y1: yLo, x2: W - 8, y2: yLo, class: "axis" }),
    s("line", { x1: PAD, y1: 16, x2: PAD, y2: yLo, class: "axis" }),
    s("polyline", { points: pts.map(p => p.join(",")).join(" "), class: "series", fill: "none" }),
    s("line", { x1: PAD, y1: yAvg, x2: W - 8, y2: yAvg, class: "average" }),
    s("text", { x: PAD - 6, y: yHi + 4, class: "tick", "text-anchor": "end" }, "5"),
    s("text", { x: PAD - 6, y: yLo, class: "tick", "text-anchor": "end" }, "0"),
    s("text", { x: (W + PAD) / 2, y: H - 12, class: "axis-label", "text-anchor": "middle" }, "Time [periods of about 2 ms]"),
    s("text", { x: 14, y: (H - PAD) / 2, class: "axis-label", "text-anchor": "middle", transform: `rotate(-90 14 ${(H - PAD) / 2})` },
      "Pin voltage [V]"));
}

// The card's picture: a square wave high 60 % of each 50-unit period.
const square = () => [0, 1, 2, 3].flatMap(k => [[15 + k * 50, 110], [15 + k * 50, 40], [45 + k * 50, 40], [45 + k * 50, 110]]).concat([[185, 110]]);

export default {
  id: "pwm",
  art: () => a.picture("A square wave switching between 0 and 5 V, with its average drawn dashed",
    a.line(square(), a.INK) + a.line([[15, 68], [185, 68]], a.ACC, 3, "8 6") + a.text(188, 62, "avg", 13, a.ACC, "end")),
  mount(root) {
    let value = 127;
    const chart = h("div", { class: "drawing" });
    const lamp = h("div", { class: "lamp", role: "img" });
    const duty = readout("Duty = value / 255"), avg = readout("Average = duty × 5 V");
    const update = () => {
      const p = pwm(value);
      duty.set(`${(p.duty * 100).toFixed(1)} %`);
      avg.set(si(p.average, "V"), "", "the dashed line");
      chart.replaceChildren(wave(p.duty));
      lamp.style.setProperty("--level", p.duty.toFixed(3));
      lamp.setAttribute("aria-label", `An LED at ${Math.round(p.duty * 100)} % brightness`);
    };
    root.append(h("div", { class: "stage" }, h("div", {}, chart, h("div", { class: "lamp-row" }, lamp, h("span", {}, "LED on the pin"))),
      h("div", { class: "controls" },
        slider({ label: "analogWrite(pin, value)", unit: "", min: 0, max: 255, value, step: 1, format: String, onInput: v => { value = v; update(); } }),
        duty.el, avg.el,
        h("p", { class: "hint" }, "PWM pins on the UNO: 3, 5, 6, 9, 10 and 11. The pin is never at 2.5 V; it is 5 V half the time."))));
    update();
  },
};
