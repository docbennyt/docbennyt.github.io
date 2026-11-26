/* Official Formspree AJAX integration with native HTML fallback. */
(() => {
  "use strict";
  const menu = document.getElementById("menu-toggle-input");
  if (menu) menu.addEventListener("change", () => menu.setAttribute("aria-expanded", String(menu.checked)));
  const byId = id => document.getElementById(id);
  const form = byId("contact-form");
  if (!form) return;
  const submit = byId("cf-submit"), label = submit.querySelector(".button-text"), icon = submit.querySelector(".button-icon");
  const notice = byId("cf-notice"), title = byId("cf-notice-title"), detail = byId("cf-notice-detail"), actions = byId("cf-notice-actions"), provider = byId("cf-provider-detail");
  const close = byId("cf-close-notice"), nativeButton = byId("cf-native-submit"), emailLink = byId("cf-email-fallback"), copyButton = byId("cf-copy-message");
  const fields = ["name","email","subject","message"].map(name => ({name,input:byId("cf-"+name),error:byId("cf-"+name+"-error")}));
  let busy = false, slowTimer = 0, nativeMode = false;
  function draft() {
    const data = new FormData(form);
    return Object.fromEntries(fields.map(f => [f.name,String(data.get(f.name)||"").trim()]));
  }
  function draftText(d) { return d.message + "\n\nFrom: " + d.name + "\nEmail: " + d.email; }
  function updateFallback() {
    const d=draft();
    emailLink.href="mailto:dr.bennyt.09@gmail.com?subject="+encodeURIComponent(d.subject||"Portfolio enquiry")+"&body="+encodeURIComponent(draftText(d));
  }
  function show(state,heading,message,{fallback=false,native=false,reference=""}={}) {
    notice.hidden=false; notice.dataset.state=state;
    notice.querySelector(".contact-notice-icon i").className="fa "+({sending:"fa-circle-o-notch fa-spin",success:"fa-check-circle",error:"fa-exclamation-circle",warning:"fa-info-circle"}[state]);
    title.textContent=heading; detail.textContent=message; actions.hidden=!fallback; nativeButton.hidden=!native;
    provider.textContent=reference; provider.hidden=!reference;
    if(fallback){updateFallback();copyButton.textContent="Copy message";}
  }
  function clearField(f){f.input.removeAttribute("aria-invalid");f.error.textContent="";}
  function fieldError(f,message){f.input.setAttribute("aria-invalid","true");f.error.textContent=message;}
  function setBusy(on){
    busy=on;submit.disabled=on;form.setAttribute("aria-busy",String(on));label.textContent=on?"Sending message…":"Send message";icon.className="button-icon fa "+(on?"fa-circle-o-notch fa-spin":"fa-send");
    fields.forEach(f=>{f.input.readOnly=on;});
    if(!on){clearTimeout(slowTimer);}
  }
  close.addEventListener("click",()=>{notice.hidden=true; if(document.activeElement===close)submit.focus({preventScroll:true});});
  fields.forEach(f=>f.input.addEventListener("input",()=>{clearField(f);if(notice.dataset.state==="success")notice.hidden=true;if(!actions.hidden)updateFallback();}));
  form.addEventListener("invalid",e=>{const f=fields.find(f=>f.input===e.target);if(f)fieldError(f,f.input.validity.valueMissing?"Please enter your "+f.name+".":f.input.validationMessage);},true);
  copyButton.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(draftText(draft()));copyButton.textContent="Copied ✓";}catch(_){byId("cf-message").focus();byId("cf-message").select();copyButton.textContent="Select and copy your message";}});
  // Explicit, user-initiated native POST only after a definite rejection.
  // Opens a new tab so a hosted verification page cannot erase the original draft.
  nativeButton.addEventListener("click",()=>{
    if(busy||!form.reportValidity())return;
    const oldTarget=form.getAttribute("target");
    form.target="_blank";nativeMode=true;
    try{HTMLFormElement.prototype.submit.call(form);}
    finally{nativeMode=false;if(oldTarget===null)form.removeAttribute("target");else form.setAttribute("target",oldTarget);}
    show("warning","Continue in the new tab","Follow the instructions in the new tab. Your draft is safe here.",{fallback:true});
  });
  // If the CDN cannot load, the ordinary HTML form still submits to Formspree.
  form.addEventListener("submit",e=>{
    if(nativeMode)return;
    if(busy){e.preventDefault();e.stopImmediatePropagation();return;}
    const d=draft();
    const blank=fields.filter(f=>["name","message"].includes(f.name)&&!d[f.name]);
    if(blank.length){e.preventDefault();e.stopImmediatePropagation();blank.forEach(f=>fieldError(f,"Please enter your "+f.name+"."));blank[0].input.focus();return;}
    if(navigator.onLine===false){e.preventDefault();e.stopImmediatePropagation();show("warning","You appear to be offline","Reconnect to send your message, or copy it for later.",{fallback:true});return;}
    fields.forEach(clearField);
  },true);
  window.formspree=window.formspree||function(){(window.formspree.q=window.formspree.q||[]).push(arguments);};
  window.formspree("initForm",{
    formElement:"#contact-form",formId:"mljeporj",useDefaultStyles:false,debug:false,
    disable:()=>setBusy(true),enable:()=>setBusy(false),
    renderFieldErrors:(_,error)=>{
      fields.forEach(clearField);
      if(!error)return;
      for(const f of fields){const errors=error.getFieldErrors(f.name);if(errors.length)fieldError(f,String(errors[0].message||"Please check this field.").slice(0,240));}
    },
    renderSuccess:()=>{},renderFormError:()=>{},
    onSubmit:()=>{
      show("sending","Sending your message","This usually takes a few seconds.");
      slowTimer=setTimeout(()=>{if(busy)show("sending","Still connecting…","Your draft is safe. Please keep this page open.");},15000);
    },
    onSuccess:()=>{
      form.reset();fields.forEach(clearField);
      show("success","Message sent","Thanks! I’ll be in touch.");
    },
    onError:(_,error)=>{
      const errors=error.getFormErrors(), codes=errors.map(e=>e.code).filter(c=>c&&c!=="UNSPECIFIED");
      const message=errors.map(e=>String(e.message||"")).join(" ").slice(0,240);
      const field=fields.find(f=>f.input.getAttribute("aria-invalid")==="true");
      const known=codes.join(", ");
      const reference="";
      // Render service-provided messages as text, never HTML; do not log form contents.
      if(field&&!errors.length){show("error","Check the highlighted fields","Correct the highlighted information and send again.");field.input.focus();return;}
      if(/rate limit|too many requests|429/i.test(message)){
        show("warning","Please wait a moment","Try again later, or contact me directly by email.",{fallback:true,reference});
      }else if(/BLOCKED|INACTIVE|FORM_NOT_FOUND|PROJECT_NOT_FOUND/.test(known)||/captcha|verification|forbidden|domain|disabled|not found|blocked/i.test(message)){
        show("error","Message not sent","Your draft is safe. Continue verification or use email.",{fallback:true,native:true,reference});
      }else{
        show("warning","Delivery could not be confirmed","Your draft is still here. Check before retrying to avoid sending twice, or contact me directly.",{fallback:true,reference});
      }
      console.warn("Formspree submission error", {codes:codes});
    },
    onFailure:()=>show("warning","Delivery could not be confirmed","Your draft is still here. Check your connection before retrying, or use direct email.",{fallback:true})
  });
})();
