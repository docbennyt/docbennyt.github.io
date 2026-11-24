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


  // Short, scroll-linked cinematic dissolve. No pinned clones, masks or hidden copy.
  function setupCinematicMotion() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const desktop = window.matchMedia("(min-width: 992px)").matches;
      const portrait = hero.querySelector(desktop ? ".bg" : ".main-img-mobile");
      const copy = hero.querySelector(".home-details > div");
      const title = about.querySelector(".title-section h2");
      const backdropTitle = about.querySelector(".title-bg");
      const incoming = about.querySelector(".about-hero");
      // Only inner elements move. The two sections retain their real heights.
      gsap.timeline({defaults:{ease:"none"},scrollTrigger:{
        trigger:hero,start:"bottom 92%",end:"bottom 5%",scrub:0.24,invalidateOnRefresh:true
      }})
        .to(portrait,{scale:0.97,y:desktop?24:8,opacity:0.83,duration:1},0)
        .to(copy,{y:desktop?-18:-8,opacity:0.85,duration:1},0);
      gsap.timeline({defaults:{ease:"none"},scrollTrigger:{
        trigger:about,start:"top 94%",end:"top 15%",scrub:0.24,invalidateOnRefresh:true
      }})
        .fromTo(title,{y:desktop?24:14,opacity:0.7},{y:0,opacity:1,duration:1},0)
        .fromTo(backdropTitle,{opacity:0.3},{opacity:1,duration:1},0)
        .fromTo(incoming,{y:desktop?16:10},{y:0,duration:0.9},0.1);
      return () => {};
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
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
