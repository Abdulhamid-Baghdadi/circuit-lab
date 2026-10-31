// The Arduino side of the course: the breadboard's connections, the multimeter, the transistor switch, the shift
// register, colours, variable types, number bases, the stepper and the servo, a state machine, battery cells.

// ---------------------------------------------------------------- breadboard
/** A hole on a half-size breadboard: a terminal hole "12c" (column 1–30, row a–j) or a rail hole "+top3". Holes
 *  a–e of one column are one strip, f–j another; each rail runs the length of the board. Returns the net's name. */
export function breadboardNet(hole) {
  const rail = hole.match(/^([+-])(top|bottom)\d+$/);
  if (rail) return `${rail[1]}${rail[2]}`;
  const m = hole.match(/^(\d+)([a-j])$/);
  if (!m) throw new Error(`"${hole}" is not a breadboard hole: use a column and a row such as 12c, or a rail such as +top3.`);
  return `${m[1]}${"abcde".includes(m[2]) ? "a-e" : "f-j"}`;
}

/** A part whose two legs land in one net is shorted: current goes round it. */
export const shorted = (legA, legB) => breadboardNet(legA) === breadboardNet(legB);

// ---------------------------------------------------------------- multimeter
/** A multimeter reading. `want` is what the student means to measure: "U" across a part or "I" through it; `socket`
 *  is the red lead's socket ("V", "mA", "A"); `range` the full scale of the chosen range (V or A); `value` the true
 *  voltage or current. The meter's own fuse in the mA socket is 0.2 A (an assumption, typical). */
export function multimeter(want, socket, range, value) {
  if (want === "U" && socket !== "V") return { display: "fuse", note: "The current sockets are almost a short circuit: across a voltage the fuse blows." };
  if (want === "I" && socket === "V") return { display: "0.000", note: "The voltage socket has a very high resistance: in series it stops the current." };
  if (want === "I" && socket === "mA" && Math.abs(value) > 0.2) return { display: "fuse", note: "More than the mA socket's fuse takes: use the A socket." };
  if (Math.abs(value) > range) return { display: "OL", note: "Over the range: choose a higher one." };
  return { display: value.toFixed(Math.max(0, 3 - Math.floor(Math.log10(range)))), note: "" };
}

// ---------------------------------------------------------------- transistor
/** An NPN transistor switching a load from a supply: base resistor Rb from a 5 V pin, a base-emitter drop of 0.7 V,
 *  a current gain β (an assumption; 2N2222 datasheets give a range). Saturated when β·Ib covers what the load needs. */
export function npnSwitch({ pin = 5, Rb, beta = 100, Usupply, Rload, on = true }) {
  if (!on) return { Ib: 0, Ic: 0, saturated: false, Uload: 0 };
  const Ib = Math.max(0, (pin - 0.7) / Rb), need = Usupply / Rload, Ic = Math.min(beta * Ib, need);
  return { Ib, Ic, saturated: beta * Ib >= need, Uload: Ic * Rload };
}

// ---------------------------------------------------------------- shift register
/** One clock pulse of a 74HC595's shift stage: every bit moves one place towards Q7 and the data pin's bit enters
 *  at Q0. The register is 8 bits, Q7 first in the string's left place. */
export const clockIn = (reg, bit) => ((reg << 1) | bit) & 0xff;

/** The bits shiftOut sends for a byte, in order: MSBFIRST starts with bit 7. */
export const shiftOutBits = (data, msbFirst = true) =>
  Array.from({ length: 8 }, (_, k) => (data >> (msbFirst ? 7 - k : k)) & 1);

// ---------------------------------------------------------------- colour
/** An RGB colour of three 0–255 channels as the web writes it, and how many colours three bytes give. */
export const rgbHex = (r, g, b) => "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
export const colourCount = 256 ** 3;

// ---------------------------------------------------------------- variable types
/** Sizes in bytes: the UNO R3's AVR as the lecture 7 table gives them; the UNO R4's ARM makes int and unsigned int
 *  4 bytes (and double 8). */
export const TYPES = {
  R3: { byte: [1, false], int: [2, true], "unsigned int": [2, false], long: [4, true], "unsigned long": [4, false] },
  R4: { byte: [1, false], int: [4, true], "unsigned int": [4, false], long: [4, true], "unsigned long": [4, false] },
};

/** The range of a whole-number type, and what a value becomes when stored in it (it wraps round, as the hardware does). */
export function intType(board, type) {
  const [bytes, signed] = TYPES[board][type], bits = 8 * bytes;
  const min = signed ? -(2 ** (bits - 1)) : 0, max = signed ? 2 ** (bits - 1) - 1 : 2 ** bits - 1;
  return { bits, min, max, store: v => { const m = 2 ** bits, w = ((Math.trunc(v) - min) % m + m) % m + min; return w; } };
}

/** C's division of whole numbers keeps only the whole part; (int) of a float cuts the decimals off. */
export const intDivide = (a, b) => Math.trunc(a / b);
export const toInt = x => Math.trunc(x);

// ---------------------------------------------------------------- number bases
/** A whole number in base 2, 8, 10 or 16, as the lecture's table writes it (capitals for hexadecimal). */
export const inBase = (n, base) => n.toString(base).toUpperCase();

/** Column addition of two unsigned numbers of `bits` bits: the sum, the carry into each column, and whether the
 *  result needed one bit more than there is. */
export function addBinary(a, b, bits) {
  const carries = [];
  let carry = 0;
  for (let k = 0; k < bits; k++) {
    carries.push(carry);
    carry = ((a >> k) & 1) + ((b >> k) & 1) + carry > 1 ? 1 : 0;
  }
  return { sum: (a + b) % 2 ** bits, carries: carries.reverse(), overflow: carry === 1 };
}

// ---------------------------------------------------------------- motors
/** A stepper turns `angle` degrees per step and counts steps; it has no feedback, so steps skipped under too much
 *  load go unnoticed (lecture 13). `skipEvery` skips one step in that many (0: none). Returns where it thinks it is
 *  and where it is. */
export function stepper(steps, angle = 1.8, skipEvery = 0) {
  const lost = skipEvery > 0 ? Math.floor(steps / skipEvery) : 0;
  return { believed: steps * angle, actual: (steps - lost) * angle, lost };
}

/** A servo measures its own angle and corrects: it ends where it was told, within its 0–180° (Servo.write). */
export const servo = angle => Math.max(0, Math.min(180, angle));

// ---------------------------------------------------------------- state machine
/** A cyclic state machine where each state lasts its time and then goes to the next: the state at time t and the
 *  time left in it. */
export function cycleState(states, t) {
  const period = states.reduce((a, s) => a + s.ms, 0);
  let left = ((t % period) + period) % period;
  for (const s of states) {
    if (left < s.ms) return { state: s, left: s.ms - left };
    left -= s.ms;
  }
  return { state: states[0], left: states[0].ms };
}

// ---------------------------------------------------------------- cells
/** How many cells of voltage Ecell in series reach at least U. */
export const cellsFor = (U, Ecell) => Math.ceil(U / Ecell - 1e-9);

/** Resistivity at temperature T °C from its value at 20 °C and the temperature coefficient α (the usual linear form). */
export const rhoAt = (rho20, alpha, T) => rho20 * (1 + alpha * (T - 20));
