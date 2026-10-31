// Meters, the button pin, bounce, the opamp, RMS and the NTC, against the course's own tables and hand calculations.
import { test } from "node:test";
import assert from "node:assert/strict";
import { meters, buttonPin, bouncyPress, debounce, risingEdges, opamp, peakOf, rmsOf, ntcResistance, ntcTemperature }
  from "../../src/core/index.js";

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

test("meters placed right read U and U/R; an ammeter across R reads a short circuit current", () => {
  const right = meters(10, 100, "series", "parallel");
  near(right.voltmeterReads, 10, 1e-2);
  near(right.ammeterReads, 0.1, 1e-2);
  const wrong = meters(10, 100, "parallel", "parallel");
  assert.ok(wrong.ammeterReads > 30, "10 V over 0.2 Ω + 0.1 Ω: over 30 A, a blown fuse in the meter");
  assert.ok(wrong.IR < right.IR / 2, "the source's voltage collapses, so the resistor gets far less");
  const open = meters(10, 100, "series", "series");
  near(open.voltmeterReads, 10, 1e-3); // the voltmeter in series sees the source; nothing flows
  assert.ok(open.I < 2e-6);
});

test("button: pull-down reads 0 open and 1 pressed, 0.5 mA through 10 kΩ; nothing connected floats", () => {
  assert.deepEqual(buttonPin("pulldown", false), { U: 0, level: 0, I: 0 });
  near(buttonPin("pulldown", true).I, 0.5e-3);
  assert.equal(buttonPin("none", false).level, null);
  assert.equal(buttonPin("pullup", true).level, 0); // INPUT_PULLUP: pressed reads LOW
});

test("debounce, the course's code with 50 ms: a bouncy press counts once; with 0 ms it counts every bounce", () => {
  const raw = bouncyPress();
  assert.ok(risingEdges(raw) > 1, "the contacts bounce");
  assert.equal(risingEdges(debounce(raw, 50)), 1);
  assert.ok(risingEdges(debounce(raw, 0)) > 1, "without a wait the bounces get through");
  assert.equal(bouncyPress().join(""), bouncyPress().join(""), "the same seed gives the same bounce");
});

test("opamp: every column of lecture 10's gain-4 table (p. 13)", () => {
  const table = [[0, 0, 0], [0, 1, 4], [0, 2.5, 10], [0, 7, 28], [1, 0, -4], [2.5, 0, -10], [7, 0, -28], [3, 3, 0],
                 [-3, 3, 24], [-2, -7, -20]];
  for (const [minus, plus, out] of table) near(opamp(plus, minus, 4), out);
  assert.equal(opamp(7, 0, 4, 12), 12); // a 12 V supply stops it at 12 V
});

test("RMS: 240 V RMS peaks at 339 V, the slide's 340 V (lecture 4, slide 12); 230 V at 325 V", () => {
  near(peakOf(240), 339.41, 1e-4);
  near(peakOf(230), 325.27, 1e-4);
  near(rmsOf(peakOf(230)), 230);
});

const NTC = [[-15, 32900], [-5, 19400], [5, 11750], [15, 7330], [25, 4700], [35, 3060], [45, 2070], [55, 1410]];
test("NTC: the table points of lecture 8 come back exactly, and the inverse returns the temperature", () => {
  for (const [T, R] of NTC) near(ntcResistance(T, NTC), R);
  const R20 = ntcResistance(20, NTC);
  assert.ok(R20 < 7330 && R20 > 4700);
  near(ntcTemperature(R20, NTC), 20, 1e-9);
  assert.throws(() => ntcResistance(80, NTC), /outside the table/);
});
