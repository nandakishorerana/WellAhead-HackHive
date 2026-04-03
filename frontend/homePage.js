(function () {
  "use strict";

  const header = document.querySelector("header");
  const navbar = document.querySelector("header .navbar");
  const menuBtn = document.getElementById("menuBars");
  const contactForm = document.getElementById("contactForm");

  function toggleMenu() {
    if (!navbar || !menuBtn) return;
    navbar.classList.toggle("nav-toggle");
    const isOpen = navbar.classList.contains("nav-toggle");
    menuBtn.classList.toggle("fa-bars", !isOpen);
    menuBtn.classList.toggle("fa-times", isOpen);
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  if (menuBtn && navbar) {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
    menuBtn.addEventListener("click", toggleMenu);
    menuBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    });

    navbar.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 768px)").matches) {
          navbar.classList.remove("nav-toggle");
          menuBtn.classList.add("fa-bars");
          menuBtn.classList.remove("fa-times");
        }
      });
    });
  }

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("header-active", window.scrollY > 40);
  });

  /* Scroll-triggered fade-in */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealEls.length && !reduceMotion) {
    revealEls.forEach((el) => {
      const parent = el.closest(".box-container");
      if (parent) {
        const siblings = [...parent.children].filter((c) => c.hasAttribute("data-reveal"));
        const i = siblings.indexOf(el);
        if (i >= 0) el.setAttribute("data-reveal-delay", String(Math.min(i, 5)));
      }
    });

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Hero image subtle parallax on frame (keeps img hover scale in CSS) */
  const heroFrame = document.querySelector(".home .image-frame");
  if (heroFrame && !reduceMotion) {
    window.addEventListener(
      "scroll",
      () => {
        const home = document.querySelector(".home");
        if (!home) return;
        const rect = home.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const p = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
        heroFrame.style.transform = `translateY(${p * 10}px)`;
      },
      { passive: true }
    );
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector(".submit-btn");
      const prev = btn ? btn.textContent : "";
      if (btn) {
        btn.textContent = "Sent!";
        btn.disabled = true;
      }
      window.setTimeout(() => {
        if (btn) {
          btn.textContent = prev;
          btn.disabled = false;
        }
        contactForm.reset();
      }, 1800);
    });
  }
})();