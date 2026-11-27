const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
/* ---------- Building ---------- */
const CX=315;
const BLK=[["I",40,"#0e7490",""],["H",200,"#2b5fa8",""],["G",360,"#5a7d2e","Business School"],["F",520,"#2a3a8c","Engineering & Natural Sciences"],["E",680,"#8a2330","Education & Humanities"],["D",840,"#8a2a8a","Law & Social Sciences"]];
const LIFTS=[...BLK.map(b=>({x:150,y:b[1]+80,blk:b[0]}))];
const ROOMS=[];
const ROOM_ALIAS={"3:Barrel E1":"3:Barrel E","3:Barrel E2":"3:Barrel E","3:Barrel F":"3:Barrel D1","3:Barrel D":"3:Barrel D1"};   // old event places -> current rooms
[13,14,15].forEach(n=>ROOM_ALIAS["1:G1"+n]="1:Mini Red Hall");
[1,2].forEach(f=>{["C","D","E"].forEach(L=>ROOM_ALIAS[f+":Barrel "+L]=f+":"+L+f+"17");ROOM_ALIAS[f+":Barrel E1"]=f+":E"+f+"17";ROOM_ALIAS[f+":Barrel E2"]=f+":E"+f+"17";ROOM_ALIAS[f+":Barrel F"]=f+":D"+f+"17";["18","19","20"].forEach(n=>ROOM_ALIAS[f+":E"+f+n]=f+":E"+f+"17");ROOM_ALIAS[f+":C"+f+"18"]=f+":C"+f+"17"});
const add=o=>{o.id=o.f+":"+o.name;o.kw=(o.kw||"")+" "+o.name;if(o.cx==null){o.cx=o.x+o.w/2;o.cy=o.y+o.h/2}ROOMS.push(o)};
const spec=(f,name,x,y,w,h,c,jy,side,ic,kw,ex)=>add({f,name,x,y,w,h,c,ic,kw,...ex,p:[[side=="w"?x+w:x,jy],[CX,jy]]});
/* places (listed first so they show in default suggestions) */
add({f:1,name:"Library",x:130,y:1262,w:140,h:78,c:"#0f8b8d",ic:"📚",kw:"books study reading Block B",p:[[200,1262],[200,1250],[CX,1250]]});
add({f:1,name:"Red Hall",x:10,y:1262,w:110,h:78,c:"#c0392b",ic:"🎭",kw:"hall events Block A",p:[[65,1262],[65,1250],[CX,1250]]});
add({f:1,name:"Wi-Fi Zone",x:280,y:1263,w:110,h:110,circle:1,rings:1,c:"#6d4cc2",ic:"📶",kw:"wifi wi-fi internet network",p:[[335,1263],[335,1250],[CX,1250]]});
add({f:1,name:"Main Entrance",x:400,y:1262,w:90,h:38,c:"#d62839",kw:"entrance exit door start",p:[[445,1262],[445,1250],[CX,1250]]});
spec(1,"Student Service",30,1010,80,120,"#2f7ed8",1070,"w","🗂","support documents certificates help Block D");
spec(1,"SDU Store",30,1140,80,80,"#b83280",1180,"w","👕","clothes merch hoodie shop boutique",{awn:1});
spec(1,"Market",345,528,125,52,"#e67e22",554,"e","🛒","shop groceries snacks boutique Block F",{awn:1});
for(const f of [1,2,3])spec(f,"Canteen",345,f==1?586:528,125,f==1?82:140,"#e09f1f",f==1?627:598,"e","🍴","food lunch eat cafe coffee Block F",{grp:"canteen"});   // floors 2-3: no market, so the canteen is bigger
/* 4 barrels (round lecture halls), all the same size, in a zigzag starting from block C: C, D (two) and E.
   Floors 1-2: each barrel has ONE room (C117, D117, D118, E117 / C217 ...). Floor 3: no rooms, only a roof where students can study. */
