(() => {
  "use strict";
  const island = document.querySelector("[data-visitor-island]");
  if (!island) return;
  const greeting = island.querySelector("[data-local-greeting]");
  const periodIcon = island.querySelector("[data-local-period-icon]");
  const timeNode = island.querySelector("[data-local-time]");
  const dateNode = island.querySelector("[data-local-date]");
  const zoneNode = island.querySelector("[data-local-zone]");
  const details = island.querySelector("#visitor-island-details");
  const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  const dateFormatter = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Your local time";
  function getGreeting(hour) {
    if (hour >= 5 && hour < 12) return { text: "Good morning", icon: "☀️" };
    if (hour >= 12 && hour < 17) return { text: "Good afternoon", icon: "🌤️" };
    if (hour >= 17 && hour < 24) return { text: "Good evening", icon: "🌙" };
    return { text: "Hello, night owl", icon: "🌌" };
  }
  function update() {
    const now = new Date();
    const phrase = getGreeting(now.getHours());
    const localTime = timeFormatter.format(now);
    greeting.textContent = phrase.text;
    periodIcon.textContent = phrase.icon;
    timeNode.textContent = localTime;
    timeNode.dateTime = now.toISOString();
    dateNode.textContent = dateFormatter.format(now);
    zoneNode.textContent = timeZone.replace(/_/g, " ");
    island.setAttribute("aria-label", "Hey. " + phrase.text + ". Your local time is " + localTime + ". Activate to see the date and time zone.");
  }
  function setExpanded(expanded) {
    island.setAttribute("aria-expanded", String(expanded));
    details.hidden = !expanded;
    island.classList.toggle("is-expanded", expanded);
  }
  island.addEventListener("click", () => setExpanded(island.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("click", event => {
    if (!island.contains(event.target)) setExpanded(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && island.getAttribute("aria-expanded") === "true") {
      setExpanded(false);
      island.focus();
    }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) update(); });
  update();
  window.setInterval(update, 30000);
})();
