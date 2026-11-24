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
