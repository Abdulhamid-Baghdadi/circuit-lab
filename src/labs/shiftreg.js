// The 74HC595 shift register (lecture 11, p. 40–46; lesson 14, p. 34–37): three pins drive eight outputs. Set the
// data bit, pulse the clock, and the bits move along; latch, and the outputs show them. Or let shiftOut do all eight.
import { clockIn, shiftOutBits } from "../core/index.js";
import { h, slider } from "../ui/kit.js";
import * as a from "../ui/art.js";

export default {
  id: "shiftreg",
  art: () => a.picture("Bits entering a row of eight boxes one by one, with eight lit outputs below",
    a.arrow(10, 50, 30, 50, a.COOL, 2, 6) + Array.from({ length: 8 }, (_, k) => {
      const on = [1, 0, 1, 1, 0, 0, 0, 1][k];
      return a.rect(32 + k * 19, 38, 16, 24, on ? a.ACC : a.DIM, 2) + a.text(40 + k * 19, 55, String(on), 12, on ? a.ACC : a.DIM) +
        a.line([[40 + k * 19, 62], [40 + k * 19, 92]], a.DIM, 1.5) + a.circle(40 + k * 19, 100, 6, on ? a.ACC : a.DIM, 2, on ? a.ACC : "none");
    }).join("") + a.text(100, 135, "3 pins → 8 outputs", 13, a.DIM)),
  mount(root) {
    let reg = 0, out = 0, data = 1, byte = 0b10110001;
    const view = h("div");
    const log = h("pre", { class: "code" });
    const update = () => {
      const row = (value, label) => h("div", { class: "bits", role: "img", "aria-label": `${label}: ${value.toString(2).padStart(8, "0")}` },
        ...Array.from({ length: 8 }, (_, k) => { const bit = (value >> (7 - k)) & 1;
          return h("span", { class: "bit", "aria-hidden": "true", "data-on": String(bit) }, h("span", { class: "digit" }, String(bit)), h("span", { class: "weight" }, `Q${7 - k}`)); }));
      view.replaceChildren(h("p", { class: "hint" }, "Inside the register (shifts with each clock):"), row(reg, "Register"),
        h("p", { class: "hint" }, "On the outputs (changes only on latch):"), row(out, "Outputs"));
    };
    const say = text => { log.textContent = text; };
    const dataBtn = h("button", { type: "button", class: "press", "aria-pressed": "true", onclick: () => { data = 1 - data; dataBtn.setAttribute("aria-pressed", String(!!data)); dataBtn.textContent = `Data pin: ${data}`; } }, "Data pin: 1");
    root.append(h("div", { class: "stage" }, h("div", {}, view, log), h("div", { class: "controls" },
      h("p", { class: "hint" }, "By hand, one bit at a time:"),
      dataBtn,
      h("button", { type: "button", onclick: () => { reg = clockIn(reg, data); say(`clock: ${data} went in at Q0, every bit moved up one place`); update(); } }, "Pulse the clock"),
      h("button", { type: "button", onclick: () => { out = reg; say("latch: the outputs now show the register"); update(); } }, "Latch"),
      h("p", { class: "hint" }, "Or the whole byte, as the sketch does:"),
      slider({ label: "Byte to send", unit: "", min: 0, max: 255, value: byte, step: 1, format: v => `${v} = ${v.toString(2).padStart(8, "0")}`, onInput: v => { byte = v; } }),
      h("button", { type: "button", onclick: () => {
        const bits = shiftOutBits(byte); reg = bits.reduce(clockIn, reg); out = reg;
        say(`digitalWrite(latchPin, LOW);\nshiftOut(dataPin, clockPin, MSBFIRST, ${byte});  // sends ${bits.join(" ")}\ndigitalWrite(latchPin, HIGH);`); update(); } }, "shiftOut and latch"),
      h("p", { class: "hint" }, "Chain a second 74HC595 by its Q7S pin to the next one's data input: 16 outputs, still 3 pins."))));
    say("Set the data pin, pulse the clock eight times, then latch.");
    update();
  },
};
