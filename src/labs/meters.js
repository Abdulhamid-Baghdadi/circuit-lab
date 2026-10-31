// Where the meters go (lecture 3, slides 6–13): an ammeter has a low resistance and goes in series, a voltmeter a high
// one and goes in parallel. Put either in the wrong place and the circuit tells you: a short, or nothing flowing.
import { meters, si } from "../core/index.js";
import { h, slider, readout, choice } from "../ui/kit.js";
import { svg, wire, resistor, source, meter } from "../ui/schematic.js";
import * as a from "../ui/art.js";

function drawing(amm, volt, A, V) {
  const parts = [source(60, 50, 220, "U"), resistor(300, 90, 300, 170, "R")];
  // Top wire, with the ammeter in it when it is in series.
  if (amm === "series") parts.push(wire([[60, 50], [186, 50]]), wire([[214, 50], [300, 50], [300, 90]]));
  else parts.push(wire([[60, 50], [300, 50], [300, 90]]));
  // Bottom wire, with the voltmeter in it when it is in series.
  if (volt === "series") parts.push(wire([[300, 170], [300, 220], [214, 220]]), wire([[186, 220], [60, 220]]));
  else parts.push(wire([[300, 170], [300, 220], [60, 220]]));
  // Meters across R hang on their own branch beside it.
  if (amm === "parallel") parts.push(wire([[300, 90], [370, 90], [370, 116]]), wire([[370, 144], [370, 170], [300, 170]]));
  if (volt === "parallel") parts.push(wire([[300, 80], [480, 80], [480, 116]]), wire([[480, 144], [480, 180], [300, 180]]));
  return svg(580, 270, `A source and a resistor R; the ammeter ${amm === "series" ? "in series" : "across R"}, the voltmeter ${volt === "parallel" ? "across R" : "in series"}`,
    ...parts, A.el, V.el);
}

export default {
  id: "meters",
  art: () => a.picture("A circuit with an ammeter in the loop and a voltmeter across the resistor",
    a.line([[30, 68], [30, 35], [72, 35]]) + a.circle(86, 35, 13, a.ACC) + a.text(86, 41, "A", 16, a.ACC) +
      a.line([[99, 35], [130, 35], [130, 59]]) + a.resistor(130, 75, true) + a.line([[130, 91], [130, 115], [30, 115], [30, 82]]) +
      a.cell(30, 75) + a.line([[130, 50], [172, 50], [172, 62]], a.COOL, 2) + a.line([[172, 88], [172, 100], [130, 100]], a.COOL, 2) +
      a.circle(172, 75, 13, a.COOL) + a.text(172, 81, "V", 16, a.COOL)),
  mount(root) {
    let amm = "series", volt = "parallel", U = 10, R = 100;
    const pic = h("div", { class: "drawing" });
    const ra = readout("The ammeter reads"), rv = readout("The voltmeter reads"), verdict = readout("What really happens");
    const update = () => {
      const m = meters(U, R, amm, volt);
      // Each meter where the student put it: on the top or bottom wire in series, or on its own branch across R.
      const A = amm === "series" ? meter(200, 50, "A", si(m.ammeterReads, "A")) : meter(370, 130, "A", si(m.ammeterReads, "A"), "right");
      const V = volt === "parallel" ? meter(480, 130, "V", si(m.voltmeterReads, "V"), "right") : meter(200, 220, "V", si(m.voltmeterReads, "V"));
      pic.replaceChildren(drawing(amm, volt, A, V));
      ra.set(si(m.ammeterReads, "A"), amm === "parallel" ? "danger" : "", amm === "parallel" ? "Across R the ammeter is a short circuit: a blown fuse in the meter." : `R carries ${si(m.IR, "A")}: right.`);
      rv.set(si(m.voltmeterReads, "V"), volt === "series" ? "warn" : "", volt === "series" ? "In series the voltmeter blocks the current: it reads the source, nothing flows." : "The voltage across R: right.");
      const ok = amm === "series" && volt === "parallel";
      verdict.set(ok ? "Measured right" : "Measured wrong", ok ? "" : "danger",
        ok ? `U = ${si(m.voltmeterReads, "V")}, I = ${si(m.ammeterReads, "A")}, so R = U / I = ${si(m.voltmeterReads / m.ammeterReads, "Ω")}.` : "Ammeter in series, voltmeter in parallel.");
    };
    root.append(h("div", { class: "stage" }, pic, h("div", { class: "controls" },
      choice("Ammeter (low resistance)", [["series", "In series with R"], ["parallel", "Across R"]], amm, v => { amm = v; update(); }),
      choice("Voltmeter (high resistance)", [["parallel", "Across R"], ["series", "In series with R"]], volt, v => { volt = v; update(); }),
      slider({ label: "Source U", unit: "V", min: 1, max: 24, value: U, step: 0.5, onInput: v => { U = v; update(); } }),
      slider({ label: "Resistor R", unit: "Ω", min: 10, max: 10e3, value: R, log: true, onInput: v => { R = v; update(); } }),
      ra.el, rv.el, verdict.el,
      h("p", { class: "hint" }, "Ammeter: break the circuit and put it in the gap. Voltmeter: touch the two ends of the part."))));
    update();
  },
};
