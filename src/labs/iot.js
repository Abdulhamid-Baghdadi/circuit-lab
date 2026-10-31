// How long a battery-powered sensor lasts (lecture 12, p. 20): each state draws a current for a while, so many times
// a day; sum the mAh over a year and divide the battery by it. Starts from the lecture's own measurements.
import { batteryBudget } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

export default {
  id: "iot",
  art: () => a.picture("A sensor sending a signal now and then, with the current spiking when it sends",
    a.rect(25, 30, 44, 34) + a.path("M78,38 a12,12 0 0 1 0,18", a.ACC, 2) + a.path("M86,32 a20,20 0 0 1 0,30", a.ACC, 2) +
      a.line([[15, 125], [50, 125], [50, 85], [56, 85], [56, 125], [110, 125], [110, 85], [116, 85], [116, 125], [170, 125], [170, 85], [176, 85], [176, 125], [188, 125]], a.ACC, 2) +
      a.text(150, 55, "mAh", 16, a.DIM)),
  mount(root) {
    // Lecture 12, p. 20: measurements 18 mA for 5 s, 72 times a day; idle 0.065 mA all the time; sending 100 mA for
    // 0.1 s once a minute; a 5200 mAh battery.
    const states = [{ name: "Measuring", mA: 18, seconds: 5, perDay: 72 }, { name: "Idle", mA: 0.065, seconds: 60, perDay: 1440 },
                    { name: "Sending", mA: 100, seconds: 0.1, perDay: 1440 }];
    let capacity = 5200;
    const table = h("table", { class: "method" });
    const total = readout("Used in a year"), life = readout("The battery lasts");
    const update = () => {
      const b = batteryBudget(states, capacity);
      const biggest = Math.max(...b.rows.map(r => r.mAh));
      table.replaceChildren(h("thead", {}, h("tr", {}, ["State", "mA", "s each time", "times a day", "mAh a year", ""].map(t => h("th", { scope: "col" }, t)))),
        h("tbody", {}, b.rows.map(r => h("tr", { class: r.mAh === biggest ? "now" : "" }, h("td", { class: "text" }, r.name),
          h("td", {}, String(r.mA)), h("td", {}, String(r.seconds)), h("td", {}, String(r.perDay)), h("td", {}, r.mAh.toFixed(1)),
          h("td", {}, r.mAh === biggest ? "← most" : "")))));
      total.set(`${b.perYear.toFixed(1)} mAh`);
      life.set(b.years >= 1 ? `${b.years.toFixed(2)} years` : `${(b.years * 365).toFixed(0)} days`);
    };
    const knob = (k, key, label, unit, min, max, step, fmt) => slider({ label: `${states[k].name}: ${label}`, unit, min, max, value: states[k][key], step,
      log: step === undefined, format: fmt, onInput: v => { states[k][key] = v; update(); } });
    root.append(h("div", { class: "stage" }, h("div", {}, table, h("p", { class: "source" }, "Starting values: EAVP lesson 12, p. 20.")),
      h("div", { class: "controls" },
        knob(2, "perDay", "times a day", "", 24, 86400, undefined, v => `${Math.round(v)}×`),
        knob(0, "perDay", "times a day", "", 1, 1440, undefined, v => `${Math.round(v)}×`),
        knob(1, "mA", "current", "mA", 0.001, 5, undefined, v => `${v} mA`),
        slider({ label: "Battery", unit: "mAh", min: 200, max: 20000, value: capacity, log: true, format: v => `${Math.round(v)} mAh`, onInput: v => { capacity = v; update(); } }),
        total.el, life.el,
        h("p", { class: "hint" }, "Sending once an hour instead of once a minute: try it. The idle current matters because it never stops."))));
    update();
  },
};
