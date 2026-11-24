(() => {
  "use strict";
  const proofs = [...document.querySelectorAll(".credly-proof")];
  let requested = false;
  function loadBadge() {
    if (requested || !proofs.some(proof => proof.open)) return;
    requested = true;
    const script = document.createElement("script");
    script.src = "https://cdn.credly.com/assets/utilities/embed.js";
    script.async = true;
    script.onerror = () => { requested = false; script.remove(); };
    document.head.appendChild(script);
  }
  for (const proof of proofs) proof.addEventListener("toggle", loadBadge);
  loadBadge();
})();
