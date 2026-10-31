# Circuit Lab

Play with the laws of the course *Electronic aspects of products* (University of Antwerp): turn a knob, and the circuit,
the meters and the numbers follow. Made by the [SMART Lab](https://github.com/UA-SMARTLab) beside the
[Grove Kit Emulator](https://ua-smartlab.github.io/arduino-grove-emulator/).

**Open it:** https://abdulhamid-baghdadi.github.io/circuit-lab/

<p align="center">
  <img src="docs/light.png" alt="The voltage divider lab in the light theme: a circuit of two 10 kΩ resistors on 5 V with a voltmeter reading 2.5 V, sliders for the supply, both resistors and a load, and the result 512 for analogRead" width="49%">
  <img src="docs/dark.png" alt="The same voltage divider lab in the dark theme" width="49%">
</p>

## The labs

Each lab is one idea of the course, with the law, where in the course it comes from, a circuit to play with, and
practice questions from the course's own exercise sheet, checked as you type them ("22.5m" is read as 22.5 mA).

| Lab | What you do | From the course |
|---|---|---|
| Ohm's law | Turn U and R; the current, the meters and the dots on the wire follow; the resistor warns when it gets too hot | Lesson 1, slides 37–44; lesson 2 (power) |
| Series and parallel | Wire three resistors three ways and watch the course's table method fill in, with its checks | Lesson 1, slides 45–53; syllabus §2.4 |
| Voltage divider | Two resistors or the kit's potentiometer; add a load and see it pull the output down; the number analogRead would give | Lesson 1; exercise 2; Grove potentiometer |
| LED series resistor | Pick the colour, supply and current; get the resistor, the one you can buy, and what really flows | Lesson 3, slide 26; exercise 11 |
| Long cables | Pouillet's law: how much of 230 V reaches a load 700 m away on 6 mm² | Lesson 2, slides 21–27 |
| Battery life | Cell type, cells in series, capacity and load: hours, Wh and the cost of a charge | Lesson 12; example question 3 |
| From voltage to analogRead | The voltage on A0, the 10-bit staircase, `map()` and the servo turning | Lesson 5; jury question 2 |
| PWM | `analogWrite` as a square wave, its duty and average, and an LED dimming | Lesson 5, slide 54; lesson 10 |

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
src/ui     sliders, readouts, circuit symbols: knows no law
src/labs   one file per lab, joining the two; listed in src/labs/index.js
src/app.js reads data/labs.json and lays out the tabs
```

Plain JavaScript modules, no framework and no build step; GitHub Pages serves the folder as it is. The layers and the
check that holds them: [ARCHITECTURE.md](ARCHITECTURE.md). Tests: `node --test "tests/unit/*.test.js"`.

## Limits

- Ideal parts: no tolerances, no temperature, an LED with a fixed forward voltage, an ideal converter. Measure on the
  real kit too.
- The cable lab holds the load's current fixed, as the lesson's example does; a real load draws less when its voltage
  drops.
- No animation of the main task yet in this README; the screenshots show the divider lab.

## Licence

The code is under the [MIT licence](LICENSE). The course's exercises and slides belong to their authors and are
cited, not copied.
