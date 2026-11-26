/* ---------- AI assistant ---------- */
const RU=[[/библиотек\w*/g,"library"],[/столов\w*|кантин\w*|кафе|поесть|покушать|еда|голод\w*/g,"canteen"],[/маркет\w*/g,"market"],[/вай-?фай\w*/g,"wifi"],[/студент\s*сервис/g,"student service"],[/бочк\w*/g,"barrel"],[/релакс\w*/g,"relax room"],[/красн\w*\s*зал/g,"red hall"],[/вход\w*/g,"main entrance"],[/магазин\w*|одежд\w*|худи/g,"sdu store"],[/где|как пройти|найди/g,"where"],[/мероприяти\w*|событи\w*/g,"events"],[/этаж/g,"floor"],[/hungry|starving/g,"food"]];
const VOCAB=["library","canteen","market","entrance","student","service","store","relax","barrel","hall","wifi","events","floor"];
const lev=(a,b)=>{const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]==b[j-1]?0:1));return d[a.length][b.length]};
const fix=t=>t.split(" ").map(w=>w.length>=4&&!VOCAB.includes(w)&&!/\d/.test(w)?(VOCAB.find(v=>lev(w,v)<=2)||w):w).join(" ");
const CODE=/\b([a-i])\s?-?\s?(\d{3})\b/i;
const DESC={"Library":"in Block B","Red Hall":"to the left of the Library","Wi-Fi Zone":"to the right of the Library","Main Entrance":"at the bottom of the building, right of the Wi-Fi Zone","Student Service":"just below Block D","SDU Store":"just below Student Service","Market":"on the east side, just above the Canteen","Canteen":"on the east side of Block F, in the same place on floors 1–3","H Canteen":"on the east side of Block H (also a canteen)","Men's Relax Room":"on the east side of Block H","Women's Relax Room":"on the east side of Block H"};
const desc=r=>DESC[r.name]||(r.barrel?"in the round barrel hall on the east side of Block "+r.barrel:/^[A-I]\d1[1-5]$/.test(r.name)?`on the east side of Block ${r.name[0]}`:/^[A-I]\d{2,3}$/.test(r.name)?`in Block ${r.name[0]}${(f=>f?` (${f})`:"")((BLK.find(b=>b[0]==r.name[0])||[])[3])}`:"in the main building");
const info=(a,b)=>{const rt=buildRoute(a,b),dist=Math.round(rt.reduce((t,s)=>t+len(s.pts),0)*.2),fl=Math.abs(a.f-b.f)-(a.f*b.f<0?1:0);return{dist,fl,min:Math.max(1,Math.round((dist/1.2+fl*30)/60))}};
function pick(x){if(!norm(x))return null;const c=x.match(CODE);if(c){const n=c[1].toUpperCase()+c[2];return ROOMS.find(r=>r.name==n)||{bad:n}}
 let r=find(x)[0];if(!r){const y=fix(x);if(y!=x)r=find(y)[0]}return r}
function rule(n){const L=n[0];return{h:"AB".includes(L)?`Blocks A and B have no numbered rooms. Try the <b>Red Hall</b>, <b>Library</b> or <b>Main Entrance</b>.`:L=="C"?`Block C only has the barrel rooms <b>C117</b> and <b>C118</b> (on floor 2: C217, C218; floor 3: C317, C318).`:`I can't find room <b>${n}</b>. In Block ${L}, floors 1–3 have rooms ${L}x01–${L}x10 and floor 4 has ${L}401–${L}405. Blocks G, H and I also have east-side rooms numbered 11–15 on some floors.`}}
const cost=(a,x)=>{const i=info(a,x);return i.dist/1.2+i.fl*30};
const pool=(r,grp)=>grp&&r.grp?ROOMS.filter(x=>x.grp==r.grp):ROOMS.filter(x=>x.name==r.name);
const bestOf=(r,a=S.from)=>{const p=pool(r,true);return p.length>1?p.reduce((m,x)=>cost(a,x)<cost(a,m)?x:m):r};
const NEAR=/\b(nearest|closest|near me|nearby)\b/g;
const gen=(b,t)=>!!b.grp&&(/\b(nearest|closest|near me|nearby)\b/.test(t)||norm(t.replace(NEAR,"")).replace(/\s/g,"")=="canteen");
function place(r,grp){if(r.bad)return rule(r.bad);
 const a=S.from,same=pool(r,grp),best=same.length>1?same.reduce((m,x)=>cost(a,x)<cost(a,m)?x:m):r;
 if(best===a)return{h:`You are already at <b>${esc(a.name)}</b>. Where would you like to go?`};
 setTo(best,true);const i=info(a,best),lift=S.route&&S.route[0]&&S.route[0].lift;
 let h=`<b>${esc(best.name)}</b> is ${desc(best)}, ${fn(best.f)}. From <b>${esc(a.name)}</b> it takes about <b>${i.min} min</b> (${i.dist} m).`;
 if(best.f!=a.f&&lift)h+=` Take the lift in Block ${lift.blk} ${best.f>a.f?"up":"down"} to ${fn(best.f)}.`;
 h+=` I drew the route on the map.`;
 const others=same.filter(x=>x!==best);
 if(others.length)h+=grp&&r.grp?` Other canteens: ${others.map(x=>esc(x.name)+" ("+fn(x.f)+")").join(", ")}.`:` It is also on ${others.map(x=>fn(x.f)).join(" and ")}.`;
 return{h,more:find(r.name).filter(x=>x.name!=r.name&&!/^[A-I]\d/.test(x.name)&&!(r.grp&&x.grp==r.grp)).slice(0,3)}}
