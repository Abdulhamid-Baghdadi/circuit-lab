// The core's laws against results worked by hand from their definitions (Ohm's law, the divider rule, the RC step
// response, the ideal n-bit converter); each test names the hand calculation.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cable, battery, table, ohm, series, parallel, divider, ledResistor, tau, charge, discharge, adcRead, lsb, adcToVolts, pwm, map,
         si, parseSi, e12 } from "../../src/core/index.js";

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

test("Ohm's law solves for the missing one: 5 V over 1 kΩ is 5 mA", () => {
  near(ohm({ U: 5, R: 1000 }).I, 0.005);
  near(ohm({ R: 220, I: 0.01 }).U, 2.2);
  near(ohm({ U: 9, I: 0.003 }).R, 3000);
  assert.throws(() => ohm({ U: 5 }), /exactly two/);
});

test("series adds; parallel of two equal resistors halves; a short wins", () => {
  near(series([100, 220, 330]), 650);
  near(parallel([1000, 1000]), 500);
  near(parallel([100, 300]), 75); // 100·300 / 400
  assert.equal(parallel([100, 0]), 0);
});

test("divider: 5 V over 10 kΩ and 10 kΩ gives 2.5 V; a 10 kΩ load pulls it to 5/3 V", () => {
  near(divider(5, 10e3, 10e3).Uout, 2.5);
  near(divider(5, 10e3, 10e3, 10e3).Uout, 5 / 3); // lower = 5 kΩ, 5·5/15
  near(divider(9, 1e3, 2e3).Uout, 6);
});

test("LED resistor: (5 − 2) V / 20 mA = 150 Ω; a supply below Uf is an error", () => {
  near(ledResistor(5, 2, 0.02), 150);
  assert.throws(() => ledResistor(2, 2, 0.02), /higher/);
});

test("RC: τ = R·C; after one τ 63.2 % charged, 36.8 % left when discharging", () => {
  near(tau(10e3, 100e-6), 1);
  near(charge(5, 10e3, 100e-6, 1), 5 * (1 - Math.exp(-1)));
  near(discharge(5, 10e3, 100e-6, 1) / 5, Math.exp(-1));
  near(charge(5, 1e3, 1e-6, 5e-3) / 5, 1 - Math.exp(-5)); // after 5τ, 99.3 %
});

test("ADC: 10 bits over 5 V; 2.5 V reads 512, 5 V reads 1023, below 0 clamps", () => {
  assert.equal(adcRead(2.5), 512);
  assert.equal(adcRead(5), 1023);
  assert.equal(adcRead(-1), 0);
  assert.equal(adcRead(3.3, 3.3, 12), 4095);
  near(lsb(), 5 / 1024);
  near(adcToVolts(1023), 5);
});

test("PWM: analogWrite(127) is a 49.8 % duty, about 2.49 V average on 5 V", () => {
  const p = pwm(127);
  near(p.duty, 127 / 255);
  near(p.average, 5 * 127 / 255);
  assert.equal(pwm(300).value, 255);
});

test("map() truncates like Arduino's: map(512, 0, 1023, 0, 180) = 90", () => {
  assert.equal(map(512, 0, 1023, 0, 180), 90);
  assert.equal(map(1023, 0, 1023, 0, 255), 255);
});

test("SI prefixes both ways, and E12 values", () => {
  assert.equal(si(4700, "Ω"), "4.7 kΩ");
  assert.equal(si(0.0047, "A"), "4.7 mA");
  assert.equal(si(1e-7, "F"), "100 nF");
  near(parseSi("4k7"), 4700);
  near(parseSi("10 µF"), 10e-6);
  near(parseSi("220n"), 220e-9);
  assert.equal(parseSi("abc"), null);
  assert.equal(parseSi("-5"), -5);
  assert.equal(parseSi("−5"), -5); // the minus sign students may paste
  near(e12(150), 150);
  near(e12(160), 150);
  near(e12(160, "up"), 180);
});

test("table method: the syllabus's series and parallel examples (§2.4) and lesson 1, slide 53", () => {
  const s = table("series", 9, [3e3, 10e3, 5e3]);
  near(s[3][1], 500e-6);
  assert.deepEqual(s.slice(0, 3).map(([R, I]) => Number((R * I).toFixed(3))), [1.5, 5, 2.5]);
  const p = table("parallel", 9, [10e3, 2e3, 1e3]);
  near(p[3][1], 14.4e-3);
  near(p[3][0], 625);
  near(table("combined", 1, [5, 7, 1])[3][0], 35 / 12 + 1); // 5 ∥ 7 = 35/12 Ω
});

test("cable: lesson 2's 700 m line at 25 A on 6 mm² copper loses about 102 V (slides 24–27)", () => {
  const c = cable(230, 0.0175e-6, 700, 6e-6, 25);
  near(c.Rwire, 2.0417, 1e-4);
  near(c.drop, 102.08, 1e-3);
  near(c.Uload, 127.92, 1e-3);
});

test("battery: 15 Ah at 3.7 V is 55.5 Wh; the 3 W lamp on 7.4 V draws 0.41 A (lesson 12, p. 12 and 18)", () => {
  near(battery(15, 3.7, 1).Wh, 55.5);
  near(battery(6.5, 7.4, 3).I, 0.4054, 1e-3);
});
