// Mains and machines: the transformer, a rectifier with its smoothing capacitor, and mechanical power.

/** Ideal transformer: Uin/Uout = Nin/Nout and Pin = Pout, with a resistive load on the output. */
export function transformer(Uin, Nin, Nout, Rload) {
  const Uout = Uin * Nout / Nin, Iout = Uout / Rload, P = Uout * Iout;
  return { Uout, Iout, P, Iin: P / Uin };
}

/** A rectifier feeding a capacitor and a load, stepped in time from its definition rather than a ripple formula:
 *  while the rectified source (minus the diodes' drops) is above the capacitor, the ideal diodes connect it and the
 *  capacitor follows it; otherwise the capacitor discharges through the load, dU = −U/(R·C)·dt.
 *  kind "none" (the bare AC), "half" (one diode) or "bridge" (Graetz, two diodes conduct at a time). Upeak and the
 *  outputs in volts, f in Hz, C in F (0 for none), R in Ω. Returns samples over `periods` mains periods. */
export function rectifier({ kind, Upeak, f, C, R, Udiode = 0.7, periods = 3, steps = 600 }) {
  const dt = periods / f / steps, drops = kind === "bridge" ? 2 : kind === "half" ? 1 : 0;
  const t = [], source = [], out = [];
  let u = 0;
  for (let k = 0; k <= steps; k++) {
    const time = k * dt, s = Upeak * Math.sin(2 * Math.PI * f * time);
    const rect = kind === "none" ? s : Math.max(0, (kind === "bridge" ? Math.abs(s) : s) - drops * Udiode);
    if (kind === "none") u = s;
    else if (C === 0) u = rect;
    else if (rect >= u) u = rect;
    else u -= u / (R * C) * dt;
    t.push(time); source.push(s); out.push(u);
  }
  // Ripple over the last period, once the capacitor has charged.
  const last = out.slice(Math.floor(steps * (periods - 1) / periods));
  return { t, source, out, ripple: Math.max(...last) - Math.min(...last), average: last.reduce((a, b) => a + b, 0) / last.length };
}

/** Lifting a mass m [kg] by h [m] in t [s]: P = F × v with F = m × g; the course takes g ≈ 10 m/s². */
export function liftPower(m, h, t, g = 10) {
  const F = m * g, v = h / t;
  return { F, v, P: F * v };
}
