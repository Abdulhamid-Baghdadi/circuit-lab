// Real sources, energy bills, battery budgets, regulators, logic gates and the binary-weighted DAC.

/** n equal cells (EMF E, internal resistance r each) wired "series", "parallel" or "2x2" (two series pairs in
 *  parallel), feeding a load R. Series adds EMFs and internal resistances; parallel keeps the EMF and divides r. */
export function cellPack(wiring, n, E, r, R) {
  const [s, p] = wiring === "series" ? [n, 1] : wiring === "parallel" ? [1, n] : [2, n / 2];
  const Epack = s * E, rpack = s * r / p;
  const I = Epack / (rpack + R);
  return { E: Epack, r: rpack, I, U: I * R, lost: I * I * rpack };
}

/** Energy and its cost: a device of P watts used h hours a day for d days, at price € per kWh. */
export function energyCost(P, h, d, price) {
  const kWh = P * h * d / 1000;
  return { kWh, cost: kWh * price };
}

/** Heat Q in kWh delivered by a heater of efficiency eff (1 = 100 %, a heat pump's COP above 1): the energy bought. */
export const energyBought = (Q, eff) => Q / eff;

/** A battery budget as lecture 12's IoT example: each state draws mA for seconds, so many times a day; the mAh it
 *  uses in a year and how long a battery of the given capacity lasts. */
export function batteryBudget(states, capacity) {
  const rows = states.map(s => ({ ...s, mAh: s.mA * s.seconds * s.perDay * 365 / 3600 }));
  const perYear = rows.reduce((a, r) => a + r.mAh, 0);
  return { rows, perYear, years: capacity / perYear };
}

/** A linear regulator (lecture 10, p. 18): the excess voltage times the current becomes heat. */
export function linearRegulator(Uin, Uout, I) {
  if (Uin < Uout) return { works: false, Ploss: 0, efficiency: 0 };
  return { works: true, Ploss: (Uin - Uout) * I, efficiency: Uout / Uin };
}

/** A series resistor that drops a load of resistance Rload from U to Uwanted (exercise 7): the resistor, the current
 *  and the power it burns. */
export function dropper(U, Rload, Uwanted) {
  const I = Uwanted / Rload;
  const R = (U - Uwanted) / I;
  return { I, R, Ploss: (U - Uwanted) * I };
}

/** The logic gates of lecture 11, inputs and output 0 or 1; NOT takes only a. */
export const GATES = {
  NOT: a => 1 - a,
  AND: (a, b) => a & b,
  OR: (a, b) => a | b,
  NAND: (a, b) => 1 - (a & b),
  NOR: (a, b) => 1 - (a | b),
  XOR: (a, b) => a ^ b,
  XNOR: (a, b) => 1 - (a ^ b),
};

/** The binary-weighted DAC of lecture 11, p. 50: bit k (MSB first) drives Uhigh through R × 2^k into an inverting
 *  opamp with feedback Rf, so Vout = −Rf × Σ (Uk / (R × 2^k)). */
export function binaryDac(bits, Uhigh = 5, R = 1000, Rf = 1000) {
  return -Rf * bits.reduce((sum, bit, k) => sum + bit * Uhigh / (R * 2 ** k), 0);
}
