// Mixing light (lesson 9; lesson 14): a NeoPixel holds a red, a green and a blue LED, each set from 0 to 255. Three
// bytes give 256 × 256 × 256 colours.
import { rgbHex, colourCount } from "../core/index.js";
import { h, slider, readout } from "../ui/kit.js";
import * as a from "../ui/art.js";

export default {
  id: "rgb",
  art: () => a.picture("Three overlapping circles of red, green and blue light",
    `<g style="mix-blend-mode:screen"><circle cx="80" cy="60" r="34" fill="#ff3b30" opacity=".9"/><circle cx="120" cy="60" r="34" fill="#34c759" opacity=".9"/><circle cx="100" cy="95" r="34" fill="#2f6bff" opacity=".9"/></g>`),
  mount(root) {
    const c = [255, 100, 50];
    const swatch = h("div", { class: "swatch", role: "img" });
    const hex = readout("The colour, as the web writes it"), count = readout("Colours three bytes can make");
    const code = h("pre", { class: "code" });
    const update = () => {
      const x = rgbHex(...c);
      swatch.style.background = x;
      swatch.setAttribute("aria-label", `A swatch of red ${c[0]}, green ${c[1]}, blue ${c[2]}`);
      hex.set(x);
      count.set(colourCount.toLocaleString("en-GB"), "", "256 × 256 × 256");
      code.textContent = `strip.setPixelColor(0, strip.Color(${c.join(", ")}));\nstrip.show();`;
    };
    root.append(h("div", { class: "stage" }, h("div", {}, swatch, code), h("div", { class: "controls" },
      ...["Red", "Green", "Blue"].map((name, k) => slider({ label: name, unit: "", min: 0, max: 255, value: c[k], step: 1, format: String,
        onInput: v => { c[k] = v; update(); } })),
      hex.el, count.el,
      h("p", { class: "hint" }, "Light adds up: red and green make yellow, all three at 255 make white."))));
    update();
  },
};
