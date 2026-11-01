// Opamp circuits, after Carter & Brown (2016), TI's Handbook of Operational Amplifier Applications: an opamp is used
// with feedback, and the resistors set the gain; without feedback any input difference drives the output to its
// supply (p. 14). Lecture 10's gain-4 table (p. 13) is what a difference amplifier with RO = 4 × RI gives.
import { opampCircuit, si } from "../core/index.js";
import { h, s, slider, readout, choice } from "../ui/kit.js";
import { svg, wire, resistor } from "../ui/schematic.js";
import * as a from "../ui/art.js";

const KINDS = {
  open: ["Without feedback (open loop)", "Any difference between the inputs drives the output to the supply (p. 14)."],
  noninverting: ["Non-inverting amplifier", "EO = EI × (1 + RO / RI)  (p. 17)"],
  inverting: ["Inverting amplifier", "EO = −(RO / RI) × EI  (p. 18)"],
  difference: ["Difference amplifier", "EO = (RO / RI) × (E2 − E1)  (p. 74)"],
};

const ground = (x, y) => s("g", { class: "part" }, wire([[x, y - 12], [x, y]]), s("line", { x1: x - 12, y1: y, x2: x + 12, y2: y, class: "plate" }),
  s("line", { x1: x - 7, y1: y + 5, x2: x + 7, y2: y + 5, class: "plate" }));

/** The circuit as drawn in the handbook: − input at y 100, + input at y 160, output at the right. */
function drawing(kind, e1, e2, RI, RO, out) {
  const parts = [s("polygon", { points: "210,70 210,190 330,130", class: "body", style: "fill:var(--part);stroke:var(--wire);stroke-width:2.5" }),
    s("text", { x: 220, y: 106, class: "label" }, "−"), s("text", { x: 220, y: 166, class: "label" }, "+"),
    wire([[330, 130], [440, 130]]), s("text", { x: 444, y: 135, class: "reading" }, `EO ${si(out, "V")}`)];
  const feedback = () => parts.push(wire([[170, 100], [170, 40], [200, 40]]), resistor(200, 40, 340, 40, `RO ${si(RO, "Ω")}`),
    wire([[340, 40], [380, 40], [380, 130]]), wire([[170, 100], [210, 100]]));
  const input = (y, label) => parts.push(s("text", { x: 8, y: y - 8, class: "reading" }, label));
  if (kind === "open") {
    parts.push(wire([[20, 100], [210, 100]]), wire([[20, 160], [210, 160]]));
    input(100, `E1 ${si(e1, "V")}`); input(160, `E2 ${si(e2, "V")}`);
  } else if (kind === "noninverting") {
    feedback();
    parts.push(resistor(60, 100, 170, 100, `RI ${si(RI, "Ω")}`), ground(60, 112), wire([[20, 160], [210, 160]]));
    input(160, `EI ${si(e2, "V")}`);
  } else if (kind === "inverting") {
    feedback();
    parts.push(resistor(20, 100, 170, 100, `RI ${si(RI, "Ω")}`), wire([[210, 160], [180, 160], [180, 200]]), ground(180, 212));
    input(100, `EI ${si(e1, "V")}`);
  } else {
    feedback();
    parts.push(resistor(20, 100, 170, 100, `RI ${si(RI, "Ω")}`), resistor(20, 160, 160, 160, `RI ${si(RI, "Ω")}`), wire([[160, 160], [210, 160]]),
      resistor(185, 160, 185, 225, ""), s("text", { x: 196, y: 205, class: "label" }, `RO ${si(RO, "Ω")}`), ground(185, 236));
    input(100, `E1 ${si(e1, "V")}`); input(160, `E2 ${si(e2, "V")}`);
  }
  return svg(520, 250, `${KINDS[kind][0]}; output ${si(out, "V")}`, ...parts);
}

export default {
  id: "opamp",
  art: () => a.picture("An opamp with a feedback resistor from its output back to its minus input",
    a.line([[70, 45], [70, 115], [130, 80], [70, 45]]) + a.text(80, 68, "−", 16, a.INK) + a.text(80, 104, "+", 16, a.INK) +
      a.line([[20, 62], [70, 62]], a.INK, 2) + a.line([[20, 98], [70, 98]], a.INK, 2) + a.line([[130, 80], [185, 80]], a.INK, 2) +
      a.line([[55, 62], [55, 22], [82, 22]], a.ACC, 2) + a.rect(82, 15, 36, 14, a.ACC, 2) + a.line([[118, 22], [150, 22], [150, 80]], a.ACC, 2) +
      a.text(100, 140, "feedback sets the gain", 13, a.DIM)),
  mount(root) {
    let kind = "difference", e1 = 0, e2 = 1, RI = 1e3, RO = 4e3, rail = 12;
    const pic = h("div", { class: "drawing" });
    const out = readout("Output EO"), gain = readout("Formula");
    const knobs = h("div", { class: "controls" });
    const sliders = {
      e1: slider({ label: kind === "inverting" ? "Input EI" : "Input E1 (on the − side)", unit: "V", min: -10, max: 10, value: e1, step: 0.1, onInput: v => { e1 = v; update(); } }),
      e2: slider({ label: "Input E2 (on the + side)", unit: "V", min: -10, max: 10, value: e2, step: 0.1, onInput: v => { e2 = v; update(); } }),
      RI: slider({ label: "RI", unit: "Ω", min: 100, max: 100e3, value: RI, log: true, onInput: v => { RI = v; update(); } }),
      RO: slider({ label: "RO", unit: "Ω", min: 100, max: 1e6, value: RO, log: true, onInput: v => { RO = v; update(); } }),
    };
    const showKnobs = () => knobs.replaceChildren(...{
      open: ["e1", "e2"], noninverting: ["e2", "RI", "RO"], inverting: ["e1", "RI", "RO"], difference: ["e1", "e2", "RI", "RO"],
    }[kind].map(k => sliders[k].el));
    const update = () => {
      const c = opampCircuit(kind, { e1, e2, RI, RO, rail });
      pic.replaceChildren(drawing(kind, e1, e2, RI, RO, c.out));
      out.set(si(c.out, "V"), c.saturated ? "warn" : "",
        c.saturated ? (kind === "open" ? "Saturated: open loop, the output sits at the supply. The handbook calls this not practical (p. 14)."
          : `The resistors ask for ${si(c.ideal, "V")}, but the output cannot go beyond the ±${rail} V supply: it saturates.`) : "");
      gain.set(kind === "open" ? "none" : `gain ${kind === "noninverting" ? (1 + RO / RI).toFixed(2) : kind === "inverting" ? (-RO / RI).toFixed(2) : (RO / RI).toFixed(2)}`, "", KINDS[kind][1]);
    };
    root.append(h("div", { class: "stage" }, pic, h("div", { class: "controls" },
      choice("Circuit", Object.entries(KINDS).map(([k, [t]]) => [k, t]), kind, v => { kind = v; showKnobs(); update(); }),
      knobs,
      choice("Supply", [["5", "±5 V"], ["12", "±12 V"], ["15", "±15 V"]], "12", v => { rail = Number(v); update(); }),
      out.el, gain.el,
      h("p", { class: "hint" }, "An opamp is used with feedback: the resistors set the gain, not the chip: Carter & Brown (2016, p. 7). Lecture 10's table, Vout = 4 × (V+ − V−), is the difference amplifier with RO = 4 × RI; past the supply its 28 V cannot be reached."))));
    showKnobs();
    update();
  },
};