const BR=[["C",1100,385,17],["D",960,440,17],["D",870,385,18],["E",760,440,17]];
for(const f of [1,2])BR.forEach(([L,cy,cx,n])=>add({f,name:L+f+n,barrel:L,walk:1,bx:cx,by:cy,R:36,x:cx-36,y:cy-36,w:72,h:72,c:"#d9822b",circle:1,kw:"barrel "+L+" lecture hall round Block "+L,p:[[cx-36,cy],[CX,cy]]}));
BR.forEach(([L,cy,cx,n])=>add({f:3,name:"Barrel "+L+(L=="D"?(n==17?1:2):""),barrel:L,walk:1,bx:cx,by:cy,R:36,x:cx-36,y:cy-36,w:72,h:72,c:"#d9822b",ic:"📖",circle:1,kw:"barrel "+L+" roof study area Block "+L,p:[[cx-36,cy],[CX,cy]]}));
/* block G, floor 1 only: the east rooms 113-115 are replaced by a small Red Hall */
spec(1,"Mini Red Hall",345,426,70,82,"#c0392b",467,"e","🎭","hall events mini red Block G");
/* level -1: every block has one room 01 (top row, far left; Block H has H01-H03 on its east side) */
BLK.forEach(([L,top,c,fac])=>{if(L!="H")add({f:-1,blk:L,name:L+"01",x:10,y:top+12,w:56,h:46,c,kw:fac,cx:38,cy:top+35,p:[[38,top+58],[38,top+80],[CX,top+80]]})});
spec(3,"Men's Relax Room",345,215,110,60,"#6d5acf",245,"e","🛋","rest sleep Block H");
spec(3,"Women's Relax Room",345,285,110,60,"#c0539b",315,"e","🛋","rest sleep Block H");
spec(-1,"H Canteen",345,210,125,80,"#e09f1f",250,"e","🍴","food lunch eat level -1",{grp:"canteen"});
["H01","H02","H03"].forEach((n,i)=>spec(-1,n,345,298+i*20,125,18,"#2b5fa8",307+i*20,"e","","level -1"));
/* block rooms: floors 1-3 = 10 west rooms, floor 4 = 5 rooms; H/I have 5 east rooms; D/E/F have one barrel */
for(const f of [1,2,3,4])BLK.forEach(([L,top,c,fac])=>{
 for(let n=1;n<=(f==4?5:10);n++){const k=(n-1)%5,north=f==4||n>5,x=10+(4-k)*56,wy=top+80,cx=x+28,door=north?top+58:top+102;
  add({f,blk:L,name:L+f+String(n).padStart(2,"0"),x,y:north?top+12:top+102,w:56,h:46,c,kw:fac,cx,cy:top+(north?35:125),p:[[cx,door],[cx,wy],[CX,wy]]})}
 if(f<4&&"IHG".includes(L)&&!(f==3&&L=="H"))for(let n=11;n<=(L=="G"&&f==1?12:15);n++){const y=top+10+(n-11)*28;add({f,name:L+f+n,x:345,y,w:70,h:26,c,kw:fac,p:[[345,y+13],[CX,y+13]]})}
 });
