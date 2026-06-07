/**
 * ABDO MOHY — PORTFOLIO · main.js
 * ─────────────────────────────────────────────────────────────────
 * Modules:
 *  1. EmailJS — initialise & send real emails
 *  2. Loader
 *  3. Custom cursor
 *  4. Navigation (scroll, burger, active-link)
 *  5. Particle + ring canvas (hero background)
 *  6. 3-D parallax tilt on hero photo
 *  7. Scroll-reveal (IntersectionObserver)
 *  8. Card tilt (skills cards)
 *  9. Magnetic buttons
 * 10. Contact form with EmailJS
 * 11. Back-to-top button
 * ─────────────────────────────────────────────────────────────────
 *
 * HOW TO ENABLE REAL EMAIL DELIVERY (EmailJS)
 * ─────────────────────────────────────────────
 * 1. Create a FREE account at https://www.emailjs.com
 * 2. Add an Email Service (Gmail → connect your Gmail account)
 * 3. Create an Email Template with these variables:
 *      {{from_name}}  {{from_email}}  {{subject}}  {{message}}
 *    Set "To Email" in the template to: mhyaldynbdalrhmn1@gmail.com
 * 4. Copy your:
 *      - Public Key   (Account → API Keys)
 *      - Service ID   (Email Services → your service)
 *      - Template ID  (Email Templates → your template)
 * 5. Paste them into the three constants below.
 * ─────────────────────────────────────────────────────────────────
 */

"use strict";

/* ═══════════════════════════════════════════════════════════════════
   1.  EMAILJS CONFIG
═══════════════════════════════════════════════════════════════════ */
const EMAILJS_PUBLIC_KEY  = "TDEv_aebZc2gHLgB4";   // ← paste here
const EMAILJS_SERVICE_ID  = "service_h4c92rg";   // ← paste here
const EMAILJS_TEMPLATE_ID = "template_vunwgrd";  // ← paste here

