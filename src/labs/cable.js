// A long cable as two resistors in series with the load (lesson 2, slide 23), sized with Pouillet's law. The bar shows
// where the supply's voltage goes: the outgoing wire, the load, the return wire.
import { cable, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";

// Resistivity at about 20 °C, from the table in lesson 2, slide 22 (in 10⁻⁶ Ω·m).
const MATERIALS = { copper: [0.0175e-6, "Copper"], aluminium: [0.0265e-6, "Aluminium"] };
// Cross-sections one buys, in mm².
const SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70];

export default {
  id: "cable",
  mount(root) {
    let U = 230, l = 700, size = 6, I = 25, material = "copper";
    const bar = h("div", { class: "split", role: "img" });
    const r = readout("R of one wire = ρ × l / A"), drop = readout("Lost in the cable, both wires"),
          load = readout("Left for the load"), heat = readout("Heat in the cable P = I² × R");
    const update = () => {
      const c = cable(U, MATERIALS[material][0], l, size * 1e-6, I);
      const lost = Math.min(1, c.drop / U);
      r.set(si(c.Rwire, "Ω"));
      drop.set(si(c.drop, "V"), "", `${(lost * 100).toFixed(1)} % of the supply`);
      load.set(c.Uload > 0 ? si(c.Uload, "V") : "nothing", c.Uload < 0.95 * U ? "danger" : "",
        c.Uload < 0.95 * U ? "More than 5 % lost: choose a thicker cable." : "");
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
        r.el, drop.el, load.el, heat.el,
        h("p", { class: "hint" }, "The fuse table sizes a cable so it does not burn; a long cable must be thicker still so the voltage arrives."))));
    update();
  },
};
