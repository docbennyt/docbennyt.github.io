/* Formspree progressive enhancement: normal HTML POST without JavaScript. */
(() => {
  "use strict";
  const menu = document.getElementById("menu-toggle-input");
  if (menu) menu.addEventListener("change", () => menu.setAttribute("aria-expanded", String(menu.checked)));
  const form = document.getElementById("contact-form");
  if (!form || !window.fetch || !window.AbortController) return;
  const byId = id => document.getElementById(id);
  const submit = byId("cf-submit"), label = submit.querySelector(".button-text"), icon = submit.querySelector(".button-icon");
  const notice = byId("cf-notice"), title = byId("cf-notice-title"), detail = byId("cf-notice-detail"), actions = byId("cf-notice-actions");
  const emailLink = byId("cf-email-fallback"), copyButton = byId("cf-copy-message");
  const fields = ["name","email","subject","message"].map(name => ({name, input: byId("cf-"+name), error: byId("cf-"+name+"-error")}));
  let busy = false;
  const recipient = "dr.bennyt.09@gmail.com";
  function draft() {
    const data = new FormData(form);
    return {name: String(data.get("name") || "").trim(), email: String(data.get("email") || "").trim(), subject: String(data.get("subject") || "").trim() || "Portfolio enquiry", message: String(data.get("message") || "").trim()};
  }
  function draftText(d) { return d.message + "\n\nFrom: " + d.name + "\nEmail: " + d.email; }
  function updateFallback() {
    const d = draft();
    emailLink.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(d.subject) + "&body=" + encodeURIComponent(draftText(d));
  }
  function show(state, heading, message, fallback = false) {
    notice.hidden = false; notice.dataset.state = state;
    notice.querySelector(".contact-notice-icon i").className = "fa " + ({sending:"fa-circle-o-notch fa-spin",success:"fa-check-circle",error:"fa-exclamation-circle",warning:"fa-info-circle"}[state] || "fa-info-circle");
    title.textContent = heading; detail.textContent = message;
    actions.hidden = !fallback;
    if (fallback) { updateFallback(); copyButton.textContent = "Copy message"; }
  }
  function clearField(field) { field.input.removeAttribute("aria-invalid"); field.error.textContent = ""; }
  function fieldError(field, message) { field.input.setAttribute("aria-invalid","true"); field.error.textContent = message; }
  function setBusy(on) {
    busy = on; submit.disabled = on; form.setAttribute("aria-busy",String(on));
    label.textContent = on ? "Sending message…" : "Send message";
    icon.className = "button-icon fa " + (on ? "fa-circle-o-notch fa-spin" : "fa-send");
    // Prevent editing the submitted draft while a request is pending.
    fields.forEach(f => { f.input.readOnly = on; });
  }
  fields.forEach(f => f.input.addEventListener("input", () => {
    clearField(f); if (notice.dataset.state === "success") notice.hidden = true;
    if (!actions.hidden) updateFallback();
  }));
  form.addEventListener("invalid", event => {
    const f = fields.find(item => item.input === event.target);
    if (f) fieldError(f, f.input.validity.valueMissing ? "Please enter your " + f.name + "." : f.input.validationMessage);
  }, true);
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(draftText(draft()));
      copyButton.textContent = "Copied ✓";
    } catch (_) { copyButton.textContent = "Select and copy your message"; byId("cf-message").focus(); byId("cf-message").select(); }
  });
  function handleRejected(response, payload) {
    const errors = Array.isArray(payload?.errors) ? payload.errors : [];
    let first = null;
    for (const e of errors) {
      const field = fields.find(f => f.name === e?.field);
      if (field && typeof e.message === "string") { fieldError(field, e.message.slice(0,240)); first ||= field; }
    }
    if (first) { show("error","Check the highlighted fields","Make the corrections below and send your message again."); first.input.focus(); return; }
    const codes = errors.map(e => String(e?.code || "").toUpperCase()).join(" ");
    if (response.status === 429 || /RATE_LIMIT|TOO_MANY/.test(codes)) {
      show("warning","Please wait a moment","The form is receiving too many requests. Your message is still here. Try again later or use email.",true);
    } else if ([401,403,404,410].includes(response.status) || /FORM_NOT_FOUND|PROJECT_NOT_FOUND|FORM_DISABLED/.test(codes)) {
      show("error","The contact service is unavailable","Your message has been kept. Please send it directly by email instead.",true);
    } else if (response.status >= 500) {
      show("warning","Delivery could not be confirmed","The service returned an error. Your draft is safe. Check before retrying, as your message may already have reached the service.",true);
    } else {
      show("error","The form could not accept your message","Your draft is still here. Check the details or send it directly by email.",true);
    }
    // Keep provider diagnostics available for the site owner without exposing message data.
    console.warn("Contact service rejected submission", {status: response.status, codes});
  }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    fields.forEach(clearField);
    if (!form.reportValidity()) return;
    const d = draft();
    const blank = fields.filter(f => ["name","message"].includes(f.name) && !d[f.name]);
    if (blank.length) {
      blank.forEach(f => fieldError(f,"Please enter your " + f.name + "."));
      blank[0].input.focus(); return;
    }
    if (navigator.onLine === false) {
      show("warning","You appear to be offline","Your message is still here. Reconnect to send it, or copy it for later.",true); return;
    }
    const body = new FormData(form);
    body.set("name",d.name); body.set("email",d.email); body.set("subject",d.subject); body.set("message",d.message);
    setBusy(true); show("sending","Sending your message","This usually takes a few seconds.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(form.action, {method:"POST",body,headers:{Accept:"application/json"},signal:controller.signal,credentials:"omit",referrerPolicy:"strict-origin-when-cross-origin"});
      const payload = await response.json().catch(() => null);
      if (!response.ok || (Array.isArray(payload?.errors) && payload.errors.length) || payload?.ok === false) {
        handleRejected(response,payload); return;
      }
      if (response.redirected || !payload || typeof payload !== "object" || (payload.ok !== true && typeof payload.next !== "string")) {
        show("warning","Delivery could not be confirmed","The service returned an unexpected response. Your message is still here. Check before retrying or use direct email.",true); return;
      }
      form.reset(); fields.forEach(clearField);
      show("success","Message sent","Thanks for reaching out. Your message was accepted, and I’ll get back to you as soon as I can.");
    } catch (error) {
      show("warning",error?.name === "AbortError" ? "That took longer than expected" : "Could not confirm delivery","Your draft is still here. The connection may have been interrupted. Check before retrying, or send directly by email.",true);
    } finally { clearTimeout(timeout); setBusy(false); }
  });
})();