// Initialise EmailJS with your public key
if (typeof emailjs !== "undefined") {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

/* ═══════════════════════════════════════════════════════════════════
   2.  LOADER
═══════════════════════════════════════════════════════════════════ */
(function initLoader() {
  const loaderEl = document.getElementById("loader");
  const fillEl   = document.getElementById("ld-fill");
  const pctEl    = document.getElementById("ld-pct");
  if (!loaderEl) return;

  let progress = 0;

  // Start fill bar
  requestAnimationFrame(() => { fillEl.style.width = "100%"; });

  // Animate percentage counter
  const tick = setInterval(() => {
    progress = Math.min(progress + Math.random() * 13, 100);
    pctEl.textContent = Math.floor(progress) + "%";
    if (progress >= 100) clearInterval(tick);
  }, 75);

  // Hide after page loads (min 900ms for effect)
  const hide = () => {
    setTimeout(() => {
      loaderEl.classList.add("out");
      setTimeout(() => loaderEl.remove(), 900);
    }, 900);
  };

  if (document.readyState === "complete") { hide(); }
  else { window.addEventListener("load", hide); }
})();

/* ═══════════════════════════════════════════════════════════════════
   3.  CUSTOM CURSOR
═══════════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById("cur-dot");
  const ring = document.getElementById("cur-ring");
  if (!dot || !ring) return;

  let mx = 0, my = 0; // mouse
  let rx = 0, ry = 0; // ring (lagged)

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top  = my + "px";
  });

  // Smooth trailing ring
  (function animateRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + "px";
    ring.style.top  = ry + "px";
    requestAnimationFrame(animateRing);
  })();

  // Enlarge dot on clickable hover
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest("a, button, [data-tilt]");
    if (el) {
      dot.style.width  = "10px";
      dot.style.height = "10px";
    }
  });
  document.addEventListener("mouseout", (e) => {
    const el = e.target.closest("a, button, [data-tilt]");
    if (el) {
      dot.style.width  = "";
      dot.style.height = "";
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   4.  NAVIGATION
═══════════════════════════════════════════════════════════════════ */
(function initNav() {
  const navbar = document.getElementById("navbar");
  const burger = document.getElementById("nav-burger");
  const links  = document.querySelectorAll("[data-nav]");
  if (!navbar) return;

  /* ── Scroll: add .scrolled class & highlight active link ── */
  const sections = document.querySelectorAll("section[id]");

  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 60);

    // Active nav link
    let current = "";
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.id;
      }
    });
    links.forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("active", href === "#" + current);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run on load

  /* ── Burger: mobile menu toggle ── */
  if (burger) {
    burger.addEventListener("click", () => {
      const isOpen = navbar.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* ── Close mobile menu on link click ── */
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.addEventListener("click", () => {
      navbar.classList.remove("open");
      if (burger) burger.setAttribute("aria-expanded", "false");
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   5.  HERO CANVAS — Particles + Floating Rings
═══════════════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, particles;
  let mouse = { x: -9999, y: -9999 };

  /* Resize */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  /* ── Particle class ── */
  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.z     = Math.random();            // depth 0..1 (simulates 3-D)
      this.vx    = (Math.random() - 0.5) * 0.35;
      this.vy    = (Math.random() - 0.5) * 0.35;
      this.r     = this.z * 1.8 + 0.2;
      this.alpha = this.z * 0.55 + 0.05;
      this.color = Math.random() > 0.45;     // true = blue, false = cyan
    }

    update() {
      // Mouse repulsion
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        const force = (130 - dist) / 130 * 0.85;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      // Dampen velocity
      this.vx *= 0.97;
      this.vy *= 0.97;

      // Move (closer/larger = faster)
      this.x += this.vx * (this.z + 0.18);
      this.y += this.vy * (this.z + 0.18);

      // Wrap
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color
        ? `rgba(0, 85, 255, ${this.alpha})`
        : `rgba(0, 212, 255, ${this.alpha * 0.55})`;
      ctx.fill();
    }
  }

  /* ── Connection lines between close particles ── */
  function drawConnections() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const opacity = (1 - d / maxDist) * 0.13;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 85, 255, ${opacity})`;
          ctx.lineWidth   = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* ── Floating orbit rings (3-D simulation) ── */
  const rings = Array.from({ length: 5 }, () => ({
    x:    Math.random(),
    y:    Math.random(),
    r:    28 + Math.random() * 68,
    vx:   (Math.random() - 0.5) * 0.12,
    vy:   (Math.random() - 0.5) * 0.12,
    rot:  Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.008,
    tilt: Math.random() * 0.4 + 0.2,  // y-scale (perspective squash)
    a:    Math.random() * 0.1 + 0.03,
  }));

  function drawRings() {
    rings.forEach((ring) => {
      ring.x   += ring.vx / W;
      ring.y   += ring.vy / H;
      ring.rot += ring.rotV;
      if (ring.x < 0 || ring.x > 1) ring.vx *= -1;
      if (ring.y < 0 || ring.y > 1) ring.vy *= -1;

      const cx = ring.x * W;
      const cy = ring.y * H;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.rot);
      ctx.scale(1, ring.tilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.r, ring.r, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 85, 255, ${ring.a})`;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
      ctx.restore();
    });
  }

  /* ── Init & loop ── */
  function init() {
    const count = Math.floor((W * H) / 7000);
    particles   = Array.from({ length: count }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawRings();
    particles.forEach((p) => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }

  /* Mouse tracking (relative to canvas) */
  document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x    = e.clientX - rect.left;
    mouse.y    = e.clientY - rect.top;
  });
  document.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener("resize", () => { resize(); init(); });
  resize();
  init();
  loop();
})();

