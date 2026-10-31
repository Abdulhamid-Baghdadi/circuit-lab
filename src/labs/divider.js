// A voltage divider three ways: two fixed resistors, the kit's potentiometer (a divider you turn), and a load that
// pulls the output down. The output goes to an Arduino pin, so the number analogRead gives is shown too.
import { divider, adcRead, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import { svg, wire, resistor, source, meter } from "../ui/schematic.js";
import * as a from "../ui/art.js";

// The Grove rotary and slide potentiometers are 10 kΩ.
const POT = 10e3;
// A light-dependent resistor, made up for the lab (the course gives no values): about 1 MΩ in the dark, 1 kΩ in
// bright light, falling evenly on a log scale.
const ldr = light => 10 ** (6 - 3 * light);

export default {
  id: "divider",
  art: () => a.picture("Two resistors one above the other; the output is taken from between them",
    a.line([[80, 15], [80, 29]]) + a.resistor(80, 45, true) + a.line([[80, 61], [80, 89]]) + a.resistor(80, 105, true) +
      a.line([[80, 121], [80, 135]]) + a.line([[64, 135], [96, 135]]) + a.arrow(80, 75, 150, 75, a.ACC) +
      a.text(172, 80, "out", 16, a.ACC) + a.text(98, 22, "5 V", 14, a.DIM, "start")),
  mount(root) {
    let mode = "fixed", Uin = 5, R1 = 10e3, R2 = 10e3, turn = 0.5, RL = Infinity, light = 0.5;
    const V = meter(330, 175, "V", "", "right");
    const pic = h("div", { class: "drawing" });
    const bar = h("div", { class: "bar", "aria-hidden": "true" }, h("span", { class: "fill" }));
    const out = readout("Uout = Uin × R2 / (R1 + R2)"), pin = readout("analogRead(A0) on a 5 V Arduino");
    const controls = h("div", { class: "group" });
    const update = () => {
      const [r1, r2] = mode === "pot" ? [POT * (1 - turn), POT * turn] : mode === "ldr" ? [ldr(light), R2] : [R1, R2];
      const { Uout, I } = divider(Uin, r1, r2, RL);
      const loaded = RL !== Infinity;
      pic.replaceChildren(svg(460, 290, "Two resistors in series on a source; the output is taken across the lower one",
        source(50, 40, 250, "Uin"), wire([[50, 40], [220, 40], [220, 60]]),
        resistor(220, 60, 220, 140, mode === "pot" ? `top ${si(r1, "Ω")}` : mode === "ldr" ? `LDR ${si(r1, "Ω")}` : `R1 ${si(r1, "Ω")}`),
        resistor(220, 160, 220, 240, mode === "pot" ? `bottom ${si(r2, "Ω")}` : `R2 ${si(r2, "Ω")}`),
        wire([[220, 140], [220, 160]]), wire([[220, 150], [330, 150], [330, 161]]), wire([[330, 189], [330, 250]]),
        loaded && resistor(400, 150, 400, 250, `load ${si(RL, "Ω")}`),
        loaded && wire([[330, 150], [400, 150]]), loaded && wire([[330, 250], [400, 250]]),
        wire([[220, 240], [220, 250], [50, 250]]), wire([[220, 250], [330, 250]]), V.el));
      V.set(si(Uout, "V"));
      out.set(si(Uout, "V"), loaded && Uout < 0.9 * Uin * r2 / (r1 + r2) ? "warn" : "",
        loaded ? `Without the load: ${si(Uin * r2 / (r1 + r2), "V")}. The load is in parallel with the lower resistor.` : `Current through both: ${si(I, "A")}`);
      pin.set(String(adcRead(Math.min(Uout, 5))), Uout > 5 ? "danger" : "", Uout > 5 ? "Over 5 V: this would damage the pin." : "of 0 to 1023");
      bar.firstChild.style.width = `${Math.min(100, Uout / Uin * 100)}%`;
    };
    const fixed = [slider({ label: "Upper resistor R1", unit: "Ω", min: 100, max: 1e6, value: R1, log: true, onInput: v => { R1 = v; update(); } }),
                   slider({ label: "Lower resistor R2", unit: "Ω", min: 100, max: 1e6, value: R2, log: true, onInput: v => { R2 = v; update(); } })];
    const pot = slider({ label: "Knob turned", unit: "%", min: 0, max: 100, value: 50, step: 1, format: v => `${v} %`,
      onInput: v => { turn = v / 100; update(); }, help: "The Grove potentiometer: 10 kΩ, the wiper splits it in two." });
    const lightSlider = slider({ label: "Light on the sensor", unit: "%", min: 0, max: 100, value: 50, step: 1, format: v => `${v} %`,
      onInput: v => { light = v / 100; update(); }, help: "An example LDR, not from the course: 1 MΩ dark, 1 kΩ bright. More light, less resistance above, higher output." });
    const showControls = () => controls.replaceChildren(...(mode === "pot" ? [pot.el] : mode === "ldr" ? [lightSlider.el, fixed[1].el] : fixed.map(s => s.el)));
    const load = slider({ label: "Load on the output", unit: "Ω", min: 100, max: 1e7, value: 1e7, log: true, format: v => v >= 9.9e6 ? "none" : si(v, "Ω"),
      onInput: v => { RL = v >= 9.9e6 ? Infinity : v; update(); }, help: "All the way right: nothing connected (an Arduino input is almost that)." });
    root.append(h("div", { class: "stage" }, h("div", {}, pic, bar),
      h("div", { class: "controls" },
        choice("Divider", [["fixed", "Two resistors"], ["pot", "Potentiometer"], ["ldr", "Light sensor (LDR)"]], mode, v => { mode = v; showControls(); update(); }),
        slider({ label: "Supply Uin", unit: "V", min: 1, max: 12, value: Uin, step: 0.5, onInput: v => { Uin = v; update(); } }),
        controls, load.el, out.el, pin.el)));
    showControls();
    update();
  },
};
