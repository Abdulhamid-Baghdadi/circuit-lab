// The breadboard (lecture 5): which holes are connected inside. Click a hole and every hole joined to it lights up;
// put a part's two legs in and see whether it bridges two strips or is shorted inside one.
import { breadboardNet, shorted } from "../core/index.js";
import { h, s, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

const COLS = 30, ROWS = "abcdefghij";
const X = c => 30 + (c - 1) * 18, Y = r => 62 + ROWS.indexOf(r) * 18 + (ROWS.indexOf(r) >= 5 ? 20 : 0);
const RAILS = [["+top", 18], ["-top", 34], ["+bottom", 282], ["-bottom", 298]];

export default {
  id: "breadboard",
  art: () => a.picture("A breadboard's holes, one column of five joined, with a resistor across two columns",
    Array.from({ length: 8 }, (_, c) => Array.from({ length: 5 }, (_, r) =>
      `<circle cx="${30 + c * 20}" cy="${40 + r * 16}" r="3.5" fill="${c === 2 ? "#FCD34D" : "rgba(248,250,252,.38)"}"/>`).join("")).join("") +
      a.line([[70, 40], [70, 104]], a.ACC, 2) + a.line([[70, 120], [70, 112], [130, 112], [130, 120]], a.INK, 2) + a.resistor(100, 128, false, a.INK)),
  mount(root) {
    let legs = ["10b", "14b"], picking = 0;
    const board = h("div", { class: "drawing breadboard" });
    const inputs = legs.map((v, k) => h("input", { type: "text", value: v, size: 7, "aria-label": `Leg ${k + 1} hole, such as 12c or +top3`,
      onchange: e => { legs[k] = e.target.value.trim(); update(); } }));
    const verdict = readout("The resistor's two legs");
    const update = () => {
      let nets;
      try { nets = legs.map(breadboardNet); }
      catch (e) { verdict.set("—", "warn", e.message); return; }
      const lit = hole => nets.includes(breadboardNet(hole));
      const hole = (id, x, y) => s("circle", { cx: x, cy: y, r: 5, class: `hole${lit(id) ? " lit" : ""}${legs.includes(id) ? " leg" : ""}`,
        "data-hole": id });
      const parts = [];
      for (const [rail, y] of RAILS) for (let c = 1; c <= COLS; c++) parts.push(hole(`${rail}${c}`, X(c), y));
      for (const r of ROWS) for (let c = 1; c <= COLS; c++) parts.push(hole(`${c}${r}`, X(c), Y(r)));
      const pos = id => { const el = parts.find(p => p.dataset.hole === id); return el ? [Number(el.getAttribute("cx")), Number(el.getAttribute("cy"))] : null; };
      const [p1, p2] = legs.map(pos);
      const svgEl = s("svg", { viewBox: "0 0 570 316", role: "img", class: "schematic",
          "aria-label": `A breadboard; the holes joined to ${legs[0]} and ${legs[1]} are lit` },
        s("rect", { x: 8, y: 6, width: 554, height: 304, rx: 10, class: "board" }),
        s("line", { x1: 12, y1: 162, x2: 558, y2: 162, class: "gap" }),
        ...ROWS.split("").map(r => s("text", { x: 14, y: Y(r) + 4, class: "tick" }, r)),
        ...[1, 5, 10, 15, 20, 25, 30].map(c => s("text", { x: X(c), y: 56, class: "tick", "text-anchor": "middle" }, String(c))),
        ...parts,
        p1 && p2 ? s("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], class: "part-leg" }) : null,
        p1 && p2 ? s("rect", { x: (p1[0] + p2[0]) / 2 - 16, y: (p1[1] + p2[1]) / 2 - 7, width: 32, height: 14, rx: 3, class: "part-body" }) : null);
      svgEl.addEventListener("click", e => {
        const id = e.target.dataset?.hole;
        if (!id) return;
        legs[picking] = id; inputs[picking].value = id; picking = 1 - picking; update();
      });
      board.replaceChildren(svgEl);
      const same = shorted(legs[0], legs[1]);
      verdict.set(same ? "Shorted" : "Bridges two strips", same ? "danger" : "",
        same ? "Both legs are in one strip: the current goes through the board, not through the part." : `${legs[0]} and ${legs[1]} are in different strips, so the part sits between them.`);
    };
    root.append(h("div", { class: "stage" }, board, h("div", { class: "controls" },
      h("p", { class: "hint" }, "Click a hole for the first leg, then one for the second. Or type them:"),
      h("div", { class: "row" }, h("label", {}, "Leg 1 ", inputs[0]), h("label", {}, " Leg 2 ", inputs[1])),
      verdict.el,
      h("p", { class: "hint" }, "Inside, the five holes a–e of each column are one metal strip, f–j another. The long rails at top and bottom carry + and −. The groove in the middle separates the two halves: a chip sits across it."))));
    update();
  },
};