/* ═══════════════════════════════════════════════════════════════════
   6.  HERO PHOTO — 3-D PARALLAX TILT
═══════════════════════════════════════════════════════════════════ */
(function initParallax() {
  const frame = document.getElementById("hv-frame");
  if (!frame) return;

  document.addEventListener("mousemove", (e) => {
    const cx  = window.innerWidth  / 2;
    const cy  = window.innerHeight / 2;
    const dx  = (e.clientX - cx) / cx;
    const dy  = (e.clientY - cy) / cy;
    frame.style.transform = `perspective(900px) rotateY(${dx * 6}deg) rotateX(${-dy * 5}deg)`;
  });

  document.addEventListener("mouseleave", () => {
    frame.style.transform = "";
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   7.  SCROLL REVEAL
═══════════════════════════════════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll(".reveal, .reveal-x");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("vis");
        }
      });
    },
    { threshold: 0.1 }
  );

  els.forEach((el) => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════════
   8.  CARD TILT (Skills cards)
═══════════════════════════════════════════════════════════════════ */
(function initTilt() {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const dx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      card.style.transform = `perspective(700px) rotateY(${dx * 9}deg) rotateX(${-dy * 9}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   9.  MAGNETIC BUTTONS
═══════════════════════════════════════════════════════════════════ */
(function initMagnetic() {
  const selectors = ".btn-glow, .btn-ghost, .nav-cta, .form-submit";
  document.querySelectorAll(selectors).forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const dx   = (e.clientX - rect.left - rect.width  / 2) * 0.24;
      const dy   = (e.clientY - rect.top  - rect.height / 2) * 0.24;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   10. CONTACT FORM — EmailJS
═══════════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form      = document.getElementById("contact-form");
  const submitBtn = document.getElementById("form-btn");
  const btnLabel  = document.getElementById("form-btn-label");
  const successEl = document.getElementById("form-success");
  const errorEl   = document.getElementById("form-error");

  if (!form) return;

  /* Helper: show / hide feedback messages */
  function showSuccess() {
    successEl.hidden = false;
    errorEl.hidden   = true;
  }
  function showError() {
    errorEl.hidden   = false;
    successEl.hidden = true;
  }
  function hideMessages() {
    successEl.hidden = true;
    errorEl.hidden   = true;
  }

  /* Helper: set button state */
  function setBtnState(state) {
    const states = {
      idle:    { text: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`, disabled: false },
      loading: { text: "Sending…",     disabled: true  },
      success: { text: "Sent ✓",       disabled: false },
      error:   { text: "Try Again",    disabled: false },
    };
    const s = states[state] || states.idle;
    btnLabel.innerHTML   = s.text;
    submitBtn.disabled   = s.disabled;
    submitBtn.style.opacity = s.disabled ? "0.7" : "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessages();

    // Basic HTML5 validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setBtnState("loading");

    // Build the template params from form fields
    const templateParams = {
      from_name:  form.querySelector('[name="from_name"]').value.trim(),
      from_email: form.querySelector('[name="from_email"]').value.trim(),
      subject:    form.querySelector('[name="subject"]').value.trim(),
      message:    form.querySelector('[name="message"]').value.trim(),
      to_email:   "mhyaldynbdalrhmn1@gmail.com",  // always deliver here
    };

    /* ── Guard: warn if keys not configured ── */
    if (
      EMAILJS_PUBLIC_KEY  === "YOUR_PUBLIC_KEY"  ||
      EMAILJS_SERVICE_ID  === "YOUR_SERVICE_ID"  ||
      EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID"
    ) {
      console.warn(
        "[EmailJS] Keys not configured. Open main.js and fill in\n" +
        "EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID.\n" +
        "See the comment block at the top of main.js for instructions."
      );
      // Show a helpful dev message but still "succeed" visually so you
      // can test the rest of the form UX without real keys.
      setBtnState("success");
      showSuccess();
      form.reset();
      return;
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      setBtnState("success");
      showSuccess();
      form.reset();

      // Reset button after 4 s
      setTimeout(() => { setBtnState("idle"); }, 4000);

    } catch (err) {
      console.error("[EmailJS] Send error:", err);
      setBtnState("error");
      showError();

      // Reset button after 4 s
      setTimeout(() => { setBtnState("idle"); hideMessages(); }, 4000);
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   11. BACK-TO-TOP BUTTON
═══════════════════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = document.getElementById("back-top");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("show", window.scrollY > 500);
      btn.hidden = window.scrollY <= 500;
    },
    { passive: true }
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
