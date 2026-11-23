/* GenAI Career Hub — renders /data/*.json. All text is inserted with textContent; only https links are rendered. */
(function () {
  "use strict";

  const DATA = {};
  const FILES = ["updates", "certifications", "techstack", "roadmap", "playbook"];
  const view = document.getElementById("view");

  // ---------- helpers ----------
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "href") { const u = safeUrl(v); if (u) node.setAttribute("href", u); }
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : String(v));
      }
    }
    for (const c of children.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return node;
  }
  function safeUrl(u) {
    try { const p = new URL(String(u)); return p.protocol === "https:" ? p.href : null; } catch (e) { return null; }
  }
  function link(url, text) {
    const u = safeUrl(url);
    return u ? el("a", { href: u, target: "_blank", rel: "noopener noreferrer" }, text || hostOf(u)) : null;
  }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return "source"; } }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function fitBadge(fit) {
    const cls = { "Top pick": "good", "Recommended": "", "Optional": "warn", "Skip": "bad" }[fit];
    return el("span", { class: "badge " + (cls === undefined ? "quiet" : cls) }, fit);
  }

  // ---------- views ----------
  function viewWeek() {
    const latest = (DATA.updates.entries || [])[0];
    if (!latest) return [el("p", { class: "empty" }, "No updates yet.")];
    const top = (DATA.certifications.items || []).filter(c => c.fit === "Top pick").slice(0, 3);
    return [
      el("h2", null, "Week of " + latest.week),
      el("p", { class: "lead" }, latest.headline),
      latest.careerAction ? el("div", { class: "callout" }, el("strong", null, "Your action this week"), latest.careerAction) : null,
      el("div", { class: "grid" }, (latest.items || []).map(it =>
        el("article", { class: "card" },
          el("span", { class: "badge" }, it.category),
          el("h3", null, it.title),
          el("p", null, it.summary),
          el("p", { class: "meta" }, link(it.url, "Source: " + hostOf(it.url)))
        )
      )),
      top.length ? el("h2", { style: "margin-top:28px" }, "Top certification picks") : null,
      el("div", { class: "grid" }, top.map(certCard))
    ];
  }

  function viewCareer() {
    const r = DATA.roadmap;
    const p = r.positioning || {};
    return [
      el("h2", null, "Positioning: " + (p.title || "")),
      el("p", { class: "lead" }, p.summary),
      el("div", { class: "card", style: "margin-bottom:20px" },
        el("h3", null, "Proof points to build and show"),
        el("ul", { class: "list" }, (p.proofPoints || []).map(x => el("li", null, x)))
      ),
      el("h2", null, "12-month plan"),
      el("p", { class: "lead" }, "Last reviewed " + r.lastReviewed + ". Adjusted as the weekly updates land."),
      el("div", { class: "timeline" }, (r.phases || []).map(ph =>
        el("div", { class: "card phase" },
          el("div", null, el("div", { class: "when" }, ph.name), el("div", { class: "theme" }, ph.theme)),
          el("ul", { class: "list" }, (ph.goals || []).map(g => el("li", null, g)))
        )
      )),
      el("h2", { style: "margin-top:28px" }, "Weekly habit"),
      el("ul", { class: "list" }, (r.weeklyHabits || []).map(h => el("li", null, h)))
    ];
  }

  function certCard(c) {
    const doneKey = "done:" + c.id;
    const done = !!store(doneKey);
    const card = el("article", { class: "card" + (c.fit === "Top pick" ? " highlight" : "") + (done ? " is-done" : "") },
      el("div", null, fitBadge(c.fit), el("span", { class: "badge " + (c.free ? "good" : "quiet") }, c.free ? "Free" : c.cost), el("span", { class: "badge quiet" }, c.vendor)),
      el("h3", { style: "margin-top:8px" }, c.name),
      el("p", { class: "meta" }, [c.code, c.level].filter(Boolean).join(" · ")),
      el("p", { class: "meta" }, "Status: " + c.status),
      el("p", null, c.why),
      c.prep ? el("p", { class: "meta" }, "Prep: " + c.prep) : null,
      el("p", { class: "meta" }, link(c.url, "Official page"), (c.sources || []).length ? " · " : null,
        (c.sources || []).map((s, i) => [i ? ", " : "", link(s, "source " + (i + 1))]))
    );
    const box = el("input", { type: "checkbox", "aria-label": "Mark " + c.name + " as done" });
    box.checked = done;
    box.addEventListener("change", () => { store(doneKey, box.checked); card.classList.toggle("is-done", box.checked); });
    card.append(el("label", { class: "done-toggle" }, box, "Done (saved in this browser)"));
    return card;
  }

  function viewCerts() {
    const items = (DATA.certifications.items || []).slice().sort((a, b) => a.priority - b.priority);
    const filters = [
      ["All", () => true], ["Top picks", c => c.fit === "Top pick"], ["Free", c => c.free],
      ["AWS", c => c.vendor === "AWS"], ["Exams", c => c.type === "certification"], ["Skip", c => c.fit === "Skip"]
    ];
    const grid = el("div", { class: "grid" });
    const bar = el("div", { class: "filters", role: "group", "aria-label": "Filter certifications" });
    function apply(i) {
      [...bar.children].forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
      grid.replaceChildren(...items.filter(filters[i][1]).map(certCard));
    }
    filters.forEach(([label], i) => bar.append(el("button", { type: "button", onclick: () => apply(i) }, label)));
    apply(0);
    return [
      el("h2", null, "Certifications and free credentials"),
      el("p", { class: "lead" }, "Ranked for a principal engineer leading Amazon Connect and a GenAI CoE on AWS. Verified " + DATA.certifications.lastVerified + "; prices in USD and can change, so confirm on the official page before booking."),
      bar, grid
    ];
  }

  function viewRadar() {
    const t = DATA.techstack;
    return [
      el("h2", null, "Tech radar"),
      el("p", { class: "lead" }, "Adopt: use by default. Trial: use on real projects with care. Assess: watch and prototype. Hold: avoid for new work. Verified " + t.lastVerified + "."),
      el("div", { class: "radar" }, (t.rings || []).map(ring =>
        el("div", { class: "ring " + ring.toLowerCase() },
          el("h3", null, ring),
          (t.items || []).filter(i => i.ring === ring).map(i =>
            el("div", { class: "card" },
              el("span", { class: "badge quiet" }, i.area),
              el("h3", { style: "margin-top:6px" }, i.url ? link(i.url, i.name) : i.name),
              el("p", null, i.what),
              el("p", { class: "meta" }, i.why)
            )
          )
        )
      ))
    ];
  }

  function viewPlaybook() {
    const p = DATA.playbook;
    return [
      el("h2", null, "Enterprise GenAI playbook"),
      el("p", { class: "lead" }, p.intro),
      el("h3", null, "Reference architecture: six layers"),
      el("div", { class: "layers" }, (p.layers || []).map((l, i) =>
        el("div", { class: "layer" }, el("span", { class: "num" }, String(i + 1)), el("div", null, el("strong", null, l.name), el("div", { class: "meta" }, l.detail)))
      )),
      el("h3", { style: "margin-top:16px" }, "Trust services that span every layer"),
      el("div", { class: "chips" }, (p.trust || []).map(t => el("span", { class: "badge" }, t))),
      el("h2", null, "Blueprints"),
      el("div", { class: "grid" }, (p.blueprints || []).map(b =>
        el("article", { class: "card" },
          el("span", { class: "badge" }, "Blueprint " + b.id),
          el("h3", { style: "margin-top:6px" }, b.name),
          el("p", null, el("strong", null, b.point)),
          el("div", { class: "flow" }, (b.flow || []).map((s, i) => [i ? el("span", { class: "arrow", "aria-hidden": "true" }, "→") : null, el("span", { class: "step" }, s)])),
          el("ul", { class: "list" }, (b.notes || []).map(n => el("li", null, n)))
        )
      )),
      el("h2", { style: "margin-top:28px" }, "Production readiness checklist"),
      el("ul", { class: "list" }, (p.checklist || []).map(c => el("li", null, c))),
      p.docNote ? el("p", { class: "meta", style: "margin-top:16px" }, p.docNote) : null
    ];
  }

  function viewArchive() {
    const entries = DATA.updates.entries || [];
    return [
      el("h2", null, "All weekly updates"),
      el("p", { class: "lead" }, entries.length + " week(s) logged, newest first."),
      entries.map(e => el("div", { class: "card", style: "margin-bottom:14px" },
        el("h3", null, "Week of " + e.week),
        el("p", { class: "meta" }, e.headline),
        (e.items || []).map(it => el("div", { class: "update-item" },
          el("span", { class: "badge" }, it.category), el("strong", null, it.title),
          el("p", { class: "meta" }, it.summary, " ", link(it.url, "Source"))
        ))
      ))
    ];
  }

  const VIEWS = { week: viewWeek, career: viewCareer, certs: viewCerts, radar: viewRadar, playbook: viewPlaybook, archive: viewArchive };

  function route() {
    const key = (location.hash || "#week").slice(1);
    const name = VIEWS[key] ? key : "week";
    document.querySelectorAll(".tabs a").forEach(a => {
      if (a.dataset.tab === name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    view.replaceChildren(...VIEWS[name]().flat().filter(Boolean));
    window.scrollTo(0, 0);
  }

  Promise.all(FILES.map(f => fetch("data/" + f + ".json", { cache: "no-cache" }).then(r => {
    if (!r.ok) throw new Error(f + ".json: HTTP " + r.status);
    return r.json();
  }).then(j => { DATA[f] = j; })))
    .then(() => {
      const latest = (DATA.updates.entries || [])[0];
      document.getElementById("updated").textContent = latest ? "Last updated " + latest.week : "";
      window.addEventListener("hashchange", route);
      route();
    })
    .catch(err => {
      view.replaceChildren(el("p", { class: "empty" }, "Could not load data. " + err.message));
    });
})();
