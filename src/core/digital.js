// Numbers as the hardware holds them (lesson 11): place values, two's complement and the flash converter.

/** The place values of n in base 2: [{ digit, weight }], most significant first, for `bits` places. */
export function places(n, bits) {
  if (!Number.isInteger(n) || n < 0 || n >= 2 ** bits) throw new Error(`${n} does not fit in ${bits} bits unsigned (0 to ${2 ** bits - 1}).`);
  return Array.from({ length: bits }, (_, k) => {
    const weight = 2 ** (bits - 1 - k);
    return { digit: Math.floor(n / weight) % 2, weight };
  });
}

export const toBinary = (n, bits) => places(n, bits).map(p => p.digit).join("");

/** Two's complement of a signed n in `bits`: invert all bits of |n|, then add 1 (lesson 11, p. 15). */
export function twos(n, bits) {
  const lo = -(2 ** (bits - 1)), hi = 2 ** (bits - 1) - 1;
  if (!Number.isInteger(n) || n < lo || n > hi) throw new Error(`${n} does not fit in ${bits} bits signed (${lo} to ${hi}).`);
  return toBinary(n < 0 ? 2 ** bits + n : n, bits);
}

/** The bit pattern read back as a signed number. */
export function fromTwos(pattern) {
  const bits = pattern.length, u = parseInt(pattern, 2);
  return pattern[0] === "1" ? u - 2 ** bits : u;
}

/** A flash converter of n bits needs 2^n − 1 comparators (lesson 11, p. 53–55). */
export const flashComparators = bits => 2 ** bits - 1;