const ENTR=ROOMS.find(r=>r.name=="Main Entrance");
let S={floor:1,from:ENTR,to:null,route:null};
/* ---------- Map ---------- */
const svg=$("#map");let vb={x:0,y:0,w:600,h:1400};
const setVB=()=>svg.setAttribute("viewBox",`${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
function view(x0,y0,x1,y1){const r=svg.getBoundingClientRect(),a=r.width/r.height,w=x1-x0,h=y1-y0;let W=w,H=h;if(w/h<a)W=h*a;else H=w/a;vb={x:(x0+x1)/2-W/2,y:(y0+y1)/2-H/2,w:W,h:H};setVB()}
const fitAll=()=>S.floor<0||S.floor==4?view(-40,20,540,1020):view(-40,20,540,1400);
const label=r=>{const w=r.name.split(" "),big=r.w>=70&&r.name.length>10,ls=big?[w.slice(0,-1).join(" "),w.slice(-1)[0]]:[r.name];
 const ic=r.ic?`<text x="${r.cx}" y="${r.cy-(ls.length>1?5:3)}" font-size="17">${r.ic}</text>`:"";
 const y0=r.ic?r.cy+(ls.length>1?9:14):r.cy+4-(ls.length-1)*6.5;
 return ic+ls.map((l,i)=>`<text x="${r.cx}" y="${y0+i*13}" fill="${r.c}">${esc(l)}</text>`).join("")};
const band=(y,h,c,l,r)=>`<rect x="-40" y="${y}" width="580" height="${h}" fill="${c}" fill-opacity=".08"/><text x="-18" y="${y+h/2+14}" font-size="40" font-weight="800" text-anchor="middle" fill="${c}" fill-opacity=".28">${l}</text><text x="512" y="${y+h/2+14}" font-size="40" font-weight="800" text-anchor="middle" fill="${c}" fill-opacity=".28">${r}</text>`;
function draw(){const f=S.floor,bl=BLK;
 let h=`<defs><filter id="sh" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#17265a" flood-opacity=".2"/></filter></defs><rect x="-4000" y="-4000" width="9000" height="9000" fill="var(--map)"/>`;
 bl.forEach(([L,top,c])=>h+=band(top,160,c,L,L));
 if(f>0&&f<4){h+=band(1000,240,"#3a9d7a","C","C");h+=band(1240,160,"#c9a96a","A","B")}
 const y0=40,y1=f<0||f==4?1000:1240;
 h+=`<g filter="url(#sh)" fill="#fff" stroke="#cdd3df"><rect x="290" y="${y0}" width="50" height="${y1-y0}"/>`;
 if(f>0&&f<4)h+=`<rect x="120" y="1000" width="320" height="240" rx="14"/>`;
 if(f==1)h+=`<rect x="10" y="1240" width="480" height="20"/>`;
 ROOMS.filter(r=>r.f==f&&r.walk).forEach(r=>h+=`<rect x="338" y="${r.by-17}" width="${r.p[0][0]-336}" height="34"/>`);
 bl.forEach(([L,top])=>h+=`<rect x="10" y="${top+58}" width="280" height="44"/>`);
 h+=`</g>`;
 bl.forEach(([L,top,c,fac])=>h+=`<text x="75" y="${top+78}" font-size="10" font-weight="800" text-anchor="middle" fill="#6b7489">Block ${L}</text><text x="75" y="${top+90}" font-size="7.5" font-weight="700" text-anchor="middle" fill="#8590a6">${esc(fac)}</text>`);
 if(f>0&&f<4)h+=`<text x="280" y="1232" font-size="9.5" font-weight="700" text-anchor="middle" fill="#7a8397">Block C · Lobby</text>`;
 h+=`<g font-size="10.5" font-weight="800" text-anchor="middle">`;
 ROOMS.filter(r=>r.f==f).forEach(r=>{const t=r===S.to?"#1db93c":r===S.from?"#2f6bff":null,sw=t?3:1.3,fo=t?.45:.17;
  let sh;if(r.half!=null){const R=r.R,d=r.half==0?`M${r.bx-R},${r.by}A${R},${R} 0 0 1 ${r.bx+R},${r.by}Z`:`M${r.bx+R},${r.by}A${R},${R} 0 0 1 ${r.bx-R},${r.by}Z`;
   sh=`<path d="${d}" fill="#fff"/><path d="${d}" fill="${t||r.c}" fill-opacity="${fo}" stroke="${r.c}" stroke-width="${sw}"/>`}
  else if(r.circle){const R=r.w/2;sh=`<circle cx="${r.cx}" cy="${r.cy}" r="${R}" fill="#fff"/><circle cx="${r.cx}" cy="${r.cy}" r="${R}" fill="${t||r.c}" fill-opacity="${fo}" stroke="${r.c}" stroke-width="${sw}"/>`;
   if(r.rings)sh+=`<circle cx="${r.cx}" cy="${r.cy}" r="${R*.7}" fill="none" stroke="${r.c}" stroke-opacity=".4" stroke-dasharray="3 3"/><circle cx="${r.cx}" cy="${r.cy}" r="${R*.4}" fill="none" stroke="${r.c}" stroke-opacity=".4" stroke-dasharray="3 3"/>`}
  else{const rx=r.awn?4:7;sh=`<rect x="${r.x+1}" y="${r.y+1}" width="${r.w-2}" height="${r.h-2}" rx="${rx}" fill="#fff"/><rect x="${r.x+1}" y="${r.y+1}" width="${r.w-2}" height="${r.h-2}" rx="${rx}" fill="${t||r.c}" fill-opacity="${fo}" stroke="${r.c}" stroke-width="${sw}"/>`;
   if(r.awn)sh+=Array.from({length:8},(_,i)=>`<rect x="${r.x+1+i*(r.w-2)/8}" y="${r.y+1}" width="${(r.w-2)/8}" height="11" fill="${i%2?"#fff":r.c}"/>`).join("")}
  h+=`<g class="room" data-id="${esc(r.id)}">${sh}${label(r)}</g>`});
 h+=`</g>`;
 LIFTS.filter(l=>f<0||f==4?l.blk!="C":true).forEach(l=>h+=`<rect x="${l.x-11}" y="${l.y-11}" width="22" height="22" rx="6" fill="#17265a"/><text x="${l.x}" y="${l.y+5}" font-size="14" font-weight="800" text-anchor="middle" fill="#fff">⇅</text>`);
 const seg=S.route&&S.route.find(s=>s.f==f);
 if(seg&&seg.pts.length>1){const pt=seg.pts.map(p=>p.join(",")).join(" ");h+=`<polyline class="path c" points="${pt}"/><polyline class="path" points="${pt}"/>`}
 if(S.from&&S.from.f==f)h+=pin(S.from,"#2f6bff",1);
 if(S.to&&S.to.f==f)h+=pin(S.to,"#1db93c");
 svg.innerHTML=h;
 $("#ttl").innerHTML=`SDU Campus<small>${f<0?"Level −1":"Floor "+f}</small>`;
 document.querySelectorAll("#fls button").forEach(b=>{b.classList.toggle("on",b.dataset.f==f);b.classList.toggle("has",!!(S.route&&S.route.some(s=>s.f==b.dataset.f)))});
}
const pin=(r,c,ring)=>{const p=r.p[0];return `<circle class="pulse" cx="${p[0]}" cy="${p[1]}" r="12" fill="${c}" opacity=".3"/><circle cx="${p[0]}" cy="${p[1]}" r="8" fill="${ring?'#fff':c}" stroke="${c}" stroke-width="${ring?4:3}"/>`};
svg.addEventListener("click",e=>{const g=e.target.closest(".room");if(g&&!drag.moved)setTo(ROOMS.find(x=>x.id==g.dataset.id))});
let drag={on:false,moved:false};
svg.addEventListener("pointerdown",e=>{drag={on:true,moved:false,x:e.clientX,y:e.clientY}});
addEventListener("pointermove",e=>{if(!drag.on)return;const k=vb.w/svg.getBoundingClientRect().width,dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;if(drag.moved){vb.x-=dx*k;vb.y-=dy*k;drag.x=e.clientX;drag.y=e.clientY;setVB()}});
addEventListener("pointerup",()=>{drag.on=false;setTimeout(()=>drag.moved=false,0)});
const zoom=(k,cx=vb.x+vb.w/2,cy=vb.y+vb.h/2)=>{vb.x=cx-(cx-vb.x)*k;vb.y=cy-(cy-vb.y)*k;vb.w*=k;vb.h*=k;setVB()};
svg.addEventListener("wheel",e=>{e.preventDefault();const r=svg.getBoundingClientRect();zoom(e.deltaY>0?1.12:.89,vb.x+(e.clientX-r.left)/r.width*vb.w,vb.y+(e.clientY-r.top)/r.height*vb.h)},{passive:false});
$("#zi").onclick=()=>zoom(.8);$("#zo").onclick=()=>zoom(1.25);
$("#fls").innerHTML=[4,3,2,1,-1].map(n=>`<button data-f="${n}">${n}</button>`).join("");
$("#fls").onclick=e=>{const b=e.target.closest("button");if(b){S.floor=+b.dataset.f;draw();focus()}};
function focus(){const s=S.route&&S.route.find(s=>s.f==S.floor);if(s&&s.pts.length>1){const xs=s.pts.map(p=>p[0]),ys=s.pts.map(p=>p[1]);view(Math.min(...xs)-140,Math.min(...ys)-140,Math.max(...xs)+140,Math.max(...ys)+140)}else fitAll()}
/* ---------- Routing ---------- */
const len=p=>p.reduce((t,q,i)=>i?t+Math.hypot(q[0]-p[i-1][0],q[1]-p[i-1][1]):t,0);
const L2=(r,l)=>r.blk&&r.blk==l.blk?[r.p[0],r.p[1],[l.x,l.y]]:[...r.p,[CX,l.y],[l.x,l.y]];
function buildRoute(a,b){
 if(a.f==b.f){if(a.blk&&a.blk==b.blk)return[{f:a.f,pts:[a.p[0],a.p[1],b.p[1],b.p[0]]}];return[{f:a.f,pts:[...a.p,...b.p.slice().reverse()]}]}
 const pool=LIFTS.filter(l=>(a.f<0||b.f<0||a.f==4||b.f==4)?l.blk!="C":true),cost=l=>len(L2(a,l))+len(L2(b,l));
 const l=pool.reduce((m,x)=>cost(x)<cost(m)?x:m),d=b.f>a.f?1:-1,s=[{f:a.f,pts:L2(a,l),lift:l}];
 for(let f=a.f+d;f!=b.f;f+=d)if(f!=0)s.push({f,pts:[[l.x,l.y]]});
 s.push({f:b.f,pts:L2(b,l).slice().reverse()});return s}
