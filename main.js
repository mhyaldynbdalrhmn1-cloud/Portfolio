/**
 * ABDO MOHY — PORTFOLIO · main.js
 * ═══════════════════════════════════════════════════════════════
 *  1.  EmailJS config  ← paste your keys here
 *  2.  Loader
 *  3.  Custom cursor
 *  4.  Language toggle (EN ↔ AR)
 *  5.  Navigation (scroll, burger, active link)
 *  6.  Hero canvas (particles + rings)
 *  7.  Parallax tilt on photo
 *  8.  Scroll-reveal (IntersectionObserver)
 *  9.  Card tilt (skills)
 * 10.  Magnetic buttons
 * 11.  Contact form (EmailJS)
 * 12.  Back-to-top
 * ═══════════════════════════════════════════════════════════════
 *
 *  HOW TO ENABLE REAL EMAIL  (free at emailjs.com)
 *  ─────────────────────────────────────────────────
 *  1. Sign up → Add Gmail service → Create template with vars:
 *       {{from_name}}  {{from_email}}  {{subject}}  {{message}}
 *     Set "To Email" = mhyaldynbdalrhmn1@gmail.com
 *  2. Copy: Public Key · Service ID · Template ID
 *  3. Paste the 3 values into the constants below ↓
 * ═══════════════════════════════════════════════════════════════
 */

"use strict";

/* ── 1. EMAILJS ─────────────────────────────────── */
const EJ_KEY      = "YOUR_PUBLIC_KEY";
const EJ_SERVICE  = "YOUR_SERVICE_ID";
const EJ_TEMPLATE = "YOUR_TEMPLATE_ID";

if (typeof emailjs !== "undefined") {
  emailjs.init({ publicKey: EJ_KEY });
}

/* ── 2. LOADER ──────────────────────────────────── */
(function () {
  const loader = document.getElementById("loader");
  const bar    = document.getElementById("ld-bar");
  const pct    = document.getElementById("ld-pct");
  if (!loader) return;

  requestAnimationFrame(() => { bar.style.width = "100%"; });

  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(p + Math.random() * 14, 100);
    pct.textContent = Math.floor(p) + "%";
    if (p >= 100) clearInterval(tick);
  }, 70);

  const hide = () => setTimeout(() => {
    loader.classList.add("out");
    setTimeout(() => loader.remove(), 900);
  }, 800);

  document.readyState === "complete" ? hide() : window.addEventListener("load", hide);
})();

/* ── 3. CUSTOM CURSOR ───────────────────────────── */
(function () {
  const dot  = document.getElementById("cur-dot");
  const ring = document.getElementById("cur-ring");
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top  = my + "px";
  });

  (function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + "px";
    ring.style.top  = ry + "px";
    requestAnimationFrame(animRing);
  })();

  // Enlarge dot on hover
  document.addEventListener("mouseover", e => {
    if (e.target.closest("a,button,[data-tilt]")) dot.style.width = dot.style.height = "10px";
  });
  document.addEventListener("mouseout", e => {
    if (e.target.closest("a,button,[data-tilt]")) dot.style.width = dot.style.height = "";
  });
})();

/* ── 4. LANGUAGE TOGGLE (EN ↔ AR) ──────────────── */
(function () {
  const langBtn   = document.getElementById("lang-btn");
  const langLabel = document.getElementById("lang-label");
  const html      = document.documentElement;
  if (!langBtn) return;

  let current = "en";

  // All nodes that carry data-en / data-ar
  function applyLang(lang) {
    current = lang;
    html.setAttribute("data-lang", lang);
    html.setAttribute("lang",      lang);
    html.setAttribute("dir",       lang === "ar" ? "rtl" : "ltr");

    // Toggle label
    langLabel.textContent = lang === "ar" ? "EN" : "عربي";

    // Translate every element with data-en / data-ar
    document.querySelectorAll("[data-en],[data-ar]").forEach(el => {
      const text = el.getAttribute("data-" + lang);
      if (!text) return;

      // If it contains HTML tags use innerHTML, else textContent
      if (text.includes("<") || text.includes("&")) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    // Translate input placeholders
    const placeholders = {
      en: { "cf-name": "Your name", "cf-email": "your@email.com", "cf-subj": "What's this about?", "cf-msg": "Tell me about your project..." },
      ar: { "cf-name": "اسمك", "cf-email": "بريدك@الإلكتروني.com", "cf-subj": "موضوع رسالتك؟", "cf-msg": "أخبرني عن مشروعك..." },
    };
    const ph = placeholders[lang];
    Object.entries(ph).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.placeholder = val;
    });

    // Page title
    document.title = lang === "ar"
      ? "عبد الرحمن محي الدين — بورتفوليو"
      : "Abdo Mohy — Portfolio";

    // Animate the toggle button
    langBtn.style.transform = "scale(0.88)";
    setTimeout(() => { langBtn.style.transform = ""; }, 250);

    // Flash hero name briefly
    flashElement(document.querySelector(".hero-name"));

    // Save preference
    try { localStorage.setItem("lang", lang); } catch(e) {}
  }

  function flashElement(el) {
    if (!el) return;
    el.style.transition = "opacity .2s";
    el.style.opacity = "0";
    setTimeout(() => { el.style.opacity = ""; el.style.transition = ""; }, 200);
  }

  langBtn.addEventListener("click", () => {
    applyLang(current === "en" ? "ar" : "en");
  });

  // Restore saved preference
  try {
    const saved = localStorage.getItem("lang");
    if (saved && saved !== "en") applyLang(saved);
  } catch(e) {}
})();

