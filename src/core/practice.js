// A practice question's answer, worked from its data with the laws, so the answer in labs.json is checked, never
// trusted.
import { ohm, parallel, series, divider, ledResistor } from "./circuit.js";
import { adcRead, map, pwm } from "./signal.js";
import { transformer, liftPower } from "./supply.js";
import { fromTwos, flashComparators } from "./digital.js";

const LAWS = {
  ohm: q => ohm({ U: q.U ?? null, R: q.R ?? null, I: q.I ?? null })[q.find],
  powerR: q => q.U ** 2 / q.P,
  pairs: q => q.U ** 2 / series([parallel([q.R, q.R]), parallel([q.R, q.R])]),
  parallel: q => parallel(q.R),
  seriesShare: q => q.U / series(q.R) * q.R[q.k],
  // Answered in mm², as the sheet asks; ρ in Ω·m, l in m.
  cableArea: q => q.rho * q.l / (q.drop / q.I) * 1e6,
  dividerR2: q => (q.Uin - q.U1) / (q.U1 / q.R1),
  divider: q => divider(q.Uin, q.R1, q.R2).Uout,
  led: q => ledResistor(q.U, q.Uf, q.I),
  adcMap: q => map(adcRead(q.U), 0, 1023, 0, q.outMax),
  pwm: q => pwm(q.value).average,
  batteryAh: q => q.P / q.U * q.h,
  batteryWh: q => q.Ah * q.U,
  transformerU: q => transformer(q.U, q.N1, q.N2, q.R).Uout,
  lift: q => liftPower(q.m, q.h, q.t).P,
  binary: q => parseInt(q.pattern, 2),
  twos: q => fromTwos(q.pattern),
  comparators: q => flashComparators(q.bits),
};

/** The answer to a question's "compute" block; an unknown law is an error naming the ones there are. */
export function solve(compute) {
  const law = LAWS[compute.law];
  if (!law) throw new Error(`No law "${compute.law}" in src/core/practice.js; there are ${Object.keys(LAWS).join(", ")}.`);
  return law(compute);
}

/** Is an answer right? Within a relative tolerance (2 % by default, for answers rounded on the sheet). */
export const isRight = (given, answer, tolerance = 0.02) =>
  tolerance === 0 ? given === answer : Math.abs(given - answer) <= tolerance * Math.abs(answer);
