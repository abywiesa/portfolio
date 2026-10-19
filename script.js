const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll("[data-split]").forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`)
    .join(" ");
});

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => {
  const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--rd", Math.min(sibs.indexOf(el), 6) * 70 + "ms");
  io.observe(el);
});

document.querySelectorAll(".row-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = btn.nextElementSibling;
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    panel.classList.toggle("open", !open);
  });
});

const rot = document.getElementById("rotator");
if (rot && !reduce) {
  const words = ["UI/UX Design (Figma)", "Data Analytics", "Software Engineering"];
  const el = rot.firstElementChild;
  let i = 0;
  setInterval(() => {
    el.classList.add("out");
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove("out");
      el.classList.add("in");
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("in")));
    }, 450);
  }, 3000);
}

const stats = document.querySelector(".stats");
if (stats && !reduce) {
  const nums = stats.querySelectorAll("[data-count]");
  nums.forEach((n) => (n.textContent = "0"));
  const so = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    so.disconnect();
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      nums.forEach((n) => (n.textContent = Math.round(+n.dataset.count * eased)));
      if (p < 1) requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 1300);
  });
  so.observe(stats);
}

const track = document.getElementById("track");
if (track) track.innerHTML += track.innerHTML;

document.querySelectorAll(".spot").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  });
});

const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
function setMenu(open) {
  nav.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", String(open));
}
burger.addEventListener("click", () => setMenu(!nav.classList.contains("menu-open")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

const links = [...menu.querySelectorAll("a")];
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

const progress = document.getElementById("progress");
const totop = document.getElementById("totop");
let lastY = 0;
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle("scrolled", y > 20);
  nav.classList.toggle("hide", y > lastY && y > 300);
  totop.classList.toggle("show", y > 700);
  lastY = y;
  ticking = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  },
  { passive: true }
);
onScroll();

const root = document.documentElement;
const themeBtn = document.getElementById("theme");
const metaTheme = document.querySelector('meta[name="theme-color"]');

function applyTheme(t) {
  root.setAttribute("data-theme", t);
  if (metaTheme) metaTheme.setAttribute("content", t === "dark" ? "#0e0e10" : "#ffffff");
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
applyTheme(root.getAttribute("data-theme") || "light");

themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  if (!reduce) {
    root.classList.add("theme-anim");
    setTimeout(() => root.classList.remove("theme-anim"), 600);
  }
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

try {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) applyTheme(e.matches ? "dark" : "light");
  });
} catch (e) {}