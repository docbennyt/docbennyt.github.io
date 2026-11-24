(() => {
  "use strict";
  const hero = document.getElementById("home");
  const about = document.getElementById("about");
  if (!hero || !about) return;

  const links = [...document.querySelectorAll(".header a[href='#home'], .header a[href='#about']")];
  let active = "";
  let pending = false;

  function updateNavigation() {
    pending = false;
    // Change the active icon when the next chapter crosses the viewport midpoint.
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
    if (!pending) {
      pending = true;
      window.requestAnimationFrame(updateNavigation);
    }
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("pageshow", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  updateNavigation();


  // A cinematic cut, not a new content section or a scroll hijacker.
  // All text and anchors remain usable if either CDN script fails.
  function setupCinematicMotion() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 992px) and (min-height: 480px) and (prefers-reduced-motion: no-preference)", () => {
      document.body.classList.add("has-cinematic-motion");
      const portrait = hero.querySelector(".bg");
      const copy = hero.querySelector(".home-details > div");
      const glow = hero.querySelector(".color-block");
      const title = about.querySelector(".title-section h2");
      const backdropTitle = about.querySelector(".title-bg");
      const aboutPortrait = about.querySelector(".about-portrait-wrap");
      const aboutIdentity = about.querySelector(".about-identity");

      // Keep the outgoing frame in place while the opaque next scene
      // travels up over it. Do not animate the pinned node itself.
      const cut = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "bottom bottom",
          end: () => "+=" + Math.max(1, window.innerHeight),
          pin: true,
          pinSpacing: false,
          scrub: 0.32,
          invalidateOnRefresh: true
        }
      });
      cut.to(portrait, { scale: 0.91, x: -22, y: -18, opacity: 0.48, duration: 1 }, 0)
         .to(copy, { y: -72, scale: 0.96, opacity: 0.22, duration: 0.86 }, 0)
         .to(glow, { opacity: 0.08, duration: 0.8 }, 0)
         .fromTo(about, { borderTopLeftRadius: 36, borderTopRightRadius: 36 },
           { borderTopLeftRadius: 0, borderTopRightRadius: 0, duration: 0.85 }, 0.08)
         .fromTo(title, { y: 76, opacity: 0.35, clipPath: "inset(0 0 70% 0)" },
           { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", ease: "power2.out", duration: 0.64 }, 0.24)
         .fromTo(backdropTitle, { opacity: 0 }, { opacity: 1, duration: 0.42 }, 0.46)
         .fromTo(aboutPortrait, { y: 38, scale: 0.965 },
           { y: 0, scale: 1, ease: "power2.out", duration: 0.45 }, 0.55)
         .fromTo(aboutIdentity, { y: 46, opacity: 0.65 },
           { y: 0, opacity: 1, ease: "power2.out", duration: 0.42 }, 0.58);

      // Keyboard focus must never be left in a visually covered scene.
      const restoreHeroOnFocus = () => {
        if (about.getBoundingClientRect().top <= 0) {
          const start = cut.scrollTrigger.start;
          window.scrollTo({ top: Math.max(0, start), behavior: "instant" });
        }
      };
      hero.addEventListener("focusin", restoreHeroOnFocus);
      return () => {
        document.body.classList.remove("has-cinematic-motion");
        hero.removeEventListener("focusin", restoreHeroOnFocus);
      };
    });

    mm.add("(max-width: 991px) and (prefers-reduced-motion: no-preference), (max-height: 479px) and (prefers-reduced-motion: no-preference)", () => {
      // Smaller screens retain touch-native scrolling and receive a shorter
      // mask reveal rather than pinning a hero that may exceed the viewport.
      const title = about.querySelector(".title-section h2");
      const portrait = about.querySelector(".about-portrait-wrap");
      const identity = about.querySelector(".about-identity");
      gsap.fromTo(title,
        { y: 32, clipPath: "inset(0 0 65% 0)" },
        { y: 0, clipPath: "inset(0 0 0% 0)", ease: "none",
          scrollTrigger: { trigger: about, start: "top 94%", end: "top 42%", scrub: 0.22 } });
      for (const part of [portrait, identity]) {
        gsap.fromTo(part, { y: 24, opacity: 0.72 },
          { y: 0, opacity: 1, ease: "none",
            scrollTrigger: { trigger: part, start: "top 94%", end: "top 62%", scrub: 0.22 } });
      }
    });
    // Fonts can affect section measurements after the first render.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener("pageshow", () => ScrollTrigger.refresh());
  }

  setupCinematicMotion();

  // Only request the third-party credential embed when the reader opens it.
  const proof = about.querySelector(".credly-proof");
  let embedRequested = false;
  if (proof) proof.addEventListener("toggle", () => {
    if (!proof.open || embedRequested) return;
    embedRequested = true;
    const script = document.createElement("script");
    script.src = "https://cdn.credly.com/assets/utilities/embed.js";
    script.async = true;
    script.addEventListener("error", () => { embedRequested = false; script.remove(); });
    document.head.appendChild(script);
  });
})();