/* ── 5. NAVIGATION ──────────────────────────────── */
(function () {
  const navbar   = document.getElementById("navbar");
  const burger   = document.getElementById("burger");
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll("[data-nav]");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", scrollY > 60);

    let cur = "";
    sections.forEach(s => { if (scrollY >= s.offsetTop - 130) cur = s.id; });
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
  }, { passive: true });

  if (burger) {
    burger.addEventListener("click", () => {
      const open = navbar.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll(".nav-links a").forEach(a =>
    a.addEventListener("click", () => {
      navbar.classList.remove("open");
      burger && burger.setAttribute("aria-expanded", "false");
    })
  );
})();

/* ── 6. HERO CANVAS ─────────────────────────────── */
(function () {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, particles;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  /* ── Particle ── */
  class Particle {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.z  = Math.random();           // pseudo-depth
      this.vx = (Math.random() - .5) * .35;
      this.vy = (Math.random() - .5) * .35;
      this.r  = this.z * 1.8 + .25;
      this.a  = this.z * .55 + .05;
      this.kind = Math.random();         // 0-0.55 = blue, 0.55-0.75 = cyan, rest = dim
    }
    update() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < 130) {
        const f = (130 - d) / 130 * .9;
        this.vx += (dx / d) * f;
        this.vy += (dy / d) * f;
      }
      this.vx *= .975; this.vy *= .975;
      this.x += this.vx * (this.z + .2);
      this.y += this.vy * (this.z + .2);
      if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
    }
    draw() {
      let color;
      if      (this.kind < .55) color = `rgba(37,99,235,${this.a})`;
      else if (this.kind < .75) color = `rgba(6,182,212,${this.a * .65})`;
      else                       color = `rgba(241,245,255,${this.a * .3})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  /* ── Connections ── */
  function drawLines() {
    const max = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < max) {
          const op = (1 - d / max) * .13;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(37,99,235,${op})`;
          ctx.lineWidth   = .6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* ── Floating 3-D rings ── */
  const rings = Array.from({ length: 6 }, () => ({
    x: Math.random(), y: Math.random(),
    r: 25 + Math.random() * 70,
    vx: (Math.random() - .5) * .12,
    vy: (Math.random() - .5) * .12,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - .5) * .007,
    squash: Math.random() * .45 + .2,   // perspective
    a: Math.random() * .09 + .02,
    hue: Math.random() > .5,            // blue or cyan
  }));

  function drawRings() {
    rings.forEach(r => {
      r.x += r.vx / W; r.y += r.vy / H;
      r.rot += r.rotV;
      if (r.x < 0 || r.x > 1) r.vx *= -1;
      if (r.y < 0 || r.y > 1) r.vy *= -1;
      ctx.save();
      ctx.translate(r.x * W, r.y * H);
      ctx.rotate(r.rot);
      ctx.scale(1, r.squash);
      ctx.beginPath();
      ctx.ellipse(0, 0, r.r, r.r, 0, 0, Math.PI * 2);
      ctx.strokeStyle = r.hue
        ? `rgba(37,99,235,${r.a})`
        : `rgba(6,182,212,${r.a})`;
      ctx.lineWidth = .8;
      ctx.stroke();
      ctx.restore();
    });
  }

  /* ── Shooting stars ── */
  const stars = [];
  function spawnStar() {
    stars.push({ x: Math.random() * W, y: 0, len: 60 + Math.random() * 80, speed: 4 + Math.random() * 4, a: .8, angle: Math.PI / 4 + (Math.random() - .5) * .3 });
  }
  setInterval(spawnStar, 2800);

  function drawStars() {
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.a -= .016;
      if (s.a <= 0) { stars.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.strokeStyle = `rgba(6,182,212,${s.a})`;
      ctx.lineWidth = 1.5;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
      ctx.stroke();
    }
  }

  function init() {
    particles = Array.from({ length: Math.floor(W * H / 7000) }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawRings();
    drawStars();
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }

  document.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  document.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

  window.addEventListener("resize", () => { resize(); init(); });
  resize(); init(); loop();
})();

