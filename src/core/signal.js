// From the voltage on a pin to the number a sketch sees, and back: the analogue-to-digital converter and PWM.

/** analogRead: an n-bit converter maps 0..Uref to 0..2^n − 1 as floor(U · 2^n / Uref), the ideal converter
 *  without noise or offset; a real one is off by a step or two. */
export function adcRead(U, Uref = 5, bits = 10) {
  const top = 2 ** bits - 1;
  const clamped = Math.min(Math.max(U, 0), Uref);
  return Math.min(top, Math.floor(clamped / Uref * 2 ** bits));
}

/** The voltage one step of the converter stands for: Uref / 2^n. */
export const lsb = (Uref = 5, bits = 10) => Uref / 2 ** bits;

/** From a reading back to volts, as a sketch would compute it: value · Uref / (2^n − 1). */
export const adcToVolts = (value, Uref = 5, bits = 10) => value * Uref / (2 ** bits - 1);

/** analogWrite(value) on an 8-bit PWM pin: duty = value / 255; the average voltage is duty · Uhigh. */
export function pwm(value, Uhigh = 5) {
  const v = Math.min(Math.max(Math.round(value), 0), 255);
  const duty = v / 255;
  return { value: v, duty, average: duty * Uhigh };
}

/** Arduino's map(): integer arithmetic, as the reference writes it. */
export const map = (x, inMin, inMax, outMin, outMax) =>
  Math.trunc((x - inMin) * (outMax - outMin) / (inMax - inMin)) + outMin;
