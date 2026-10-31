// The multimeter in practice (lecture 3, slides 11–13): COM, A, mA and V sockets. Choose what to measure, where the
// meter goes and which socket the red lead takes; the outcome follows from the course's rule that the voltmeter has a
// high resistance and the ammeter a low one. No ranges or fuse ratings: those belong to one meter's manual.
import { h, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

/** What happens: wanted "U" or "I"; meter placed "parallel" (across the part) or "series" (in the circuit); red lead
 *  in the "V" socket (high resistance) or a current socket "A"/"mA" (low resistance). */
function outcome(want, place, socket) {
  const high = socket === "V";
  if (place === "parallel" && !high) return ["Short circuit", "danger", "A current socket has a low resistance: across a part it short-circuits it."];
  if (place === "series" && high) return ["Almost no current", "warn", "The V socket has a high resistance: in the circuit it blocks the current."];
  if (want === "U" && place === "parallel" && high) return ["The voltage across the part", "", "Right: in parallel, red lead in V."];
  if (want === "I" && place === "series" && !high) return ["The current through the part", "", `Right: in series, red lead in ${socket}.`];
  return ["Not what you wanted", "warn", want === "U" ? "Voltage: across the part, red lead in V." : "Current: in series, red lead in mA or A."];
}

export default {
  id: "multimeter",
  art: () => a.picture("A multimeter with a display, a dial and three sockets",
    a.rect(55, 15, 90, 120) + a.rect(65, 25, 70, 28, a.ACC, 2) + a.text(100, 46, "U · I", 18, a.ACC) + a.circle(100, 80, 15) +
      a.line([[100, 80], [110, 70]], a.INK, 2) + ["COM", "V", "A"].map((t, k) => a.circle(72 + k * 28, 120, 6, k === 0 ? a.INK : k === 1 ? a.HOT : a.DIM, 2) +
      a.text(72 + k * 28, 110, t, 9, a.DIM)).join("")),
  mount(root) {
    let want = "U", place = "parallel", socket = "V";
    const result = readout("The meter measures");
    const update = () => { const [what, tone, why] = outcome(want, place, socket); result.set(what, tone, why); };
    root.append(h("div", { class: "stage" }, h("div", { class: "controls" },
        choice("I want to measure", [["U", "A voltage"], ["I", "A current"]], want, v => { want = v; update(); }),
        choice("The meter goes", [["parallel", "Across the part (in parallel)"], ["series", "In the circuit (in series)"]], place, v => { place = v; update(); }),
        choice("Red lead in", [["V", "V"], ["mA", "mA"], ["A", "A"]], socket, v => { socket = v; update(); }),
        h("p", { class: "hint" }, "The other lead goes in COM (lecture 3, slide 13: COM, A, mA, V).")),
      h("div", { class: "controls" }, result.el,
        h("p", { class: "hint" }, "Lecture 3, slide 13: voltmeter = high resistance, ammeter = low resistance."))));
    update();
  },
};
