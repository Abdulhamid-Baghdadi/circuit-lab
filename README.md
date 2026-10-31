# Circuit Lab

Play with the laws of the course *Electronic aspects of products* (University of Antwerp): turn a knob, and the circuit,
the meters and the numbers follow. Made by the [SMART Lab](https://github.com/UA-SMARTLab) beside the
[Grove Kit Emulator](https://ua-smartlab.github.io/arduino-grove-emulator/).

**Open it:** https://abdulhamid-baghdadi.github.io/circuit-lab/

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/ohm-dark.gif">
    <img src="docs/ohm-light.gif" alt="The Ohm's law lab: the voltage slider rises from 2 V to 10 V and the ammeter climbs from 2 mA; then the resistance slides from 1 kΩ down to 270 Ω, the current reaches 37 mA and the power readout turns into a warning, 370 mW, too hot for a 0.25 W resistor" width="100%">
  </picture>
</p>
<p align="center"><sub>Raise the voltage, lower the resistance: the current follows, and the resistor warns when it would burn. Plays once, 5 s.</sub></p>

<p align="center">
  <img src="docs/light.png" alt="The overview in the light theme: the lectures in order, each with a row of cards; every card has a line drawing of its idea, such as a circuit loop with a current arrow for Ohm's law, and a frame coloured by topic" width="49%">
  <img src="docs/dark.png" alt="A lab page in the dark theme: the voltage divider of lecture 1, its circuit with a voltmeter reading 2.5 V, its sliders and the analogRead result 512" width="49%">
</p>

## The labs

The labs are cards, grouped by the lecture that teaches them, in the course's order, with the date and title from each
lecture's first slide. Each lab is one idea of the course, with the law, where in the course it comes from, a circuit to play with, and
practice questions from the course's own exercise sheet, checked as you type them ("22.5m" is read as 22.5 mA).

| Lecture | Lab | What you do |
|---|---|---|
| 1 · 28 Sep · Basic electricity | Ohm's law | Turn U and R; the current, the meters and the dots on the wire follow; the resistor warns when it gets too hot |
|  | Series and parallel | Wire three resistors three ways and watch the course's table method fill in, with its checks |
|  | Voltage divider | Two resistors or the kit's potentiometer; add a load and see it pull the output down; the number analogRead would give |
| 2 · 6 Oct · Power, conductors and batteries | Long cables | Pouillet's law: how much of 230 V reaches a load 700 m away on 6 mm² |
| 3 · 13 Oct · Electromagnetism, transformers and LEDs | Transformer | Change the windings; the voltage, the currents, and the line loss at high and low voltage follow |
|  | LED series resistor | Pick the colour, supply and current; get the resistor, the one you can buy, and what really flows |
| 4 · 20 Oct · Distribution and safety | Electric shock | Your body as a resistor: where you stand and what you touch, against the lesson's table of effects |
| 5 · 21 Oct · Introduction to Arduino | From voltage to analogRead | The voltage on A0, the 10-bit staircase, `map()` and the servo turning |
|  | PWM: a voltage by switching | `analogWrite` as a square wave, its duty and average, and an LED dimming |
| 10 · 17 Nov · Semiconductors | From AC to smooth DC | No diode, one diode or a Graetz bridge, then a capacitor: the wave, its average and its ripple |
| 11 · 17 Nov · Digital circuits | Binary numbers | Flip bits; see the place values, the two's complement reading and the flash ADC's comparators |
| 12 · 24 Nov · Batteries | Battery life | Cell type, cells in series, capacity and load: hours, Wh and the cost of a charge |
| 13 · 1 Dec · Motors | Sizing a motor | Mass, height and time give the ideal power; a safety factor gives the motor to buy |

Every answer on the exercise sheet is recomputed by the program in the tests, so a typo in the data fails the build.

## Open it on your own PC

The page needs a web server because it reads `data/labs.json`. In this folder:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

then open http://127.0.0.1:8765. Nothing is sent anywhere; there is no account and no tracking.

## How it is made

```
src/core   the laws, the converter and the units: pure functions, tested headless
src/ui     sliders, readouts, circuit symbols, the cards' line art: knows no law
src/labs   one file per lab, joining the two, with its card picture; listed in src/labs/index.js
src/app.js reads data/labs.json and lays out the lectures with their labs
```

Plain JavaScript modules, no framework and no build step; GitHub Pages serves the folder as it is. The layers and the
check that holds them: [ARCHITECTURE.md](ARCHITECTURE.md). Tests: `node --test "tests/unit/*.test.js"`.

## Limits

- Ideal parts: no tolerances, no temperature, an LED with a fixed forward voltage, an ideal converter. Measure on the
  real kit too.
- The rectifier steps ideal diodes with a fixed 0.7 V drop; the shock lab uses the lesson's single body resistances.
- The cable lab holds the load's current fixed, as the lesson's example does; a real load draws less when its voltage
  drops.

## Licence

The code is under the [MIT licence](LICENSE). The course's exercises and slides belong to their authors and are
cited, not copied.
