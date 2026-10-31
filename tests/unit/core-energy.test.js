// The second wave's laws against the course's worked examples, each named.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cellPack, energyCost, energyBought, batteryBudget, linearRegulator, dropper, GATES, binaryDac } from "../../src/core/index.js";

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

test("a 10 V source with 0.2 Ω inside gives 8.333 A and 8.333 V on 1 Ω (lecture 2, slides 35–36)", () => {
  const b = cellPack("series", 1, 10, 0.2, 1);
  near(b.I, 10 / 1.2);
  near(b.U, 10 / 1.2);
});

test("four 1.5 V cells: 6 V in series, 1.5 V in parallel, 3 V two by two (lecture 2, slides 31–33)", () => {
  near(cellPack("series", 4, 1.5, 0, 1e9).E, 6);
  near(cellPack("parallel", 4, 1.5, 0, 1e9).E, 1.5);
  near(cellPack("2x2", 4, 1.5, 0, 1e9).E, 3);
  near(cellPack("parallel", 4, 1.5, 0.2, 1).r, 0.05);
});

test("energy: a 60 W lamp for 2 h is 120 Wh (lecture 3, slide 25); the exercise-10 lamp for a day is about 4 kWh, €1", () => {
  near(energyCost(60, 2, 1, 0.25).kWh, 0.12);
  const lamp = energyCost(57.5 ** 2 / 20, 24, 1, 0.25);
  near(lamp.kWh, 3.968, 1e-3);
  near(lamp.cost, 0.992, 1e-3);
  near(energyBought(3000, 3), 1000); // a heat pump of COP 3 (300 %) buys a third
});

test("IoT budget: lecture 12's example uses 2686.4 mAh a year; 5200 mAh lasts 1.94 years (p. 20)", () => {
  const b = batteryBudget([{ mA: 18, seconds: 5, perDay: 72 }, { mA: 0.065, seconds: 60, perDay: 1440 },
                           { mA: 100, seconds: 0.1, perDay: 1440 }], 5200);
  near(b.perYear, 2686.4, 1e-9);
  near(b.years, 1.935676, 1e-6);
});

test("regulator: 12 V to 5 V at 1 A burns 7 W, 42 % efficient; a dropper for the exercise-7 motor is 213.33 Ω", () => {
  const r = linearRegulator(12, 5, 1);
  near(r.Ploss, 7);
  near(r.efficiency, 5 / 12);
  assert.equal(linearRegulator(4, 5, 1).works, false);
  near(dropper(230, 400, 150).R, 213.333, 1e-5);
});

test("gates: every truth table by definition", () => {
  const rows = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const table = name => rows.map(([a, b]) => GATES[name](a, b)).join("");
  assert.equal(table("AND"), "0001");
  assert.equal(table("OR"), "0111");
  assert.equal(table("NAND"), "1110");
  assert.equal(table("NOR"), "1000");
  assert.equal(table("XOR"), "0110");
  assert.equal(table("XNOR"), "1001");
  assert.equal(GATES.NOT(1), 0);
});

test("DAC: 000 → 0 V, 001 → −1.25 V, 111 → −8.75 V (lecture 11, p. 50); with 800 Ω feedback −1.00 and −7.00 V (p. 51)", () => {
  near(binaryDac([0, 0, 0]), 0);
  near(binaryDac([0, 0, 1]), -1.25);
  near(binaryDac([1, 1, 1]), -8.75);
  near(binaryDac([0, 0, 1], 5, 1000, 800), -1);
  near(binaryDac([1, 1, 1], 5, 1000, 800), -7);
});
