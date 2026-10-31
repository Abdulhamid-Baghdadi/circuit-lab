// The third wave's laws against the course's examples and definitions, each named.
import { test } from "node:test";
import assert from "node:assert/strict";
import { breadboardNet, shorted, multimeter, npnSwitch, clockIn, shiftOutBits, rgbHex, colourCount, intType, intDivide, toInt,
         inBase, addBinary, stepper, servo, cycleState, cellsFor, rhoAt } from "../../src/core/index.js";

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

test("breadboard: a–e of a column are one strip, f–j another, rails in two halves as lesson 5 draws them; a part across one strip is shorted", () => {
  assert.equal(breadboardNet("12a"), breadboardNet("12e"));
  assert.notEqual(breadboardNet("12e"), breadboardNet("12f"));
  assert.notEqual(breadboardNet("12a"), breadboardNet("13a"));
  assert.equal(breadboardNet("+top1"), breadboardNet("+top15"));
  assert.notEqual(breadboardNet("+top15"), breadboardNet("+top16"));
  assert.ok(shorted("5b", "5d"));
  assert.ok(!shorted("5b", "8b"));
  assert.throws(() => breadboardNet("x"), /not a breadboard hole/);
});

test("multimeter: right socket and range read the value; wrong socket blows the fuse or reads 0; too low a range reads OL", () => {
  assert.equal(multimeter("U", "V", 20, 9).display, "9.00");
  assert.equal(multimeter("U", "A", 20, 9).display, "fuse");
  assert.equal(multimeter("I", "V", 0.2, 0.05).display, "0.000");
  assert.equal(multimeter("U", "V", 2, 9).display, "OL");
  assert.equal(multimeter("I", "mA", 0.2, 1).display, "fuse");
});

test("transistor: the lesson-14 220 Ω on a 5 V pin gives 19.5 mA base current; with β 100 it saturates a 12 V, 24 Ω strip", () => {
  const t = npnSwitch({ Rb: 220, Usupply: 12, Rload: 24 });
  near(t.Ib, 4.3 / 220);
  assert.ok(t.saturated);
  near(t.Ic, 0.5);
  assert.equal(npnSwitch({ Rb: 220, Usupply: 12, Rload: 24, on: false }).Ic, 0);
  assert.equal(npnSwitch({ Rb: 100e3, Usupply: 12, Rload: 24 }).saturated, false);
});

test("shift register: eight clocks of 10110001 MSB first leave 10110001 in the register (lesson 14, MSBFIRST)", () => {
  const bits = shiftOutBits(0b10110001);
  assert.deepEqual(bits, [1, 0, 1, 1, 0, 0, 0, 1]);
  assert.equal(bits.reduce(clockIn, 0), 0b10110001);
  assert.deepEqual(shiftOutBits(0b10110001, false), [1, 0, 0, 0, 1, 1, 0, 1]);
});

test("colour: 255, 100, 50 is #FF6432 (the struct example, lesson 9); three bytes give 16 777 216 colours", () => {
  assert.equal(rgbHex(255, 100, 50), "#FF6432");
  assert.equal(colourCount, 16777216);
});

test("types: the lecture 7 ranges; an unsigned type wraps modulo 2^bits (255 + 1 in a byte is 0)", () => {
  const int = intType("R3", "int");
  assert.deepEqual([int.min, int.max], [-32768, 32767]);
  assert.deepEqual([intType("R3", "unsigned long").min, intType("R3", "unsigned long").max], [0, 4294967295]);
  assert.equal(intType("R3", "byte").store(256), 0);
  assert.equal(intType("R3", "unsigned int").store(65537), 1);
});

test("typecasting (lesson 9): (int)10.75 → 10, (int)23.67 → 23, 100 / 3 → 33 in whole numbers", () => {
  assert.equal(toInt(10.75), 10);
  assert.equal(toInt(23.67), 23);
  assert.equal(intDivide(100, 3), 33);
});

test("Boeing 787 (lecture 13): a signed 32-bit counter of hundredths of a second overflows after 248 days", () => {
  near(intType("R3", "long").max / 100 / 86400, 248.55, 1e-4);
});

test("bases: 26 is 11010, 32, 1A (lecture 11, p. 7–8); 7 + 5 in 4 bits is 1100 with carries", () => {
  assert.deepEqual([2, 8, 10, 16].map(b => inBase(26, b)), ["11010", "32", "26", "1A"]);
  const s = addBinary(7, 5, 4);
  assert.equal(s.sum, 12);
  assert.equal(s.overflow, false);
  assert.equal(addBinary(15, 1, 4).overflow, true);
});

test("stepper: 200 steps of 1.8° is one turn; skipped steps go unnoticed; a servo ends where it is told", () => {
  near(stepper(200).believed, 360);
  const s = stepper(200, 1.8, 20);
  assert.equal(s.lost, 10);
  near(s.actual, 342);
  assert.equal(servo(200), 180);
});

test("traffic light (lesson 9): green 5 s, orange 2 s, red 5 s, then green again", () => {
  const states = [{ name: "GREEN", ms: 5000 }, { name: "ORANGE", ms: 2000 }, { name: "RED", ms: 5000 }];
  assert.equal(cycleState(states, 0).state.name, "GREEN");
  assert.equal(cycleState(states, 5500).state.name, "ORANGE");
  assert.equal(cycleState(states, 11999).state.name, "RED");
  assert.equal(cycleState(states, 12000).state.name, "GREEN");
});

test("cells: a 12 V car battery is 6 lead-acid cells of 2 V (lesson 2); 7.4 V is two LiPo cells", () => {
  assert.equal(cellsFor(12, 2), 6);
  assert.equal(cellsFor(7.4, 3.7), 2);
});

test("copper at 70 °C: 20 % more resistive with α = 0.0039 (lecture 2's table), by the linear form", () => {
  near(rhoAt(0.0175e-6, 0.0039, 70) / 0.0175e-6, 1.195);
});
