/* Cal.com inline embed inside an accessible, on-page booking dialog. */
(() => {
  "use strict";
  (function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal;
      let ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else {
          p(cal, ar);
        }
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");

  const modal = document.getElementById("cal-booking-modal");
  const dialog = modal && modal.querySelector(".cal-booking-dialog");
  const inline = document.getElementById("cal-booking-inline");
  const status = document.getElementById("cal-booking-status");
  const fallback = document.getElementById("cal-booking-fallback");
  const openers = [...document.querySelectorAll("[data-open-booking]")];
  if (!modal || !dialog || !inline || !openers.length) return;

  let mounted = false;
  let calInitialized = false;
  let lastTrigger = null;
  function showFallback(message) {
    if (status) status.textContent = message;
    if (fallback) fallback.hidden = false;
  }
  function mountCalendar() {
    if (mounted) return;
    mounted = true;
    if (!window.Cal) {
      showFallback("The booking calendar could not load here. You can open the secure Cal.com booking page instead.");
      return;
    }
    try {
      if (!calInitialized) {
        Cal("init", "30min", { origin: "https://app.cal.com" });
        Cal.config = Cal.config || {};
        Cal.config.forwardQueryParams = true;
        Cal.ns["30min"]("ui", {
          hideEventTypeDetails: false,
          layout: "month_view",
          theme: "light",
        });
        calInitialized = true;
      }
      Cal("on", {
        action: "linkReady",
        callback: () => { if (status) status.textContent = "Choose a date and an available time below."; }
      });
      Cal("on", {
        action: "linkFailed",
        callback: () => showFallback("Cal.com could not load the calendar. Open the booking page in a new tab instead.")
      });
      const observer = new MutationObserver(() => {
        if (inline.querySelector("iframe")) {
          if (status) status.textContent = "Choose a date and an available time below.";
          if (fallback) fallback.hidden = true;
          observer.disconnect();
        }
      });
      observer.observe(inline, { childList: true, subtree: true });
      Cal("inline", {
        elementOrSelector: "#cal-booking-inline",
        calLink: "benedictus-makuyana/30min",
        config: {
          layout: "month_view",
          theme: "light",
          useSlotsViewOnSmallScreen: true
        }
      });
      window.setTimeout(() => {
        if (!inline.querySelector("iframe") && fallback && fallback.hidden) {
          showFallback("The calendar is taking longer than expected. You can also open the booking page directly.");
        }
      }, 12000);
    } catch (_) {
      showFallback("The booking calendar could not load here. You can open the secure Cal.com booking page instead.");
    }
  }
  function openModal(trigger) {
    lastTrigger = trigger;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("cal-booking-open");
    mountCalendar();
    window.requestAnimationFrame(() => {
      const close = dialog.querySelector("[data-close-booking]");
      if (close) close.focus();
      else dialog.focus();
    });
  }
  function closeModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cal-booking-open");
    if (lastTrigger) lastTrigger.focus();
  }
  openers.forEach(trigger => trigger.addEventListener("click", event => {
    event.preventDefault();
    openModal(trigger);
  }));
  modal.addEventListener("click", event => {
    if (event.target === modal || event.target.closest("[data-close-booking]")) closeModal();
  });
  document.addEventListener("keydown", event => {
    if (modal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]),a[href],iframe,[tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.hidden && el.getClientRects().length);
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
})();
