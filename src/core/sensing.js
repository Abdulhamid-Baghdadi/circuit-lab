// Inputs and measurements: meters in a circuit, a button on a pin, contact bounce, the opamp, RMS and the NTC.
import { parallel } from "./circuit.js";

/** A source U feeding a resistor R, with an ammeter (internal resistance RA) and a voltmeter (RV) placed by the
 *  student. "series"/"parallel" say where each meter sits relative to R. Returns what each meter reads and the current
 *  that really flows through R, so a wrong place shows as a wrong reading (lecture 3: ammeter low R in series,
 *  voltmeter high R in parallel). The source has its own small resistance Rs (lecture 2, slides 35–36: 0.2 Ω), so
 *  an ammeter across R shorts the source and the voltage collapses, as on a real battery. */
export function meters(U, R, ammeter, voltmeter, RA = 0.1, RV = 10e6, Rs = 0.2) {
  // The ammeter in series adds RA to the loop; across R it is a near short in parallel with R.
  // The voltmeter across R adds RV in parallel; in series it is a near open in the loop.
  let load = R;
  if (voltmeter === "parallel") load = parallel([load, RV]);
  if (ammeter === "parallel") load = parallel([load, RA]);
  let loop = Rs + load + (ammeter === "series" ? RA : 0) + (voltmeter === "series" ? RV : 0);
  const I = U / loop;
  const Uload = I * load;
  const IR = Uload / R;
  return {
    I, IR,
    ammeterReads: ammeter === "series" ? I : Uload / RA,
    voltmeterReads: voltmeter === "parallel" ? Uload : I * RV,
  };
}

/** A push button on a digital pin, 5 V logic: wiring "none", "pulldown" (R to GND, button to 5 V) or "pullup"
 *  (R to 5 V, button to GND, as INPUT_PULLUP). A pin connected to nothing floats: no defined level (null). */
export function buttonPin(wiring, pressed, R = 10e3, U = 5) {
  if (wiring === "none") return pressed ? { U, level: 1, I: 0 } : { U: null, level: null, I: 0 };
  if (wiring === "pulldown") return pressed ? { U, level: 1, I: U / R } : { U: 0, level: 0, I: 0 };
  return pressed ? { U: 0, level: 0, I: U / R } : { U, level: 1, I: 0 };
}

/** A deterministic pseudo-random sequence in 0..1 from a seed (mulberry32), so a picture of noise or bounce is the
 *  same every time. */
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One press and release of a button, sampled every millisecond for `ms` ms: pressed at `down`, released at `up`,
 *  each edge followed by `bounceMs` of bouncing contacts. */
export function bouncyPress({ ms = 200, down = 30, up = 130, bounceMs = 8, seed = 7 } = {}) {
  const rnd = random(seed);
  return Array.from({ length: ms }, (_, t) => {
    const steady = t >= down && t < up ? 1 : 0;
    const sinceEdge = t >= up ? t - up : t >= down ? t - down : Infinity;
    return sinceEdge < bounceMs ? (rnd() < 0.5 ? 1 - steady : steady) : steady;
  });
}

/** The course's debounce (lecture 11, p. 37), run on a sampled signal one millisecond per sample: a change restarts
 *  the timer; the state follows the reading only once it has been steady for longer than `delay` ms. */
export function debounce(signal, delay) {
  let last = signal[0] ?? 0, state = last, since = 0;
  return signal.map((reading, t) => {
    if (reading !== last) since = t;
    if (t - since > delay && reading !== state) state = reading;
    last = reading;
    return state;
  });
}

/** How many times a signal goes from 0 to 1: the presses a sketch would count. */
export const risingEdges = signal => signal.reduce((n, v, k) => n + (k > 0 && v === 1 && signal[k - 1] === 0 ? 1 : 0), 0);

/** Differential amplifier, Vout = Av × (V+ − V−) (lecture 10, p. 13). A real opamp cannot go beyond its supply:
 *  `rail` clips the output to ±rail; Infinity gives the slide's ideal table. */
export function opamp(vPlus, vMinus, gain, rail = Infinity) {
  const ideal = gain * (vPlus - vMinus);
  return Math.max(-rail, Math.min(rail, ideal));
}

/** RMS and peak of a sine: peak = √2 × RMS (lecture 4, slide 12). */
export const peakOf = rms => rms * Math.SQRT2;
export const rmsOf = peak => peak / Math.SQRT2;

/** An NTC's resistance at temperature T from a table of [°C, Ω] points, between points by straight lines in ln R,
 *  since the resistance falls roughly exponentially with temperature; outside the table it is an error. */
export function ntcResistance(T, table) {
  const k = table.findIndex(([t], i) => i < table.length - 1 && T >= t && T <= table[i + 1][0]);
  if (k < 0) throw new Error(`${T} °C is outside the table (${table[0][0]} to ${table.at(-1)[0]} °C).`);
  const [t0, r0] = table[k], [t1, r1] = table[k + 1];
  return Math.exp(Math.log(r0) + (T - t0) / (t1 - t0) * (Math.log(r1) - Math.log(r0)));
}

/** The other way: the temperature an NTC's resistance stands for, by the same lines. */
export function ntcTemperature(R, table) {
  const k = table.findIndex(([, r], i) => i < table.length - 1 && R <= r && R >= table[i + 1][1]);
  if (k < 0) return null;
  const [t0, r0] = table[k], [t1, r1] = table[k + 1];
  return t0 + (Math.log(R) - Math.log(r0)) / (Math.log(r1) - Math.log(r0)) * (t1 - t0);
}
