(() => {
  "use strict";
  const hero = document.getElementById("home");
  const about = document.getElementById("about");
  if (!hero || !about) return;
  const links = [...document.querySelectorAll(".header a[href='#home'], .header a[href='#about']")];
  let active = "", pending = false;
  function updateNavigation() {
    pending = false;
    const section = about.getBoundingClientRect().top <= window.innerHeight * 0.5 ? "about" : "home";
    if (section === active) return;
    active = section;
    for (const link of links) {
      const current = link.hash === "#" + section;
      link.closest("li").classList.toggle("active", current);
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }
  function scheduleUpdate() {
    if (!pending) { pending = true; requestAnimationFrame(updateNavigation); }
  }
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("pageshow", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  updateNavigation();

  // No motion-library downloads for mobile, touch-primary or reduced-motion visits.
  const desktopMotion = window.matchMedia("(min-width: 992px) and (min-height: 480px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  let loading = false, installed = false;
  const loadScript = url => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => { script.remove(); reject(new Error("Motion library unavailable")); };
    document.head.appendChild(script);
  });
  function setupCinematicMotion() {
    if (installed || !window.gsap || !window.ScrollTrigger) return;
    installed = true;
    const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add(desktopMotion.media, () => {
      const portrait = hero.querySelector(".bg");
      const copy = hero.querySelector(".home-details > div");
      const title = about.querySelector(".title-section h2");
      const backdropTitle = about.querySelector(".title-bg");
      const incoming = about.querySelector(".about-hero");
      // Animate inner elements only. No pin spacers, duplicate content, wheel
      // handlers or hidden sections. About enters on its own opaque surface.
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        trigger: hero, start: "bottom 92%", end: "bottom 5%", scrub: 0.22, invalidateOnRefresh: true
      } })
        .to(portrait, { scale: 0.93, y: 42, opacity: 0.60, duration: 1 }, 0)
        .to(copy, { y: -38, opacity: 0.68, duration: 1 }, 0);
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        trigger: about, start: "top 96%", end: "top 12%", scrub: 0.22, invalidateOnRefresh: true
      } })
        .fromTo(title, { y: 36, opacity: 0.55 }, { y: 0, opacity: 1, duration: 1 }, 0)
        .fromTo(backdropTitle, { opacity: 0.3 }, { opacity: 1, duration: 1 }, 0)
        .fromTo(incoming, { y: 24 }, { y: 0, duration: 0.9 }, 0.1);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("pageshow", () => ScrollTrigger.refresh());
  }
  async function maybeLoadMotion() {
    if (!desktopMotion.matches || loading || installed) return;
    loading = true;
    try {
      if (!window.gsap) await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js");
      if (!desktopMotion.matches) return;
      if (!window.ScrollTrigger) await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js");
      setupCinematicMotion();
    } catch (_) {
      // Site content and navigation remain fully functional without motion.
    } finally { loading = false; }
  }
  if (desktopMotion.addEventListener) desktopMotion.addEventListener("change", maybeLoadMotion);
  else desktopMotion.addListener(maybeLoadMotion);
  if (document.readyState === "complete") maybeLoadMotion();
  else window.addEventListener("load", maybeLoadMotion, { once: true });
})();
