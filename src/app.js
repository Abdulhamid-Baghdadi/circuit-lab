// The page: the course's lectures in order, each with the labs it teaches, as an outline beside the lab (folded
// above it on a phone). One lab shows at a time, with its lecture above it and the previous and next lab below.
// Reads the words from data/labs.json; a lab with no words there, or words with no lab, is reported, not skipped.
import { h, practice } from "./ui/kit.js";
import { parseSi } from "./core/index.js";
import { labs } from "./labs/index.js";

const main = document.querySelector("main");
const outline = document.querySelector("#outline");
const nav = outline.querySelector("nav");
const narrow = matchMedia("(max-width: 760px)");

function fail(message) {
  main.replaceChildren(h("p", { class: "error", role: "alert" }, message));
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
  const code = new Map(labs.map(l => [l.id, l]));
  const missing = [...labs.filter(l => !words.has(l.id)).map(l => l.id),
                   ...data.labs.filter(w => !code.has(w.id)).map(w => w.id)];
  if (missing.length) console.error(`Labs and data/labs.json disagree about: ${missing.join(", ")}`);

  // The course order: lecture by lecture, the labs in the order each lecture lists them.
  const order = data.lectures.flatMap(lecture => lecture.labs.filter(id => code.has(id) && words.has(id)).map(id => ({ id, lecture })));
  const at = new Map(order.map((entry, k) => [entry.id, k]));
  const links = new Map(), panels = new Map();

  nav.replaceChildren(h("ol", { class: "lectures" }, data.lectures.map(lecture => h("li", {},
    h("p", { class: "lecture" }, h("span", { class: "number" }, `Lecture ${lecture.number}`), h("span", { class: "date" }, lecture.date),
      h("span", { class: "title" }, lecture.title)),
    h("ul", {}, lecture.labs.filter(id => at.has(id)).map(id => {
      const a = h("a", { href: `#${id}` }, words.get(id).title);
      links.set(id, a);
      return h("li", {}, a);
    }))))));

  const panel = id => {
    if (panels.has(id)) return panels.get(id);
    const w = words.get(id), { lecture } = order[at.get(id)];
    const prev = order[at.get(id) - 1], next = order[at.get(id) + 1];
    const step = (entry, rel, text) => entry ? h("a", { href: `#${entry.id}`, class: `step ${rel}`, rel },
      h("span", { class: "dir" }, text), h("span", {}, words.get(entry.id).title),
      h("span", { class: "where" }, `Lecture ${entry.lecture.number}`)) : h("span");
    const body = h("div", { class: "lab" });
    const section = h("section", { class: "panel", "aria-labelledby": `title-${id}` },
      h("header", { class: "intro" },
        h("p", { class: "eyebrow" }, `Lecture ${lecture.number} · ${lecture.date} · ${lecture.title}`),
        h("h2", { id: `title-${id}`, tabindex: "-1" }, w.title), h("p", { class: "idea" }, w.idea),
        h("p", { class: "law" }, w.law), h("p", { class: "source" }, `From the course: ${w.lecture}`)),
      body,
      w.practice.length ? h("section", { class: "practice-list" }, h("h3", {}, "Practise"),
        w.practice.map(q => practice({ ...q, parse: parseSi }))) : null,
      h("nav", { class: "steps", "aria-label": "Previous and next lab" }, step(prev, "prev", "← Previous"), step(next, "next", "Next →")));
    code.get(id).mount(body);
    panels.set(id, section);
    return section;
  };

  const show = (focus) => {
    const wanted = location.hash.slice(1);
    const id = at.has(wanted) ? wanted : order[0].id;
    for (const [k, a] of links) k === id ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    // A lab keeps its knobs where the student left them when they come back to it.
    main.replaceChildren(panel(id));
    document.title = `${words.get(id).title} · Circuit Lab`;
    if (narrow.matches) outline.open = false;
    if (focus) { main.querySelector("h2").focus({ preventScroll: true }); scrollTo({ top: 0 }); }
  };
  addEventListener("hashchange", () => show(true));
  show(false);
}

// On a phone the outline folds above the lab; on a wide screen it is always open beside it.
const fit = () => { outline.open = !narrow.matches; };
narrow.addEventListener("change", fit);
fit();

document.querySelector("#theme").addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch { /* private window: the choice lasts this visit */ }
});

start();
