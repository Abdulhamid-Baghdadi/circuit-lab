// The differential amplifier of lecture 10, p. 13: Vout = Av × (V+ − V−). The slide's table is ideal; a real opamp
// stops at its supply, which the student can switch on.
import { opamp, si } from "../core/index.js";
import { h, s, slider, readout, choice } from "../ui/kit.js";
import { svg, wire } from "../ui/schematic.js";
import * as a from "../ui/art.js";

export default {
  id: "opamp",
  art: () => a.picture("An opamp triangle with a small wave in and a large wave out",
    a.line([[60, 30], [60, 120], [135, 75], [60, 30]]) + a.text(72, 60, "−", 18, a.INK) + a.text(72, 100, "+", 18, a.INK) +
      a.line([[20, 55], [60, 55]], a.INK, 2) + a.line([[20, 95], [60, 95]], a.INK, 2) + a.line([[135, 75], [150, 75]], a.INK, 2) +
      a.line(Array.from({ length: 21 }, (_, k) => [152 + k * 1.6, 75 - 30 * Math.sin(k / 20 * 2 * Math.PI)]), a.ACC) +
      a.line(Array.from({ length: 21 }, (_, k) => [18 + k * 1.2, 112 - 8 * Math.sin(k / 20 * 2 * Math.PI)]), a.COOL, 2)),
  mount(root) {
    let vp = 2.5, vm = 0, gain = 4, rail = Infinity;
    const pic = h("div", { class: "drawing" });
    const out = readout("Vout = Av × (V+ − V−)");
    const update = () => {
      const ideal = opamp(vp, vm, gain), v = opamp(vp, vm, gain, rail);
      pic.replaceChildren(svg(460, 220, `An opamp with ${si(vm, "V")} on the minus input and ${si(vp, "V")} on the plus input; output ${si(v, "V")}`,
        s("polygon", { points: "160,40 160,180 300,110", class: "body", style: "fill:var(--part);stroke:var(--wire);stroke-width:2.5" }),
        s("text", { x: 172, y: 80, class: "label" }, "−"), s("text", { x: 172, y: 150, class: "label" }, "+"),
        wire([[60, 75], [160, 75]]), wire([[60, 145], [160, 145]]), wire([[300, 110], [380, 110]]),
        s("text", { x: 54, y: 80, class: "reading", "text-anchor": "end" }, si(vm, "V")),
        s("text", { x: 54, y: 150, class: "reading", "text-anchor": "end" }, si(vp, "V")),
        s("text", { x: 386, y: 115, class: "reading" }, si(v, "V")),
        s("text", { x: 230, y: 30, class: "label", "text-anchor": "middle" }, rail === Infinity ? "ideal" : `+${rail} V`),
        s("text", { x: 230, y: 205, class: "label", "text-anchor": "middle" }, rail === Infinity ? "" : `−${rail} V`)));
      out.set(si(v, "V"), v !== ideal ? "warn" : "",
        v !== ideal ? `Ideally ${si(ideal, "V")}, but the output cannot go beyond its supply; real opamps stop at or a little before it.` : `${gain} × (${vp} − ${vm}) = ${si(ideal, "V")}`);
    };
    root.append(h("div", { class: "stage" }, pic, h("div", { class: "controls" },
      slider({ label: "Plus input V+", unit: "V", min: -10, max: 10, value: vp, step: 0.5, onInput: x => { vp = x; update(); } }),
      slider({ label: "Minus input V−", unit: "V", min: -10, max: 10, value: vm, step: 0.5, onInput: x => { vm = x; update(); } }),
      slider({ label: "Gain Av", unit: "", min: 1, max: 20, value: gain, step: 1, format: x => `${x}×`, onInput: x => { gain = x; update(); } }),
      choice("Supply (the output stops at most here)", [["ideal", "Ideal, as on the slide"], ["12", "±12 V"], ["5", "±5 V"]], "ideal",
        x => { rail = x === "ideal" ? Infinity : Number(x); update(); }),
      out.el,
      h("p", { class: "hint" }, "Equal inputs give 0 V whatever their size: the opamp amplifies only the difference."))));
    update();
  },
};
