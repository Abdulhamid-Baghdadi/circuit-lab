// The page: one tab per lab, its idea and law above the circuit, practice below. Reads the words from
// data/labs.json; a lab with no words there, or words with no lab, is reported rather than skipped.
import { h, practice } from "./ui/kit.js";
import { parseSi } from "./core/index.js";
import { labs } from "./labs/index.js";

const main = document.querySelector("main");
const tabs = document.querySelector("[role=tablist]");

function fail(message) {
  main.replaceChildren(h("p", { class: "error", role: "alert" }, message));
}

function show(id, panels, buttons) {
  for (const [k, b] of buttons) {
    const on = k === id;
    b.setAttribute("aria-selected", String(on));
    b.tabIndex = on ? 0 : -1;
    panels.get(k).hidden = !on;
  }
  try { history.replaceState(null, "", `#${id}`); } catch { /* a file:// page may refuse; the tab still shows */ }
}

async function start() {
  let data;
  try {
    data = await (await fetch("data/labs.json")).json();
  } catch (error) {
    fail(`The labs' texts (data/labs.json) could not be read: ${error.message}. Open the page through a web server ` +
         "(the published site, or python -m http.server in this folder), not by double-clicking the file.");
    return;
  }
  const words = new Map(data.labs.map(l => [l.id, l]));
  const missing = [...labs.filter(l => !words.has(l.id)).map(l => l.id), ...data.labs.filter(w => !labs.some(l => l.id === w.id)).map(w => w.id)];
  if (missing.length) console.error(`Labs and data/labs.json disagree about: ${missing.join(", ")}`);
  const panels = new Map(), buttons = new Map();
  for (const lab of labs.filter(l => words.has(l.id))) {
    const w = words.get(lab.id);
    const button = h("button", { role: "tab", id: `tab-${lab.id}`, "aria-controls": `panel-${lab.id}`, type: "button",
                                 onclick: () => show(lab.id, panels, buttons) }, w.title);
    const body = h("div", { class: "lab" });
    const panel = h("section", { role: "tabpanel", id: `panel-${lab.id}`, "aria-labelledby": `tab-${lab.id}`, hidden: true },
      h("header", { class: "intro" }, h("h2", {}, w.title), h("p", { class: "idea" }, w.idea),
        h("p", { class: "law" }, w.law), h("p", { class: "source" }, `From the course: ${w.lecture}`)),
      body,
      w.practice.length ? h("section", { class: "practice-list" }, h("h3", {}, "Practise"),
        w.practice.map(q => practice({ ...q, parse: parseSi }))) : null);
    lab.mount(body);
    tabs.append(button);
    main.append(panel);
    panels.set(lab.id, panel);
    buttons.set(lab.id, button);
  }
  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  tabs.addEventListener("keydown", e => {
    const ids = [...buttons.keys()], at = ids.indexOf(document.activeElement.id.replace("tab-", ""));
    const next = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: ids.length - 1 }[e.key];
    if (next === undefined || at < 0) return;
    e.preventDefault();
    const id = ids[(next + ids.length) % ids.length];
    show(id, panels, buttons);
    buttons.get(id).focus();
  });
  const wanted = location.hash.slice(1);
  show(buttons.has(wanted) ? wanted : labs[0].id, panels, buttons);
}

document.querySelector("#theme").addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch { /* private window: the choice lasts this visit */ }
});

start();