/* ── 7. PARALLAX TILT ON PHOTO ──────────────────── */
(function () {
  const frame = document.getElementById("photo-frame");
  if (!frame) return;

  document.addEventListener("mousemove", e => {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    frame.style.transform = `perspective(900px) rotateY(${dx * 6}deg) rotateX(${-dy * 5}deg)`;
  });
  document.addEventListener("mouseleave", () => { frame.style.transform = ""; });
})();

/* ── 8. SCROLL REVEAL ───────────────────────────── */
(function () {
  const els = document.querySelectorAll(".reveal-up,.reveal-left,.reveal-right");
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("vis");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .08 });

  els.forEach(el => obs.observe(el));
})();

/* ── 9. CARD TILT ───────────────────────────────── */
(function () {
  document.querySelectorAll("[data-tilt]").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(700px) rotateY(${dx * 9}deg) rotateX(${-dy * 9}deg) scale3d(1.025,1.025,1.025)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
})();

/* ── 10. MAGNETIC BUTTONS ───────────────────────── */
(function () {
  document.querySelectorAll(".btn-primary,.btn-secondary,.lang-toggle,.btt").forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * .26;
      const dy = (e.clientY - r.top  - r.height / 2) * .26;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
})();

/* ── 11. CONTACT FORM (EmailJS) ─────────────────── */
(function () {
  const form   = document.getElementById("contact-form");
  const btn    = document.getElementById("form-btn");
  const lbl    = document.getElementById("form-lbl");
  const ok     = document.getElementById("form-ok");
  const err    = document.getElementById("form-err");
  const isAR   = () => document.documentElement.getAttribute("data-lang") === "ar";
  if (!form) return;

  const T = {
    sending: { en: "Sending…",  ar: "جارٍ الإرسال…" },
    sent:    { en: "Sent ✓",    ar: "تم الإرسال ✓"  },
    retry:   { en: "Try Again", ar: "حاول مجدداً"    },
    idle:    { en: "Send Message", ar: "إرسال الرسالة" },
  };

  function setLbl(key) {
    const lang = isAR() ? "ar" : "en";
    lbl.textContent = T[key][lang];
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    ok.hidden = err.hidden = true;

    if (!form.checkValidity()) { form.reportValidity(); return; }

    btn.disabled = true; setLbl("sending");

    const params = {
      from_name:  form.querySelector('[name="from_name"]').value.trim(),
      from_email: form.querySelector('[name="from_email"]').value.trim(),
      subject:    form.querySelector('[name="subject"]').value.trim(),
      message:    form.querySelector('[name="message"]').value.trim(),
      to_email:   "mhyaldynbdalrhmn1@gmail.com",
    };

    /* Dev mode guard */
    if (EJ_KEY === "YOUR_PUBLIC_KEY") {
      console.warn(
        "[EmailJS] Keys not set. Edit main.js → EJ_KEY / EJ_SERVICE / EJ_TEMPLATE.\n" +
        "See instructions at the top of main.js."
      );
      setTimeout(() => { setLbl("sent"); ok.hidden = false; form.reset(); btn.disabled = false; }, 900);
      return;
    }

    try {
      await emailjs.send(EJ_SERVICE, EJ_TEMPLATE, params);
      setLbl("sent"); ok.hidden = false; form.reset();
      setTimeout(() => { setLbl("idle"); }, 4000);
    } catch (ex) {
      console.error("[EmailJS]", ex);
      setLbl("retry"); err.hidden = false;
      setTimeout(() => { setLbl("idle"); err.hidden = true; }, 4000);
    } finally {
      btn.disabled = false;
    }
  });
})();

/* ── 12. BACK TO TOP ────────────────────────────── */
(function () {
  const btn = document.getElementById("btt");
  if (!btn) return;
  window.addEventListener("scroll", () => btn.classList.toggle("show", scrollY > 500), { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
