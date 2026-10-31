// The laws of DC circuits the course asks for, as pure functions: SI units in, SI units out, no rounding.
// Rounding is the page's job, so a test can compare exact values.

/** Ohm's law, U = R·I, solved for whichever of the three is missing (pass it as null). */
export function ohm({ U = null, R = null, I = null }) {
  const missing = [U, R, I].filter(v => v === null).length;
  if (missing !== 1) throw new Error("Give exactly two of U, R and I.");
  if (U === null) return { U: R * I, R, I };
  if (R === null) return { U, R: U / I, I };
  return { U, R, I: U / R };
}

/** Power in a resistor: P = U·I = I²·R = U²/R. */
export const power = (U, I) => U * I;

/** Resistors in series add. */
export const series = rs => rs.reduce((a, r) => a + r, 0);

/** Resistors in parallel: 1/R = Σ 1/Rk. A 0 Ω branch shorts the lot. */
export function parallel(rs) {
  if (rs.some(r => r === 0)) return 0;
  return 1 / rs.reduce((a, r) => a + 1 / r, 0);
}

/** Unloaded voltage divider: Uout = Uin · R2 / (R1 + R2), R2 the lower resistor. With a load RL across R2, R2 is
 *  replaced by R2 ∥ RL, which is why a meter or an input with low resistance pulls the output down. */
export function divider(Uin, R1, R2, RL = Infinity) {
  const lower = RL === Infinity ? R2 : parallel([R2, RL]);
  const I = Uin / (R1 + lower);
  return { Uout: I * lower, I, lower };
}

/** Series resistor for an LED: R = (Usupply − Uf) / If. */
export function ledResistor(Usupply, Uf, If) {
  if (Usupply <= Uf) throw new Error("The supply must be higher than the LED's forward voltage.");
  return (Usupply - Uf) / If;
}

/** RC charging: u(t) = U·(1 − e^(−t/τ)), τ = R·C. Discharging: u(t) = U0·e^(−t/τ). */
export const tau = (R, C) => R * C;
export const charge = (U, R, C, t) => U * (1 - Math.exp(-t / (R * C)));
export const discharge = (U0, R, C, t) => U0 * Math.exp(-t / (R * C));

/** The table method (syllabus §2.4) for three resistors wired "series", "parallel" or "combined" ((R1 ∥ R2) then R3):
 *  [R, I] for R1, R2, R3 and the total. */
export function table(kind, U, [R1, R2, R3]) {
  if (kind === "series") {
    const Rt = series([R1, R2, R3]), I = U / Rt;
    return [[R1, I], [R2, I], [R3, I], [Rt, I]];
  }
  if (kind === "parallel") {
    const Rt = parallel([R1, R2, R3]);
    return [[R1, U / R1], [R2, U / R2], [R3, U / R3], [Rt, U / Rt]];
  }
  // (R1 ∥ R2) in series with R3, as on lesson 1, slide 53.
  const R12 = parallel([R1, R2]), Rt = R12 + R3, I = U / Rt, U12 = I * R12;
  return [[R1, U12 / R1], [R2, U12 / R2], [R3, I], [Rt, I]];
}

/** Pouillet: R = ρ·l/A, ρ in Ω·m, l in m, A in m². */
export const pouillet = (rho, l, A) => rho * l / A;

/** A load fed through a two-wire cable of length l: both wires are in series with the load. The load is taken as a
 *  fixed current I (the lesson's example), so the cable's drop is I·2R. */
export function cable(U, rho, l, A, I) {
  const Rwire = pouillet(rho, l, A), drop = I * 2 * Rwire;
  return { Rwire, drop, Uload: U - drop, loss: I * I * 2 * Rwire };
}

/** A battery of capacity Ah at voltage U feeding a load of power P: current, hours and energy. */
export function battery(Ah, U, P) {
  const I = P / U;
  return { I, hours: Ah / I, Wh: Ah * U };
}
