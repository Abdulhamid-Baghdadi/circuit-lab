// The ideal transformer of lesson 3, slides 20–23, and why the grid transmits at high voltage: for the same power,
// a higher voltage means less current, and the loss in the line goes with the current squared.
import { transformer, si } from "../core/index.js";
import { h, s, slider, readout } from "../ui/kit.js";
import { svg, resistor } from "../ui/schematic.js";
import * as a from "../ui/art.js";

function coil(x, y, n, label) {
  // At most 12 loops are drawn; the label gives the true number.
  const loops = Math.max(2, Math.min(12, Math.round(n / 10)));
  const d = Array.from({ length: loops }, (_, k) => `a 6 ${70 / loops / 2} 0 0 ${x < 200 ? 1 : 0} 0 ${70 / loops}`).join(" ");
  return s("g", { class: "part" }, s("path", { d: `M ${x} ${y} ${d}`, class: "wire", fill: "none" }),
    s("text", { x: x < 200 ? x - 14 : x + 14, y: y + 40, class: "label", "text-anchor": x < 200 ? "end" : "start" }, label));
}

// A sine wave from x0 to x1 around y, as a path for a card picture.
const wave = (x0, x1, y, amp) => a.line(Array.from({ length: 41 }, (_, k) => [x0 + (x1 - x0) * k / 40, y - amp * Math.sin(k / 40 * 4 * Math.PI)]), a.ACC);

export default {
  id: "transformer",
  art: () => a.picture("A large wave in, two coils on a metal core, a small wave out",
    a.line([[95, 32], [95, 118]], a.DIM, 4) + a.line([[105, 32], [105, 118]], a.DIM, 4) +
      a.path("M82,40" + " a8,7 0 0 0 0,14".repeat(5)) + a.path("M118,52" + " a8,11.5 0 0 1 0,23".repeat(2)) +
      wave(12, 64, 75, 26) + wave(136, 188, 75, 10)),
  mount(root) {
    let U = 230, N1 = 80, N2 = 20, R = 20;
    const pic = h("div", { class: "drawing" });
    const out = readout("Uout = Uin × Nout / Nin"), power = readout("Power, the same on both sides"), iin = readout("Current from the mains");
    const line = readout("Same power through the same line (P = I² × R)");
    const update = () => {
      const t = transformer(U, N1, N2, R);
      out.set(si(t.Uout, "V"));
      power.set(si(t.P, "W"), "", `Iout = ${si(t.Iout, "A")}`);
      iin.set(si(t.Iin, "A"), "", N2 > N1 ? "Stepping up: more current from the mains than through the lamp." : "Stepping down: less current from the mains than through the lamp.");
      // The load's power carried at the input and at the output voltage over the same line: loss = (P/U)² × R.
      // Same power, so the current goes as 1/U and the loss in any line as 1/U² (lecture 3, slide 23).
      const hi = Math.max(U, t.Uout), lo = Math.min(U, t.Uout);
      line.set(`${((hi / lo) ** 2).toFixed(1)}× less loss`, "", `at ${si(hi, "V")} than at ${si(lo, "V")}: (${si(hi, "V")} / ${si(lo, "V")})²`);
      pic.replaceChildren(svg(460, 200, `A transformer: ${N1} windings in, ${N2} out, a ${si(R, "Ω")} lamp on the output`,
        s("polyline", { points: "40,60 120,60", class: "wire", fill: "none" }), s("polyline", { points: "40,130 120,130", class: "wire", fill: "none" }),
        s("text", { x: 36, y: 100, class: "label", "text-anchor": "end" }, "~"),
        s("text", { x: 36, y: 50, class: "label" }, si(U, "V")),
        coil(120, 60, N1, `${N1} turns`), coil(300, 60, N2, `${N2} turns`),
        s("rect", { x: 196, y: 50, width: 8, height: 90, class: "core" }), s("rect", { x: 212, y: 50, width: 8, height: 90, class: "core" }),
        s("polyline", { points: "300,60 400,60 400,70", class: "wire", fill: "none" }), resistor(400, 70, 400, 120, "lamp"),
        s("polyline", { points: "400,120 400,130 300,130", class: "wire", fill: "none" }),
        s("text", { x: 340, y: 50, class: "reading" }, si(t.Uout, "V"))));
    };
    root.append(h("div", { class: "stage" }, pic, h("div", { class: "controls" },
      slider({ label: "Mains Uin", unit: "V", min: 12, max: 400, value: U, step: 1, onInput: v => { U = v; update(); } }),
      slider({ label: "Windings in Nin", unit: "", min: 10, max: 400, value: N1, step: 5, format: String, onInput: v => { N1 = v; update(); } }),
      slider({ label: "Windings out Nout", unit: "", min: 5, max: 400, value: N2, step: 5, format: String, onInput: v => { N2 = v; update(); } }),
      slider({ label: "Lamp R", unit: "Ω", min: 1, max: 1000, value: R, log: true, onInput: v => { R = v; update(); } }),
      out.el, power.el, iin.el, line.el,
      h("p", { class: "hint" }, "A transformer does not work on DC (lecture 3, slide 21)."))));
    update();
  },
};
