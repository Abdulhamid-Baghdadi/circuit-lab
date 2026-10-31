// A finite state machine (lesson 9): the traffic light of the lecture, green 5 s, orange 2 s, red 5 s. States,
// the event that ends each (its time is up), and the transition to the next. Step through it, or let it run.
import { cycleState } from "../core/index.js";
import { h, s, slider, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

const STATES = [{ name: "GROEN", label: "Green", ms: 5000, cls: "go" }, { name: "ORANJE", label: "Orange", ms: 2000, cls: "wait" },
                { name: "ROOD", label: "Red", ms: 5000, cls: "stop" }];

export default {
  id: "fsm",
  art: () => a.picture("Three states in a circle, green to orange to red and back",
    a.circle(100, 30, 16, "#4ade80", 3) + a.circle(160, 110, 16, "#fbbf24", 3) + a.circle(40, 110, 16, "#f87171", 3) +
      a.arrow(116, 40, 150, 92, a.INK, 2, 7) + a.arrow(142, 114, 58, 114, a.INK, 2, 7) + a.arrow(48, 94, 86, 42, a.INK, 2, 7)),
  mount(root) {
    let t = 0;
    const pic = h("div", { class: "drawing" });
    const now = readout("State");
    const code = h("pre", { class: "code" });
    const update = () => {
      const { state, left } = cycleState(STATES, t);
      now.set(state.label, "", `${(left / 1000).toFixed(1)} s left, then ${STATES[(STATES.indexOf(state) + 1) % 3].label.toLowerCase()}`);
      const pos = [[230, 50], [380, 170], [80, 170]];
      pic.replaceChildren(s("svg", { viewBox: "0 0 460 240", role: "img", class: "schematic", "aria-label": `Traffic light state machine, now in ${state.label}` },
        s("defs", {}, s("marker", { id: "fsm-arrow", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" },
          s("path", { d: "M0,0 L10,5 L0,10 z", class: "arrowhead" }))),
        ...STATES.map((st, k) => { const [x, y] = pos[k], [nx, ny] = pos[(k + 1) % 3];
          return s("g", {}, s("line", { x1: x + (nx - x) * 0.25, y1: y + (ny - y) * 0.25, x2: x + (nx - x) * 0.75, y2: y + (ny - y) * 0.75, class: "wire", "marker-end": "url(#fsm-arrow)" }),
            s("text", { x: (x + nx) / 2 + (k === 1 ? 0 : k === 0 ? 30 : -30), y: (y + ny) / 2 + (k === 1 ? 20 : 0), class: "tick", "text-anchor": "middle" }, `after ${st.ms / 1000} s`),
            s("circle", { cx: x, cy: y, r: 38, class: `state ${st.cls}${st === state ? " on" : ""}` }),
            s("text", { x, y: y + 5, class: "label", "text-anchor": "middle" }, st.label)); })));
      code.textContent = `enum Toestand { GROEN, ORANJE, ROOD };\nToestand toestand = ${state.name};\n\nswitch (toestand) {\n  case GROEN:  if (millis() - start >= 5000) { toestand = ORANJE; start = millis(); } break;\n  case ORANJE: if (millis() - start >= 2000) { toestand = ROOD;   start = millis(); } break;\n  case ROOD:   if (millis() - start >= 5000) { toestand = GROEN;  start = millis(); } break;\n}`;
    };
    const time = slider({ label: "Time", unit: "s", min: 0, max: 24, value: 0, step: 0.1, format: v => `${v.toFixed(1)} s`, onInput: v => { t = v * 1000; update(); } });
    root.append(h("div", { class: "stage" }, h("div", {}, pic, code), h("div", { class: "controls" },
      time,
      h("button", { type: "button", onclick: () => { const { left } = cycleState(STATES, t); t += left; time.set(Math.min(24, t / 1000)); update(); } }, "Next event"),
      now.el,
      h("p", { class: "hint" }, "A state machine has states, events and transitions. The sketch keeps one variable for the state and never waits with delay(), so it can still read a button."))));
    update();
  },
};
