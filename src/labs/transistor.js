// A transistor as a switch (lecture 10; the Arduino lesson of 5 Nov, p. 31–33; syllabus §5.3): a small current from the Arduino's pin into the base
// lets a large current flow from collector to emitter, here through an LED strip on its own supply.
import { npnSwitch, si } from "../core/index.js";
import { h, s, slider, readout, choice } from "../ui/kit.js";
import { svg, wire, resistor } from "../ui/schematic.js";
import * as a from "../ui/art.js";

// Most current one I/O pin may give: lecture 5's specifications of the two boards.
const PIN_MAX = { R3: 0.02, R4: 0.008 };

export default {
  id: "transistor",
  art: () => a.picture("An NPN transistor: a small current into the base switches a large one through the load",
    a.circle(110, 80, 26) + a.line([[60, 80], [100, 80]], a.COOL, 2) + a.line([[100, 64], [100, 96]], a.INK, 3) +
      a.line([[100, 70], [122, 52], [122, 20]]) + a.line([[100, 90], [122, 108], [122, 135]]) + a.arrow(108, 97, 120, 106, a.INK, 2, 6) +
      a.arrow(140, 25, 140, 128, a.ACC, 4, 10) + a.text(48, 76, "pin", 13, a.COOL, "end")),
  mount(root) {
    let on = true, Rb = 220, beta = 14, Uload = 12, Rload = 100, board = "R4";
    const pic = h("div", { class: "drawing" });
    const ib = readout("Base current Ib = (5 V − 0.7 V) / Rb"), ic = readout("Collector current through the strip"), state = readout("The strip");
    const update = () => {
      const t = npnSwitch({ Rb, beta, Usupply: Uload, Rload, on });
      const limit = PIN_MAX[board];
      ib.set(si(t.Ib, "A"), t.Ib > limit ? "danger" : "", t.Ib > limit ? `More than the ${board} pin's ${si(limit, "A")}: take a larger base resistor.` : `Within the ${board} pin's ${si(limit, "A")}.`);
      ic.set(si(t.Ic, "A"), "", `${Math.round(t.Ic / Math.max(t.Ib, 1e-12))}× the base current`);
      state.set(!on ? "Off" : t.saturated ? "Fully on" : "Half on", on && !t.saturated ? "warn" : "",
        !on ? "No base current, no collector current." : t.saturated ? "The transistor is a closed switch (saturated)." : "Too little base current: the transistor limits the strip, and gets hot.");
      pic.replaceChildren(svg(460, 260, `Pin 9 through ${si(Rb, "Ω")} to the base of an NPN transistor that switches an LED strip on ${Uload} V`,
        s("text", { x: 20, y: 154, class: "label" }, on ? "pin 9 HIGH" : "pin 9 LOW"), wire([[30, 140], [90, 140]]), resistor(90, 140, 190, 140, si(Rb, "Ω")),
        wire([[190, 140], [262, 140]]), s("circle", { cx: 290, cy: 140, r: 30, class: "body", style: "fill:none;stroke:var(--wire);stroke-width:2.5" }),
        wire([[262, 120], [262, 160]]), wire([[262, 128], [300, 100], [300, 70]]), wire([[262, 152], [300, 180], [300, 230]]),
        s("text", { x: 316, y: 240, class: "label" }, "GND"), resistor(300, 20, 300, 70, `LED strip ${si(Rload, "Ω")}`),
        s("text", { x: 300, y: 14, class: "label", "text-anchor": "middle" }, `+${Uload} V`),
        s("rect", { x: 330, y: 80, width: 100, height: 22, rx: 6, class: "strip", style: `opacity:${on ? Math.min(1, t.Ic / (Uload / Rload)) : 0.08}` })));
    };
    root.append(h("div", { class: "stage" }, pic, h("div", { class: "controls" },
      choice("Pin 9", [["on", "HIGH"], ["off", "LOW"]], "on", v => { on = v === "on"; update(); }),
      slider({ label: "Base resistor Rb", unit: "Ω", min: 100, max: 100e3, value: Rb, log: true, onInput: v => { Rb = v; update(); },
        help: "The lesson uses 220 Ω." }),
      slider({ label: "Strip supply", unit: "V", min: 5, max: 24, value: Uload, step: 1, onInput: v => { Uload = v; update(); } }),
      slider({ label: "Load resistance", unit: "Ω", min: 5, max: 500, value: Rload, log: true, onInput: v => { Rload = v; update(); } }),
      slider({ label: "Gain Hfe", unit: "", min: 14, max: 500, value: beta, log: true, format: v => `${Math.round(v)}×`, onInput: v => { beta = v; update(); },
        help: "How much larger the collector current can be than the base current. The syllabus (§5.3): 14 in its example, usually at most 500. Your transistor's datasheet gives it." }),
      choice("Board", [["R4", "UNO R4 (8 mA per pin)"], ["R3", "UNO R3 (20 mA per pin)"]], board, v => { board = v; update(); }),
      ib.el, ic.el, state.el)));
    update();
  },
};
