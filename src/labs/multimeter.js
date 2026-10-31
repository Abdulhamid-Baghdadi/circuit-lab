// The multimeter in practice (lecture 3, slides 11–13): three or four sockets (COM, A, mA, V) and a range. Choose
// what to measure, where the red lead goes and the range; the display answers as a real meter would.
import { multimeter } from "../core/index.js";
import { h, readout, choice } from "../ui/kit.js";
import * as a from "../ui/art.js";

// Things to measure on the kit: what, and their true value (examples, labelled as such).
const TARGETS = {
  battery: ["U", 9, "The voltage of a 9 V battery"],
  usb: ["U", 5, "The 5 V on the Arduino's 5V pin"],
  led: ["I", 0.015, "The current through an LED (15 mA)"],
  motor: ["I", 1.5, "The current of a small motor (1.5 A)"],
};
const RANGES = { U: [0.2, 2, 20, 200], I: [0.002, 0.02, 0.2, 10] };

export default {
  id: "multimeter",
  art: () => a.picture("A multimeter with a display, a dial and three sockets",
    a.rect(55, 15, 90, 120) + a.rect(65, 25, 70, 28, a.ACC, 2) + a.text(100, 46, "9.00", 20, a.ACC) + a.circle(100, 80, 15) +
      a.line([[100, 80], [110, 70]], a.INK, 2) + ["COM", "V", "A"].map((t, k) => a.circle(72 + k * 28, 120, 6, k === 0 ? a.INK : k === 1 ? a.HOT : a.DIM, 2) +
      a.text(72 + k * 28, 110, t, 9, a.DIM)).join("")),
  mount(root) {
    let target = "battery", socket = "V", rangeIdx = 2;
    const lcd = h("div", { class: "lcd", role: "status" });
    const note = readout("What happened");
    const rangeBox = h("div");
    const showRanges = () => {
      const want = TARGETS[target][0];
      rangeBox.replaceChildren(choice("Range (full scale)", RANGES[want].map((r, k) => [String(k), want === "U" ? `${r} V` : r < 1 ? `${r * 1000} mA` : `${r} A`]),
        String(rangeIdx), v => { rangeIdx = Number(v); update(); }));
    };
    const update = () => {
      const [want, value] = TARGETS[target];
      const r = multimeter(want, socket, RANGES[want][rangeIdx], value);
      lcd.textContent = r.display === "fuse" ? "– – –" : r.display;
      lcd.dataset.state = r.display;
      const ok = r.note === "";
      note.set(ok ? "A good measurement" : r.display === "fuse" ? "Fuse blown" : r.display === "OL" ? "Over the range" : "Reads nothing",
        ok ? "" : r.display === "fuse" ? "danger" : "warn",
        ok ? `${want === "U" ? "Volts" : "Amps"} in the display; black lead in COM, red in ${socket}.` : r.note);
    };
    root.append(h("div", { class: "stage" }, h("div", {}, lcd, h("p", { class: "hint" }, "Black lead: always COM.")), h("div", { class: "controls" },
      choice("Measure", Object.entries(TARGETS).map(([k, [, , t]]) => [k, t]), target, v => { target = v; rangeIdx = 2; showRanges(); update(); }),
      choice("Red lead in", [["V", "V (and Ω)"], ["mA", "mA"], ["A", "A (10 A)"]], socket, v => { socket = v; update(); }),
      rangeBox, note.el,
      h("p", { class: "hint" }, "Not sure of the size? Start at the highest range and go down. Voltage: across the part. Current: break the circuit and put the meter in it."))));
    showRanges();
    update();
  },
};
