(() => {
"use strict";
const trigger=document.querySelector("[data-visitor-island]"), dialog=document.getElementById("action-centre");
if(!trigger||!dialog)return;
const search=dialog.querySelector("input"), rows=[...dialog.querySelectorAll("#action-results li")], count=dialog.querySelector("#action-count"), empty=dialog.querySelector("#action-empty");
let selected=-1;
const greetingNode=trigger.querySelector("[data-local-greeting]"), iconNode=trigger.querySelector("[data-local-period-icon]");
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
let timer=0, phase=0, cycle=0;
function words(hour){
  if(hour<5)return ["Hello, night owl","🌙",["Kwaziwai","Mhoroi"],["Salibonani"]];
  if(hour<12)return ["Good morning","☀️",["Mangwanani","Mamukasei"],["Livukenjani","Salibonani"]];
  if(hour<18)return ["Good afternoon","☀️",["Maswerasei","Masikati"],["Litshonenjani","Salibonani"]];
  return ["Good evening","🌙",["Manheru","Kwaziwai"],["Salibonani"]];
}
function renderGreeting(){
  const [english,icon,shona,ndebele]=words(new Date().getHours());
  const lang=["en","sn","nd"][phase];
  const message=phase===0?english:phase===1?shona[cycle%shona.length]:ndebele[cycle%ndebele.length];
  greetingNode.textContent=message;greetingNode.lang=lang;iconNode.textContent=icon;
  trigger.setAttribute("aria-label",english+". Open quick access");
  if(!reduced.matches&&typeof greetingNode.animate==="function")greetingNode.animate([{opacity:.25,transform:"translateY(4px)"},{opacity:1,transform:"translateY(0)"}],{duration:220,easing:"cubic-bezier(.2,.8,.2,1)"});
}
function schedule(){clearTimeout(timer);if(document.hidden||dialog.open||reduced.matches)return;timer=setTimeout(()=>{phase=(phase+1)%3;if(phase===0)cycle++;renderGreeting();schedule();},[6000,2000,2000][phase]);}
function restart(){clearTimeout(timer);phase=0;renderGreeting();schedule();}
function visible(){return rows.filter(r=>!r.hidden).map(r=>r.querySelector("a"));}
function mark(i){const a=visible(); selected=a.length?Math.max(0,Math.min(i,a.length-1)):-1;rows.forEach(r=>r.querySelector("a").classList.remove("is-selected"));if(selected>=0){a[selected].classList.add("is-selected");a[selected].scrollIntoView({block:"nearest"});}}
function filter(){const q=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);for(const r of rows)r.hidden=!q.every(s=>(r.textContent+" "+r.dataset.actionGroup).toLowerCase().includes(s));const n=visible().length;count.textContent=n+" actions";empty.hidden=!!n;selected=-1;rows.forEach(r=>r.querySelector("a").classList.remove("is-selected"));}
function open(){if(dialog.open)return;clearTimeout(timer);search.value="";filter();dialog.showModal();trigger.setAttribute("aria-expanded","true");if(matchMedia("(pointer:fine)").matches)search.focus();else dialog.querySelector("[data-close-action]").focus();}
trigger.addEventListener("click",open);dialog.querySelector("[data-close-action]").addEventListener("click",()=>dialog.close());
dialog.addEventListener("close",()=>{trigger.setAttribute("aria-expanded","false");trigger.focus({preventScroll:true});restart();});
dialog.addEventListener("click",e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}else if(e.target.closest("a"))dialog.close();});
search.addEventListener("input",filter);
dialog.addEventListener("keydown",e=>{if(e.target!==search)return;if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();mark(selected+(e.key==="ArrowDown"?1:-1));}else if(e.key==="Enter"&&visible().length){e.preventDefault();visible()[Math.max(0,selected)].click();}});
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();dialog.open?dialog.close():open();}});
restart();document.addEventListener("visibilitychange",()=>{if(document.hidden)clearTimeout(timer);else restart();});if(reduced.addEventListener)reduced.addEventListener("change",restart);
})();