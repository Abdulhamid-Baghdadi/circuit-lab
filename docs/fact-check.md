# Fact check of the labs, 31 October 2026

Every statement, number, example, warning and citation in the 35 labs (texts in `data/labs.json`, hints and values in
`src/labs/*.js`) was checked against the course files: the syllabus, the lecture slides, the exercises with answers and
the example exam questions. The check was done by three independent reviewers, each recomputing every practice answer
and opening the cited slide. Each claim was sorted into one of five classes:

| Class | Meaning | Kept? |
|---|---|---|
| A | In the course, at the cited lecture and slide or page | Yes |
| B | Follows from A by definition or arithmetic | Yes |
| C | Established physics or a language rule, stated exactly | Yes, where it is exact |
| D | Generalisation, typical value, assumption or made-up model | Removed |
| X | Wrong | Corrected |

All practice answers recompute correctly; `tests/unit/labs-data.test.js` keeps them that way.

## Removed (D)

| Lab | What was removed |
|---|---|
| Ohm's law | The 0.25 W resistor rating and its "too hot" and "warm" warnings |
| Voltage divider | The Grove potentiometer's 10 kΩ (now a slider), the light-sensor mode with invented values, "an Arduino input is almost nothing", the 90 % load warning |
| LED series resistor | Green 2.2 V and blue/white 3.0 V (now a ULED slider; exercise 11's red LED is 2 V), "wears out fast", the 0.125 W warning |
| Long cables | The 5 % loss rule, the 50 and 70 mm² sizes, the temperature slider (the syllabus's formula differs from the usual linear one) |
| Real batteries | "In parallel they add their capacity", the cell-voltage range not in the course (now 1.5 V or 2 V), the 80 % warning |
| Measuring U and I | Invented meter and source resistances and the readings they gave when placed wrong; "blown fuse" |
| Using a multimeter | Ranges, the 10 A socket, a 0.2 A fuse, example currents, "start at the highest range", "black lead" |
| Transformer | The 1 Ω line (now the loss ratio only), "iron core" (the slide says metal core) |
| RMS and peak | "The insulation must take this" |
| Breadboard | "Rails run the whole length" (lesson 5's slide 35 draws them interrupted; the lab now does too), the chip in the groove |
| Pull-down resistor | The random 0/1 pattern of a floating pin (now "?", undefined), the 1 kΩ warning |
| Mixing colours | "Each channel is PWM, like analogWrite" |
| From AC to smooth DC | The 10 % ripple warning |
| Transistor as a switch | A gain of 100 (now the syllabus's Hfe: 14 in its example, usually at most 500) |
| Lowering a voltage | The 2 W heat-sink warning, the switching converter's 70–98 % efficiency |
| Stepper or servo | The made-up model of skipped steps under load (now a "skip a step" button), "a 3D printer moves to its end switch", "a standard servo" |
| Battery chemistries | "Light and strong", "going lower damages the cell", "a fire risk" |
| Battery budget | "Sleeps most of the time" |
| Sizing a motor | A safety factor of 4 presented as a rule (now: lecture 13's door, 25 W to about 100 W) |

## Corrected (X)

| Lab | Was | Now |
|---|---|---|
| Energy bill | A heat pump "can beat cheaper gas" | At the course's prices a COP-3 heat pump costs about as much as a condensing boiler and less than an old one |
| From voltage to analogRead | "Less than one step: the number does not change" | It changes only when the voltage crosses a step edge |
| From voltage to analogRead | 90.08 in the worked answer | 90.09 |
| Temperature sensor (NTC) | Read back with 5/1023 | 5/1024, as analogRead counts (lesson 5: 512 is 2.5 V) |
| Variable types and overflow | Signed overflow "wraps round", practice answer −32 768 | Signed overflow is undefined in C++ (lesson 9: "an incorrect result"); the practice is now 255 + 1 in a byte = 0. The UNO R4 option is gone: lesson 7's table is the one taught |
| Lowering a voltage | 5 V out from any input above 5 V | Efficiency "at best"; the input needs some volts above 5 V, given by the datasheet |
| Opamp amplifier | The output stops exactly at the supply | At most the supply; real opamps stop at or a little before it |
| Button bounce | "Schmitt trigger" | The lecture's words: buffer springs, a low-pass filter, a hysteretic transistor circuit |

Citations corrected: network practice (syllabus §2.2 and §2.4), cable practice (+ syllabus §2.8), cells (lesson 2,
slides 30–37), battery (slides 28–34), bill (slides 24–27), breadboard (lesson 5, slide 35), pull-down (+ lesson 9),
ADC (lesson 11, p. 48–50), NTC (lesson 8, slide 7), types (lecture 13, p. 34), bases (p. 8–9), the Arduino lesson of
5 Nov (not "lesson 14"), the state machine's millis() (lesson 9, timers).

## Kept as illustrations, labelled on screen

- The moving dots in Ohm's law: a drawing, not a measured speed.
- The bounce in the button-bounce lab: an example signal, since the course gives no bounce times; the debounce rule
  applied to it is the course's own code.

## Errors in the course material found along the way

Not repeated in the labs; worth telling the lecturers:

- Lesson 5, slides 40 and 51: "0 to 1024" for a 10-bit ADC; the top value is 1023 (as the jury question says).
- Lessons 3 and 4, slide 23: 19² written as 367; it is 361 (the ratio 230/12 squared is 367.4, so the 367 is right
  for 230 V against 12 V, but not as 19²).
- Lecture 12, p. 7: NiMH called "Nickel and Mercury"; it is nickel–metal hydride.
- Lecture 11, p. 28: "74HC00: 3 × 3-input NAND"; the 74HC00 is four 2-input NANDs.
- Lecture 13, p. 8: 50 Hz given as 6000 RPM; 50 × 60 = 3000.
- Lecture 13, p. 34: the Boeing counter's 248 days fits hundredths of a second, not the milliseconds on the slide.
- The Arduino lesson of 5 Nov, p. 31: a 220 Ω base resistor draws 19.5 mA from the pin, more than the UNO R4's 8 mA
  that lesson 5 gives.
- Exercise 10's answer: 57.5² / 20 = 165.3 W, not 165.6 W.
- Syllabus §2.8: the temperature law written as ρ = ρ0 × α × T, which is not the usual form.
