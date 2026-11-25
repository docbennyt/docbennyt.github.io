(() => {
"use strict";
const media=matchMedia("(min-width:992px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)");
if(!("IntersectionObserver" in window))return;
let observer;
function configure(){if(observer)observer.disconnect();if(!media.matches)return;observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;e.target.classList.add("craft-enter");observer.unobserve(e.target);}}, {threshold:.16});for(const node of document.querySelectorAll("[data-craft]:not(.craft-enter)"))observer.observe(node);}
configure();if(media.addEventListener)media.addEventListener("change",configure);
})();