const fn=f=>f<0?"level −1":"floor "+f;
function go(){const res=$("#result");
 if(!S.to){S.route=null;draw();return}
 if(S.from===S.to){res.innerHTML='<div class="empty">You are already here. Pick another destination.</div>';S.route=null;draw();return}
 const a=S.from,b=S.to;S.route=buildRoute(a,b);
 const dist=Math.round(S.route.reduce((t,s)=>t+len(s.pts),0)*.2),fl=Math.abs(a.f-b.f)-(a.f*b.f<0?1:0),min=Math.max(1,Math.round((dist/1.2+fl*30)/60));
 const st=[`Leave ${a.name} and head to the main corridor`];
 if(a.f!=b.f)st.push(`Take the lift in the middle of the block ${b.f>a.f?"up":"down"} to ${fn(b.f)}`);
 st.push(`Follow the corridor to ${b.name}`,`You have arrived: ${b.name}, ${fn(b.f)}`);
 res.innerHTML=`<div class="sum"><b>${min} min</b><span>${dist} m${fl?` · ${fl} floor${fl>1?"s":""}`:""}</span></div>
 <div class="fl">${S.route.filter((s,i,r)=>s.pts.length>1).map(s=>`<button class="chip" data-f="${s.f}">${s.f<0?"Level −1":"Floor "+s.f}</button>`).join("")}</div>
 <ol class="steps">${st.map((t,i)=>`<li data-s="${i}"><em>${i+1}</em><span>${esc(t)}</span></li>`).join("")}</ol>`;
 S.floor=a.f;draw();focus()}
