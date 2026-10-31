// A long cable as two resistors in series with the load (lesson 2, slide 23), sized with Pouillet's law. The bar shows
// where the supply's voltage goes: the outgoing wire, the load, the return wire.
import { cable, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

// Resistivity at about 20 °C, from the table in lesson 2, slide 22 (in 10⁻⁶ Ω·m).
const MATERIALS = { copper: [0.0175e-6, "Copper"], aluminium: [0.0265e-6, "Aluminium"] };
// Syllabus §2.8, table 2-12: the largest breaker and fuse for each cross-section in a Belgian house (6 mm²: 40 or 32 A
// breaker, 32 or 25 A fuse; the lower value is taken here, to be safe).
const FUSES = { 1.5: [16, 10], 2.5: [20, 16], 4: [25, 20], 6: [32, 25], 10: [63, 50], 16: [80, 63], 25: [100, 80], 35: [125, 100] };
// The cross-sections of the syllabus's table 2-12, in mm².
const SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35];

export default {
  id: "cable",
  art: () => a.picture("A plug, a long winding cable giving off heat, and a lamp at its end",
    a.rect(15, 60, 20, 30) + a.line([[35, 68], [42, 68]], a.INK, 2) + a.line([[35, 82], [42, 82]], a.INK, 2) +
      a.path("M42,75 C70,40 90,110 118,75 S142,52 158,82") + a.circle(165, 62, 16) + a.rect(157, 80, 16, 12) +
      ["M62,40 q5,-6 0,-12 q-5,-6 0,-12", "M88,96 q5,-6 0,-12", "M112,42 q5,-6 0,-12 q-5,-6 0,-12"].map(d => a.path(d, a.HOT, 2)).join("")),
  mount(root) {
    let U = 230, l = 700, size = 6, I = 25, material = "copper";
    const bar = h("div", { class: "split", role: "img" });
    const r = readout("R of one wire = ρ × l / A"), drop = readout("Lost in the cable, both wires"),
          load = readout("Left for the load"), heat = readout("Heat in the cable P = I² × R"),
          fuse = readout("Largest breaker / fuse for this cable (Belgium)");
    const update = () => {
      const c = cable(U, MATERIALS[material][0], l, size * 1e-6, I);
      const f = FUSES[size];
      fuse.set(f ? `${f[0]} A / ${f[1]} A` : "not in the table", f && I > f[0] ? "danger" : "",
        !f ? "The syllabus table runs from 1.5 to 35 mm²." : I > f[0] ? `${si(I, "A")} is more than this cable may carry: it would overheat before the breaker trips.` : "This current is allowed in this cable.");
      const lost = Math.min(1, c.drop / U);
      r.set(si(c.Rwire, "Ω"));
      drop.set(si(c.drop, "V"), "", `${(lost * 100).toFixed(1)} % of the supply`);
      load.set(c.Uload > 0 ? si(c.Uload, "V") : "nothing");
      heat.set(si(c.loss, "W"));
      bar.replaceChildren(
        h("span", { class: "part wire", style: `flex:${lost / 2}` }, "wire"),
        h("span", { class: "part load", style: `flex:${1 - lost}` }, "load"),
        h("span", { class: "part wire", style: `flex:${lost / 2}` }, "wire"));
      bar.setAttribute("aria-label", `The supply split: ${(lost * 50).toFixed(1)} % in each wire, ${((1 - lost) * 100).toFixed(1)} % for the load`);
    };
    const sizeSlider = slider({ label: "Cross-section A", unit: "mm²", min: 0, max: SIZES.length - 1, value: SIZES.indexOf(size), step: 1,
      // The slider moves along the sizes one buys, so its readout shows the size, not the position.
      format: k => `${SIZES[k]} mm²`, onInput: k => { size = SIZES[k]; update(); } });
    root.append(h("div", { class: "stage" }, h("div", {}, h("p", { class: "hint" }, "Where the supply's voltage goes:"), bar),
      h("div", { class: "controls" },
        choice("Material", Object.entries(MATERIALS).map(([k, [, t]]) => [k, t]), material, v => { material = v; update(); }),
        slider({ label: "Supply U", unit: "V", min: 12, max: 400, value: U, step: 1, onInput: v => { U = v; update(); } }),
        slider({ label: "Cable length l", unit: "m", min: 1, max: 2000, value: l, log: true, onInput: v => { l = v; update(); } }),
        sizeSlider.el,
        slider({ label: "Current I", unit: "A", min: 0.1, max: 63, value: I, step: 0.1, onInput: v => { I = v; update(); } }),
        r.el, drop.el, load.el, heat.el, fuse.el,
        h("p", { class: "hint" }, "The fuse table sizes a cable so it does not burn; a long cable must be thicker still so the voltage arrives."))));
    update();
  },
};
