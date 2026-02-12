const canvas = document.getElementById("aurora");
const ctx = canvas.getContext("2d", { alpha: true });
const grain = document.querySelector(".grain");
const loader = document.getElementById("loader");
const loaderStatus = document.getElementById("loaderStatus");
const cursor = document.getElementById("cursor");
const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const quickMenu = document.getElementById("quickMenu");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileWidth = window.matchMedia("(max-width: 1100px)");
const coarsePointer = window.matchMedia("(pointer: coarse)");
const desktop = !(mobileWidth.matches || coarsePointer.matches);
const enableHeavyFx = desktop && !reduceMotion;
const root = document.documentElement;
let loaderStarted = false;

function syncMobileUi() {
  const isMobileUi = coarsePointer.matches || mobileWidth.matches;
  root.classList.toggle("mobile-ui", isMobileUi);
}

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function forceScrollTop() {
  if (location.hash) {
    history.replaceState(null, "", location.pathname + location.search);
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

window.addEventListener("DOMContentLoaded", forceScrollTop);
window.addEventListener("load", forceScrollTop);
window.addEventListener("pageshow", forceScrollTop);
window.addEventListener("DOMContentLoaded", syncMobileUi);
window.addEventListener("load", syncMobileUi);
window.addEventListener("pageshow", (e) => {
  if (!e.persisted) return;
  if (loader) loader.classList.remove("hide");
  root.classList.add("is-loading");
  document.body.classList.add("is-loading");
  loaderStarted = false;
  runLoader();
});
window.addEventListener("resize", syncMobileUi);

let t = 0;
let dpr = 1;
let lastFrame = 0;
let scrollY = window.scrollY;
let parallaxTicking = false;

function initQuickMenu() {
  if (!menuToggle || !quickMenu) return;

  const closeMenu = () => {
    quickMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const opened = quickMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", opened ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!quickMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  quickMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) closeMenu();
  });
}

function animateHeadline() {
  requestAnimationFrame(() => {
    const headline = document.getElementById("headline");
    if (headline) headline.classList.add("show");
  });
}

function initLandingGate() {
  document.body.classList.remove("landing-locked");
}

function runLoader() {
  if (loaderStarted) return;
  loaderStarted = true;

  if (loader) loader.classList.remove("hide");
  root.classList.add("is-loading");
  document.body.classList.add("is-loading");

  const introDuration = 6000;
  const start = performance.now();
  const phases = [
    "جاري تجهيز العرض",
    "جاري ترتيب المحتوى",
    "جاهز تقريباً"
  ];
  let activePhase = -1;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / introDuration, 1);

    const nextPhase = progress < 0.34 ? 0 : progress < 0.72 ? 1 : 2;
    if (loaderStatus && nextPhase !== activePhase) {
      activePhase = nextPhase;
      loaderStatus.childNodes[0].nodeValue = phases[nextPhase];
      loaderStatus.classList.remove("flash");
      void loaderStatus.offsetWidth;
      loaderStatus.classList.add("flash");
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    root.classList.remove("is-loading");
    document.body.classList.remove("is-loading");
    if (loader) loader.classList.add("hide");
    animateHeadline();
    initLandingGate();
  }

  requestAnimationFrame(tick);
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (!enableHeavyFx) {
    canvas.style.display = "none";
    if (grain) grain.style.display = "none";
  }
}

function blob(x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawAurora(now = 0) {
  const minStep = reduceMotion ? 70 : 33;
  if (document.hidden || now - lastFrame < minStep) {
    requestAnimationFrame(drawAurora);
    return;
  }

  lastFrame = now;
  t += reduceMotion ? 0.002 : 0.0042;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.globalCompositeOperation = "screen";

  blob(
    window.innerWidth * (0.22 + Math.sin(t * 1.08) * 0.08),
    window.innerHeight * (0.3 + Math.cos(t * 0.9) * 0.08),
    280 + Math.sin(t * 1.7) * 42,
    "rgba(95,142,168,0.12)"
  );

  blob(
    window.innerWidth * (0.68 + Math.cos(t * 0.62) * 0.11),
    window.innerHeight * (0.3 + Math.sin(t * 1.1) * 0.07),
    330 + Math.cos(t * 1.32) * 56,
    "rgba(108,139,162,0.1)"
  );

  blob(
    window.innerWidth * (0.54 + Math.sin(t * 0.72) * 0.1),
    window.innerHeight * (0.82 + Math.cos(t * 1.36) * 0.08),
    390 + Math.sin(t * 0.86) * 48,
    "rgba(165,143,104,0.09)"
  );

  requestAnimationFrame(drawAurora);
}

function initCursor() {
  if (!desktop || reduceMotion) return;

  document.body.classList.add("custom-cursor");
  cursor.style.opacity = "1";

  window.addEventListener(
    "mousemove",
    (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    },
    { passive: true }
  );

  document.querySelectorAll("a, button, .card").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("active"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
  });
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function initTilt() {
  if (!desktop || reduceMotion) return;

  document.querySelectorAll(".tilt").forEach((card) => {
    let frame = null;
    let px = 0;
    let py = 0;

    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;

      if (frame) return;
      frame = requestAnimationFrame(() => {
        card.style.setProperty("--tiltX", `${py * -7}deg`);
        card.style.setProperty("--tiltY", `${px * 9}deg`);
        card.style.setProperty("--lift", "-3px");
        frame = null;
      });
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--tiltX", "0deg");
      card.style.setProperty("--tiltY", "0deg");
      card.style.setProperty("--lift", "0px");
    });
  });
}

function applyParallax() {
  const items = document.querySelectorAll(".parallax");
  items.forEach((item) => {
    const speed = Number(item.dataset.speed || 0.08);
    item.style.setProperty("--parallaxY", `${-scrollY * speed}px`);
  });
}

function initParallax() {
  if (reduceMotion || !desktop) return;
  applyParallax();

  window.addEventListener(
    "scroll",
    () => {
      scrollY = window.scrollY;
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(() => {
        applyParallax();
        parallaxTicking = false;
      });
    },
    { passive: true }
  );
}

function initMagnetic() {
  if (!desktop || reduceMotion) return;

  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
}

window.addEventListener(
  "scroll",
  () => {
    header.classList.toggle("compact", window.scrollY > 40);
  },
  { passive: true }
);

window.addEventListener("resize", resize);

resize();
if (enableHeavyFx) drawAurora();
initReveal();
initTilt();
initParallax();
initCursor();
initMagnetic();
initQuickMenu();
runLoader();