$("#result").onclick=e=>{const c=e.target.closest(".chip");if(c){S.floor=+c.dataset.f;draw();focus()}const l=e.target.closest("li");if(l&&S.route){S.floor=+l.dataset.s==0?S.from.f:S.to.f;draw();focus()}};
function setTo(r,stay){S.to=r;$("#to").value=r.name+" ("+fn(r.f)+")";if(!stay)showTab("route");go()}
function setFrom(r){S.from=r;$("#from").value=r.name+" ("+fn(r.f)+")";go()}
const STOP=/\b(where|is|the|a|an|how|do|i|to|get|go|find|need|show|me|way|path|route|can|are|located|location|of|in|at|please)\b/g;
const norm=s=>s.toLowerCase().replace(STOP,"").replace(/[?!.,]/g,"").replace(/\s+/g," ").trim();
function find(q){const raw=q.toLowerCase().trim();q=norm(q);if(!q)return ROOMS.filter(r=>!/^[A-I]\d/.test(r.name)).slice(0,8);const qc=q.replace(/\s/g,"");
 return ROOMS.map(r=>{const n=(r.name+" "+r.kw).toLowerCase(),nc=r.name.toLowerCase().replace(/\s/g,"");let s=0;
  if(nc==qc)s=9;else if(nc.startsWith(qc))s=6;else if(n.includes(q))s=4;else q.split(" ").forEach(w=>{if(w.length>2&&n.includes(w))s++});return{r,s}}).filter(x=>x.s).sort((a,b)=>b.s-a.s).map(x=>x.r)}
function bindSearch(inp,box,cb){
 const show=()=>{const l=find(inp.value).slice(0,7);box.innerHTML=l.map(r=>`<div data-id="${esc(r.id)}">${esc(r.name)}<span>${fn(r.f)}</span></div>`).join("")||'<div style="color:var(--mut)">Nothing found</div>';box.hidden=false};
 inp.addEventListener("input",show);inp.addEventListener("focus",()=>{inp.select();show()});
 inp.addEventListener("keydown",e=>{if(e.key=="Enter"){const r=find(inp.value)[0];if(r){cb(r);box.hidden=true;inp.blur()}}});
 box.addEventListener("mousedown",e=>{const d=e.target.closest("[data-id]");if(d){cb(ROOMS.find(r=>r.id==d.dataset.id));box.hidden=true}});
 inp.addEventListener("blur",()=>setTimeout(()=>box.hidden=true,150))}
bindSearch($("#from"),$("#sf"),setFrom);bindSearch($("#to"),$("#st"),setTo);
$("#from").value="Main Entrance (floor 1)";
const QUICK=["Library","Canteen","Market","Wi-Fi Zone","Red Hall","Student Service","SDU Store","Main Entrance","Men's Relax Room","Women's Relax Room","H Canteen","D110","F401"];
$("#quick").innerHTML=$("#gq").innerHTML=QUICK.map(n=>`<button class="chip" data-n="${esc(n)}">${esc(n)}</button>`).join("");
document.addEventListener("click",e=>{const c=e.target.closest("[data-n]");if(c)setTo(bestOf(find(c.dataset.n)[0]))});
$("#swap").onclick=()=>{if(!S.to)return;[S.from,S.to]=[S.to,S.from];$("#from").value=S.from.name+" ("+fn(S.from.f)+")";$("#to").value=S.to.name+" ("+fn(S.to.f)+")";go()};
