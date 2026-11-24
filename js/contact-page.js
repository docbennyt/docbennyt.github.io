(() => {
  "use strict";
  const menuToggle = document.getElementById("menu-toggle-input");
  if (menuToggle) {
    menuToggle.addEventListener("change", function () {
      this.setAttribute("aria-expanded", String(this.checked));
    });
  }

  const emailMasked = document.getElementById("contact-email-masked");
  if (emailMasked) {
    const originalText = emailMasked.textContent.trim();
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      const link = document.createElement("a");
      link.href = "mailto:dr.bennyt.09@gmail.com";
      link.textContent = "dr.bennyt.09@gmail.com";
      link.style.color = "inherit";
      link.style.textDecoration = "none";
      emailMasked.replaceChildren(link);
      emailMasked.classList.remove("ds-email-reveal");
      emailMasked.classList.add("ds-email-revealed");
    };
    const conceal = () => {
      if (!revealed || document.activeElement === emailMasked) return;
      revealed = false;
      emailMasked.textContent = originalText;
      emailMasked.classList.remove("ds-email-revealed");
      emailMasked.classList.add("ds-email-reveal");
    };
    emailMasked.addEventListener("mouseenter", reveal);
    emailMasked.addEventListener("mouseleave", conceal);
    emailMasked.addEventListener("click", reveal);
    emailMasked.addEventListener("focus", reveal);
    emailMasked.addEventListener("blur", () => {
      if (revealed) {
        emailMasked.textContent = originalText;
        emailMasked.classList.remove("ds-email-revealed");
        emailMasked.classList.add("ds-email-reveal");
        revealed = false;
      }
    });
  }

  const toastContainer = document.getElementById("toast-container");
  function showToast(message, type) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "ds-toast ds-toast--" + (type || "info");
    const icon = document.createElement("i");
    icon.className = "fa " + (type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-triangle" : "fa-info-circle");
    icon.setAttribute("aria-hidden", "true");
    const content = document.createElement("div");
    content.className = "ds-toast__content";
    content.textContent = message;
    toast.append(icon, content);
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    window.setTimeout(() => {
      toast.classList.remove("show");
      window.setTimeout(() => toast.remove(), 400);
    }, 5200);
  }

  const form = document.getElementById("contact-form");
  if (!form) return;
  const submitButton = document.getElementById("cf-submit");
  const submitText = submitButton && submitButton.querySelector(".button-text");
  const status = document.getElementById("cf-status");
  const originalButtonText = submitText ? submitText.textContent : "Send Message";

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (submitButton) submitButton.disabled = true;
    form.setAttribute("aria-busy", "true");
    if (submitText) submitText.textContent = "Sending...";
    if (status) status.textContent = "";

    try {
      const response = await fetch("https://formspree.io/f/mljeporj", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = Array.isArray(payload.errors) ? payload.errors.map(item => item.message).filter(Boolean).join(" ") : "";
        throw new Error(details || "The form service could not accept the message.");
      }
      form.reset();
      const success = "Message sent. Thank you for reaching out — I'll get back to you as soon as I can.";
      if (status) status.textContent = success;
      showToast("Message sent successfully.", "success");
    } catch (error) {
      const failure = "Your message could not be sent just now. Please try again or email dr.bennyt.09@gmail.com.";
      if (status) status.textContent = failure;
      showToast(failure, "error");
    } finally {
      if (submitButton) submitButton.disabled = false;
      form.removeAttribute("aria-busy");
      if (submitText) submitText.textContent = originalButtonText;
    }
  });
})();
