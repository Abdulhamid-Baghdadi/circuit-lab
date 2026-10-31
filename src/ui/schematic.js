// Circuit symbols drawn in SVG (IEC style: a resistor is a rectangle), in the page's colours, so every lab draws
// its circuit the same way. Coordinates are in the SVG's own units.
import { s } from "./kit.js";

export function wire(points, cls = "wire") {
  return s("polyline", { points: points.map(p => p.join(",")).join(" "), class: cls, fill: "none" });
}

/** A resistor between (x1,y1) and (x2,y2), horizontal or vertical, with a label beside it. */
export function resistor(x1, y1, x2, y2, label, cls = "") {
  const vertical = x1 === x2, len = vertical ? y2 - y1 : x2 - x1, body = 40, mid = len / 2;
  const g = s("g", { class: `part ${cls}` });
  if (vertical) {
    g.append(wire([[x1, y1], [x1, y1 + mid - body / 2]]), wire([[x1, y1 + mid + body / 2], [x1, y2]]),
      s("rect", { x: x1 - 9, y: y1 + mid - body / 2, width: 18, height: body, class: "body" }),
      s("text", { x: x1 + 16, y: y1 + mid + 5, class: "label" }, label));
  } else {
    g.append(wire([[x1, y1], [x1 + mid - body / 2, y1]]), wire([[x1 + mid + body / 2, y1], [x2, y1]]),
      s("rect", { x: x1 + mid - body / 2, y: y1 - 9, width: body, height: 18, class: "body" }),
      s("text", { x: x1 + mid, y: y1 - 16, class: "label", "text-anchor": "middle" }, label));
  }
  return g;
}

/** A DC source, vertical, + at the top: the long plate is +. */
export function source(x, y1, y2, label) {
  const mid = (y1 + y2) / 2;
  return s("g", { class: "part" },
    wire([[x, y1], [x, mid - 6]]), wire([[x, mid + 6], [x, y2]]),
    s("line", { x1: x - 16, y1: mid - 6, x2: x + 16, y2: mid - 6, class: "plate" }),
    s("line", { x1: x - 8, y1: mid + 6, x2: x + 8, y2: mid + 6, class: "plate thick" }),
    s("text", { x: x - 22, y: mid - 10, class: "label", "text-anchor": "end" }, "+"),
    s("text", { x: x - 22, y: mid + 18, class: "label", "text-anchor": "end" }, label));
}

/** A meter: a circle with V or A in it, and its reading. */
export function meter(x, y, letter, reading, side = "below") {
  // A meter on a vertical wire reads beside it, one on a horizontal wire under it, so the wire never crosses the text.
  const text = side === "right" ? s("text", { x: x + 20, y: y + 5, class: "reading" }, reading)
    : s("text", { x, y: y + 34, class: "reading", "text-anchor": "middle" }, reading);
  const g = s("g", { class: "part meter" },
    s("circle", { cx: x, cy: y, r: 14, class: "body" }),
    s("text", { x, y: y + 5, class: "letter", "text-anchor": "middle" }, letter), text);
  return { el: g, set: t => { text.textContent = t; } };
}

/** An LED, pointing down (anode at y1). */
export function led(x, y1, y2, label, glow = 0) {
  const mid = (y1 + y2) / 2;
  return s("g", { class: "part" },
    wire([[x, y1], [x, mid - 10]]), wire([[x, mid + 10], [x, y2]]),
    s("circle", { cx: x, cy: mid, r: 22, class: "glow", style: `opacity:${glow}` }),
    s("polygon", { points: `${x - 12},${mid - 10} ${x + 12},${mid - 10} ${x},${mid + 10}`, class: "body" }),
    s("line", { x1: x - 12, y1: mid + 10, x2: x + 12, y2: mid + 10, class: "plate" }),
    s("text", { x: x + 20, y: mid + 5, class: "label" }, label));
}

export function svg(width, height, label, ...children) {
  return s("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": label, class: "schematic" }, ...children.filter(Boolean));
}
