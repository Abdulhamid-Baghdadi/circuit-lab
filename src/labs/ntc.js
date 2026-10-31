// A temperature sensor from start to number (lecture 8): the NTC's resistance falls as it warms; in a divider that
// becomes a voltage; analogRead makes it a number; the sketch turns the number back into degrees.
import { ntcResistance, ntcTemperature, divider, adcRead, adcToVolts, si } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import { lineChart } from "../ui/chart.js";
import * as a from "../ui/art.js";

// The NTC on lecture 8's slide: R25 = 4.7 kΩ, −15 to 75 °C; resistance in Ω at each temperature (the table stops at 55 °C).
const TABLE = [[-15, 32900], [-5, 19400], [5, 11750], [15, 7330], [25, 4700], [35, 3060], [45, 2070], [55, 1410]];

export default {
  id: "ntc",
  art: () => a.picture("A thermometer beside a resistance curve falling as the temperature rises",
    a.rect(30, 20, 18, 85, a.INK, 3) + a.circle(39, 118, 14, a.INK, 3, a.HOT) + a.line([[39, 104], [39, 60]], a.HOT, 6) +
      a.path("M75,25 C95,95 125,115 185,122", a.ACC, 3) + a.line([[70, 20], [70, 130], [188, 130]], a.DIM, 2) +
      a.text(180, 115, "°C", 12, a.DIM, "end") + a.text(80, 20, "R", 12, a.DIM, "start")),
  mount(root) {
    let T = 25, Rfixed = 4700;
    const chart = h("div", { class: "drawing" });
    const r = readout("NTC resistance (from the table)"), u = readout("Voltage on A0, NTC above, fixed resistor below"),
          v = readout("analogRead(A0)"), back = readout("Temperature the sketch works out");
    const update = () => {
      const R = ntcResistance(T, TABLE), { Uout } = divider(5, R, Rfixed), value = adcRead(Uout);
      const Tback = ntcTemperature(Rfixed * (5 / adcToVolts(value) - 1), TABLE);
      r.set(si(R, "Ω"));
      u.set(si(Uout, "V"), "", "Uout = 5 V × Rfixed / (RNTC + Rfixed): warmer, higher");
      v.set(String(value));
      back.set(Tback === null ? "—" : `${Tback.toFixed(1)} °C`, "", "From the reading back through the divider and the table.");
      const temps = Array.from({ length: 71 }, (_, k) => -15 + k);
      chart.replaceChildren(lineChart({
        lines: [{ x: temps, y: temps.map(t => ntcResistance(t, TABLE) / 1000), name: "NTC resistance" },
                { x: [T, T], y: [0, 33], name: "Now", cls: "rms-line" }],
        xLabel: "Temperature [°C]", yLabel: "Resistance [kΩ]", yMin: 0, yMax: 33,
        label: `The NTC's resistance falls from 32.9 kΩ at −15 °C to 1.41 kΩ at 55 °C; now ${si(R, "Ω")} at ${T} °C`,
      }));
    };
    root.append(h("div", { class: "stage" }, chart, h("div", { class: "controls" },
      slider({ label: "Temperature", unit: "°C", min: -15, max: 55, value: T, step: 1, format: x => `${x} °C`, onInput: x => { T = x; update(); } }),
      slider({ label: "Fixed resistor", unit: "Ω", min: 1e3, max: 47e3, value: Rfixed, log: true, onInput: x => { Rfixed = x; update(); },
        help: "Equal to the NTC's R25 puts 25 °C in the middle, at 2.5 V." }),
      r.el, u.el, v.el, back.el,
      h("p", { class: "hint" }, "Negative temperature coefficient: warmer means less resistance."))));
    update();
  },
};