function floorInfo(f){if(f<-1||f>4||f==0)return{h:"SDU has floors 1–4, plus level −1 in Block H."};
 const sp=[...new Set(ROOMS.filter(r=>r.f==f&&!/^[A-I]\d{2,3}$/.test(r.name)).map(r=>r.name))];
 return{h:`<b>${f<0?"Level −1":"Floor "+f}</b>: `+(sp.length?sp.join(", ")+". ":"")+(f<0?"Also H01–H03. ":"")+(f==4?"Blocks D–I have 5 rooms each (e.g. F401–F405).":f>0?`Blocks D–I have 10 rooms each (e.g. F${f}01–F${f}10).`:"")}}
const HELLO=`Hi! I'm the SDU assistant. Ask me where something is — a room like <b>F307</b> or a place like <b>library</b>, <b>canteen</b>, <b>market</b> or <b>relax room</b> — and I'll draw the route. You can also say “from D110 to F401”, “I'm at the library” or “what's on floor 2”. Russian works too: «где столовая».`;
function think(q){let t=q.toLowerCase();RU.forEach(([a,b])=>t=t.replace(a,b));t=t.replace(/[?!.]/g," ").replace(/\s+/g," ").trim();
 if(!t||/^(hi|hello|hey|salam|привет|сәлем)\b/.test(t)||t=="help"||/what can you do/.test(t))return{h:HELLO};
 if(/\bevents?\b/.test(t)){const up=events.slice(0,3);return{h:up.length?"Upcoming events:<br>"+up.map(v=>`• <b>${esc(v.t)}</b> — ${fmt(v.d)}, ${v.tm}, ${esc(rn(v.room))} <button class="chip" data-room="${esc(v.room)}">Directions</button>`).join("<br>"):"No events are scheduled yet."}}
 if(/how many floors/.test(t))return{h:"SDU has 4 floors, plus level −1 in Block H. Every block has a lift in its middle."};
 const fl=t.match(/(?:floor|level)\s*(-?\d)/);if(fl&&!CODE.test(t))return floorInfo(+fl[1]);
 const m=t.match(/(?:from|between)\s+(.+?)\s+(?:to|and)\s+(.+)/);
 if(m){const a=pick(m[1]),b=pick(m[2]);if(a&&b&&!a.bad&&!b.bad){setFrom(a);return place(b,gen(b,m[2]))}return{h:"I couldn't recognise one of those places. Try “from D110 to F401”."}}
 const im=t.match(/^(?:i am|i'm|im)\s+(?:in|at|near|by)?\s*(.+)/);
 if(im&&!/look|need|want|find|go|search|where/.test(t)){const a=pick(im[1]);if(a&&!a.bad){setFrom(a);return{h:`Got it — you are at <b>${esc(a.name)}</b> (${fn(a.f)}). Where do you want to go?`}}}
 const b=pick(t.replace(/\b(nearest|closest|near me|nearby)\b/g,""));
 if(b)return place(b,gen(b,t));
 return{h:"Sorry, I couldn't find that. Try a room code like <b>D110</b>, or a place like Library, Canteen, Market, Student Service, SDU Store or Wi-Fi Zone."}}
const aiLog=$("#aiLog");
function say(h,who){const d=document.createElement("div");d.className="msg "+who;d.innerHTML=h;aiLog.appendChild(d);aiLog.scrollTop=aiLog.scrollHeight;return d}
function ask(q){q=q.trim();if(!q)return;say(esc(q),"u");const d=say('<span class="typing"><i></i><i></i><i></i></span>',"b");
 setTimeout(()=>{const r=think(q);d.innerHTML=r.h+(r.more&&r.more.length?'<br><small>Other matches:</small> '+r.more.map(x=>`<button class="chip" data-ask="${esc(x.name)}">${esc(x.name)}</button>`).join(""):"");aiLog.scrollTop=aiLog.scrollHeight},380)}
$("#aiForm").onsubmit=e=>{e.preventDefault();const i=$("#aiIn");ask(i.value);i.value=""};
$("#aiChips").innerHTML=["Where is the library?","Nearest canteen","F307","From D110 to F401","Men's relax room","What's on floor 3?","Upcoming events","Где столовая?"].map(n=>`<button class="chip" data-ask="${esc(n)}">${esc(n)}</button>`).join("");
document.addEventListener("click",e=>{const a=e.target.closest("[data-ask]");if(a)ask(a.dataset.ask);const r=e.target.closest("[data-room]");if(r){const x=ROOMS.find(q=>q.id==r.dataset.room);if(x)setTo(x,true)}});
$("#quick").insertAdjacentHTML("afterbegin",'<button class="chip" data-tab="ai" style="background:linear-gradient(135deg,#1db93c,#2f6bff);color:#fff">✦ Ask AI</button>');
document.addEventListener("click",e=>{const t=e.target.closest("[data-tab]");if(t)showTab(t.dataset.tab)});
say(HELLO,"b");
