// The energy bill (lecture 3, slide 25; lecture 4, slides 24–26): consumption is power times time, the cost is
// that times the price. The same heat bought four ways: electric heater, heat pump, condensing and old gas boiler.
import { energyCost, energyBought } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

// Lecture 4, slides 24–26: about €0.45 per kWh for electricity, €0.13 for gas; efficiencies of heating.
const HEATERS = [["Electric heater", 1, "elec"], ["Heat pump, COP 3 (300 %)", 3, "elec"], ["Condensing gas boiler, 95 %", 0.95, "gas"],
                 ["Atmospheric gas boiler, 72 %", 0.72, "gas"]];

export default {
  id: "bill",
  art: () => a.picture("A plug, a meter counting kilowatt hours, and a coin",
    a.rect(20, 45, 70, 50) + a.text(55, 77, "kWh", 18, a.ACC) + a.line([[90, 70], [120, 70]], a.INK, 2) +
      a.circle(150, 70, 25, a.ACC, 3) + a.text(150, 78, "€", 24, a.ACC) + a.line([[35, 95], [35, 120]], a.INK, 2) + a.line([[75, 95], [75, 120]], a.INK, 2)),
  mount(root) {
    let P = 60, hours = 2, days = 365, price = 0.45, heat = 10000, gas = 0.13;
    const use = readout("Consumption = P × hours × days"), cost = readout("Cost = consumption × price");
    const table = h("table", { class: "method" });
    const update = () => {
      const e = energyCost(P, hours, days, price);
      use.set(`${e.kWh.toFixed(1)} kWh`, "", `${P} W × ${hours} h × ${days} days`);
      cost.set(`€${e.cost.toFixed(2)}`);
      const rows = HEATERS.map(([name, eff, kind]) => {
        const kWh = energyBought(heat, eff);
        return [name, kWh, kWh * (kind === "gas" ? gas : price)];
      });
      const best = Math.min(...rows.map(r => r[2]));
      table.replaceChildren(h("thead", {}, h("tr", {}, ["Heating", "Energy bought [kWh]", "Cost per year [€]", ""].map(t => h("th", { scope: "col" }, t)))),
        h("tbody", {}, rows.map(([name, kWh, eur]) => h("tr", { class: eur === best ? "best" : "" },
          h("td", { class: "text" }, name), h("td", {}, kWh.toFixed(0)), h("td", {}, eur.toFixed(0)), h("td", {}, eur === best ? "← cheapest" : "")))));
    };
    root.append(h("div", { class: "stage" },
      h("div", { class: "controls" },
        h("h3", {}, "One device"),
        slider({ label: "Power P", unit: "W", min: 1, max: 3000, value: P, log: true, onInput: v => { P = v; update(); } }),
        slider({ label: "Hours a day", unit: "h", min: 0.5, max: 24, value: hours, step: 0.5, format: v => `${v} h`, onInput: v => { hours = v; update(); } }),
        slider({ label: "Days", unit: "", min: 1, max: 365, value: days, step: 1, format: String, onInput: v => { days = v; update(); } }),
        slider({ label: "Electricity price", unit: "€/kWh", min: 0.1, max: 0.8, value: price, step: 0.01, format: v => `€${v.toFixed(2)}`, onInput: v => { price = v; update(); } }),
        use.el, cost.el),
      h("div", { class: "controls" },
        h("h3", {}, "Heating a house"),
        slider({ label: "Heat needed a year", unit: "kWh", min: 2000, max: 30000, value: heat, step: 500, format: v => `${v} kWh`, onInput: v => { heat = v; update(); } }),
        slider({ label: "Gas price", unit: "€/kWh", min: 0.05, max: 0.3, value: gas, step: 0.01, format: v => `€${v.toFixed(2)}`, onInput: v => { gas = v; update(); } }),
        table,
        h("p", { class: "hint" }, "Prices and efficiencies from lecture 4, slides 24–26. Slide 27: pay special attention to standby consumption."))));
    update();
  },
};
