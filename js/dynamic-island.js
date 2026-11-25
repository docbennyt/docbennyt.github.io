(() => {
"use strict";
const trigger=document.querySelector("[data-visitor-island]"), dialog=document.getElementById("action-centre");
if(!trigger||!dialog)return;
const search=dialog.querySelector("input"), rows=[...dialog.querySelectorAll("#action-results li")], count=dialog.querySelector("#action-count"), empty=dialog.querySelector("#action-empty");
let selected=-1;
function greet(){const h=new Date().getHours();const [text,icon]=h<5?["Hello, night owl","🌙"]:h<12?["Good morning","☀️"]:h<18?["Good afternoon","☀️"]:["Good evening","🌙"];trigger.querySelector("[data-local-greeting]").textContent=text;trigger.querySelector("[data-local-period-icon]").textContent=icon;trigger.setAttribute("aria-label",text+". Open quick access");}
function visible(){return rows.filter(r=>!r.hidden).map(r=>r.querySelector("a"));}
function mark(i){const a=visible(); selected=a.length?Math.max(0,Math.min(i,a.length-1)):-1;rows.forEach(r=>r.querySelector("a").classList.remove("is-selected"));if(selected>=0){a[selected].classList.add("is-selected");a[selected].scrollIntoView({block:"nearest"});}}
function filter(){const q=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);for(const r of rows)r.hidden=!q.every(s=>(r.textContent+" "+r.dataset.actionGroup).toLowerCase().includes(s));const n=visible().length;count.textContent=n+" actions";empty.hidden=!!n;selected=-1;rows.forEach(r=>r.querySelector("a").classList.remove("is-selected"));}
function open(){if(dialog.open)return;search.value="";filter();dialog.showModal();trigger.setAttribute("aria-expanded","true");if(matchMedia("(pointer:fine)").matches)search.focus();else dialog.querySelector("[data-close-action]").focus();}
trigger.addEventListener("click",open);dialog.querySelector("[data-close-action]").addEventListener("click",()=>dialog.close());
dialog.addEventListener("close",()=>{trigger.setAttribute("aria-expanded","false");trigger.focus({preventScroll:true});});
dialog.addEventListener("click",e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}else if(e.target.closest("a"))dialog.close();});
search.addEventListener("input",filter);
dialog.addEventListener("keydown",e=>{if(e.target!==search)return;if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();mark(selected+(e.key==="ArrowDown"?1:-1));}else if(e.key==="Enter"&&visible().length){e.preventDefault();visible()[Math.max(0,selected)].click();}});
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();dialog.open?dialog.close():open();}});
greet();document.addEventListener("visibilitychange",()=>{if(!document.hidden)greet();});setInterval(greet,60000);
})();