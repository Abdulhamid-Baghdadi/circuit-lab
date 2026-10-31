// The second wave of laws against the course's own worked examples, each named, and hand calculations.
import { test } from "node:test";
import assert from "node:assert/strict";
import { transformer, rectifier, liftPower, places, toBinary, twos, fromTwos, flashComparators } from "../../src/core/index.js";

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

test("transformer: 230 V, 80:20 turns, 20 Ω lamp gives 57.5 V (exercise 10, p. 5)", () => {
  const t = transformer(230, 80, 20, 20);
  near(t.Uout, 57.5);
  near(t.P, 57.5 ** 2 / 20);
  near(t.Iin * 230, t.P); // Pin = Pout
});

test("rectifier without capacitor: half wave keeps only the positive halves, bridge flips the negative ones", () => {
  const half = rectifier({ kind: "half", Upeak: 10, f: 50, C: 0, R: 100, Udiode: 0 });
  const bridge = rectifier({ kind: "bridge", Upeak: 10, f: 50, C: 0, R: 100, Udiode: 0 });
  assert.ok(Math.min(...half.out) >= 0);
  // The mean of |sin| is 2/π of the peak, of a half-wave 1/π (by definition of the mean over a period).
  near(bridge.average, 20 / Math.PI, 0.01);
  near(half.average, 10 / Math.PI, 0.01);
});

test("rectifier: a bigger capacitor gives less ripple; the bridge loses two diode drops", () => {
  const small = rectifier({ kind: "bridge", Upeak: 12, f: 50, C: 100e-6, R: 100 });
  const big = rectifier({ kind: "bridge", Upeak: 12, f: 50, C: 1000e-6, R: 100 });
  assert.ok(big.ripple < small.ripple / 5);
  near(Math.max(...big.out), 12 - 1.4, 0.01);
});

test("lift power: the garage door, 30 kg by 2.5 m in 30 s, is 25 W (lesson 13, p. 29)", () => {
  near(liftPower(30, 2.5, 30).P, 25);
});

test("binary: 11010₂ = 26 (lesson 11, p. 7); place values", () => {
  assert.equal(toBinary(26, 5), "11010");
  assert.deepEqual(places(5, 4).map(p => p.weight), [8, 4, 2, 1]);
  assert.throws(() => places(16, 4), /does not fit/);
});

test("two's complement: −5 is 1011 in 4 bits, and 7 + (−5) = 2 (lesson 11, p. 15–16)", () => {
  assert.equal(twos(5, 4), "0101");
  assert.equal(twos(-5, 4), "1011");
  assert.equal(fromTwos("1011"), -5);
  assert.equal(toBinary((0b0111 + 0b1011) % 16, 4), "0010");
});

test("flash ADC comparators: 3 bits 7, 4 bits 15, 8 bits 255 (lesson 11, p. 53–55)", () => {
  assert.deepEqual([3, 4, 8].map(flashComparators), [7, 15, 255]);
});
