/* =====================================================================
   APP: tabs, login/sign up, events, friends, profile.
   Everything talks to the database only through `api` (see api.js).
   ===================================================================== */
function showTab(t){document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t==t));document.querySelectorAll(".pane").forEach(p=>p.classList.toggle("on",p.id=="p-"+t))}
document.querySelector(".tabs").onclick=e=>{const b=e.target.closest("button");if(b)showTab(b.dataset.t)};
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");setTimeout(()=>t.classList.remove("on"),2600)};

let ST={me:null,people:[],events:[],going:[],counts:{},friends:[],incoming:[],outgoing:[],attend:[]},events=[],LASTERR="";
const isAdmin=()=>!!ST.me&&ST.me.role=="admin";
const subl=u=>u.faculty+" · "+(u.role=="admin"?"Staff":"Year "+u.year);
async function refresh(){try{ST=await api.load();ST.attend=ST.attend||[];ST.events.forEach(v=>{v.room=ROOM_ALIAS[v.room]||v.room});LASTERR=""}catch(e){console.error(e);LASTERR=e.message||String(e);toast("Database error: "+LASTERR)}events=ST.events;renderAll()}
const need=m=>{toast(m||"Log in first");openAuth("login")};
const rn=id=>{const r=ROOMS.find(x=>x.id==id);return r?r.name+" · "+fn(r.f):"—"};
const fmt=d=>new Date(d+"T00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long"});

/* ---------- Login / sign up window (email + password) ---------- */
const dlg=$("#dlg");
function openAuth(m){setAuth(m||"login");dlg.showModal()}
function setAuth(m){$("#loginF").hidden=m!="login";$("#regF").hidden=m!="reg";document.querySelectorAll(".atab button").forEach(b=>b.classList.toggle("on",b.dataset.m==m));$("#aerr").textContent=""}
document.querySelector(".atab").onclick=e=>{const b=e.target.closest("button");if(b)setAuth(b.dataset.m)};
$("#dx").onclick=()=>dlg.close();
document.addEventListener("click",e=>{const a=e.target.closest("[data-auth]");if(a)openAuth(a.dataset.auth)});
$("#loginF").onsubmit=async e=>{e.preventDefault();const r=await api.signIn($("#lemail").value,$("#lpw").value);if(r.error){$("#aerr").textContent=r.error;return}
 $("#lpw").value="";await refresh();if(!ST.me){$("#aerr").textContent=LASTERR||"Logged in, but the profile could not be loaded.";return}dlg.close();toast("Welcome back, "+ST.me.name)};
$("#regF").onsubmit=async e=>{e.preventDefault();
 const o={name:$("#rname").value.trim(),email:$("#remail").value.trim().toLowerCase(),pw:$("#rpw").value,faculty:$("#rfac").value,year:+$("#ryear").value},er=$("#aerr");
 if(o.name.length<2){er.textContent="Enter your full name.";return}
 if(!/^\S+@\S+\.\S+$/.test(o.email)){er.textContent="Enter a valid email address.";return}
 if(o.pw.length<6){er.textContent="Password needs at least 6 characters.";return}
 const r=await api.signUp(o);await refresh();
 if(!ST.me){er.textContent=LASTERR||r.error||r.info||"Could not sign up.";return}
 dlg.close();showTab("profile");toast(r.error||"Account created. Welcome, "+ST.me.name)};
$("#me").onclick=()=>ST.me?showTab("profile"):openAuth("login");
function renderUser(){const u=ST.me;$("#me i").textContent=u?u.name[0].toUpperCase():"?";$("#me i").style.background=u?u.color:"var(--mut)";$("#me span").textContent=u?u.name.split(" ")[0]+(u.role=="admin"?" · admin":""):"Sign in"}

/* ---------- Events ---------- */
const goers=v=>{const w=ST.attend.filter(a=>a.event_id==v.id).map(a=>ST.people.find(p=>p.id==a.user_id)).filter(Boolean);
 return w.length?`<div class="mavs">${w.slice(0,6).map(p=>`<button class="mav" data-user="${p.id}" title="${esc(p.name)}" style="background:${p.color}">${esc(p.name[0])}</button>`).join("")}${w.length>6?`<span class="more">+${w.length-6}</span>`:""}</div>`:""};
function renderEvents(){const u=ST.me,admin=isAdmin();
 $("#evList").innerHTML=events.length?events.map(v=>`<article class="card"><span class="date">📅 ${fmt(v.d)}, ${v.tm}</span><h3>${esc(v.t)}</h3><p>${esc(v.desc)}</p><p style="margin-top:-4px">📍 ${esc(rn(v.room))}</p>
 <div class="row" style="margin:0"><button class="btn sm" data-map="${esc(v.room)}">Get directions</button><button class="btn sm sec" data-go="${v.id}">${ST.going.includes(v.id)?"✓ Going":"I’m going"}</button>${admin?`<button class="btn sm sec" data-del="${v.id}" style="margin-left:auto">Delete</button>`:""}</div>
 <small style="color:var(--mut);display:block;margin-top:8px">${ST.counts[v.id]||0} going${v.byName?" · by "+esc(v.byName):""}</small>${goers(v)}</article>`).join(""):'<div class="empty">No events yet</div>';
 $("#evAdmin").innerHTML=admin?`<h3 style="margin:8px 0">Create an event<span class="badge">admin</span></h3><form class="frm" id="ef">
 <input name="t" placeholder="Title" required><div style="display:flex;gap:8px"><input name="d" type="date" required><input name="tm" type="time" required></div>
 <select name="room">${ROOMS.map(r=>`<option value="${esc(r.id)}">${esc(r.name)} · ${fn(r.f)}</option>`).join("")}</select><textarea name="desc" rows="2" placeholder="Description"></textarea>
 <button class="btn">Publish event</button></form>`:`<p class="empty" style="padding:8px">${u?"Only admins can create events.":"Log in to join events. Only admins can create them."}</p>`;
 const f=$("#ef");if(f)f.onsubmit=async e=>{e.preventDefault();const o=Object.fromEntries(new FormData(f));const r=await api.createEvent(o,ST.me);if(r.error){toast(r.error);return}await refresh();toast("Event published")}}
$("#evList").onclick=async e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.user)return openUser(b.dataset.user);
 if(b.dataset.map)setTo(ROOMS.find(r=>r.id==b.dataset.map));
 if(b.dataset.go){if(!ST.me)return need("Log in to join events");const id=isNaN(b.dataset.go)?b.dataset.go:+b.dataset.go,r=await api.toggleGoing(id,ST.going.includes(id),ST.me);if(r.error)toast(r.error);await refresh()}
 if(b.dataset.del){const id=isNaN(b.dataset.del)?b.dataset.del:+b.dataset.del,r=await api.deleteEvent(id);toast(r.error||"Event deleted");await refresh()}};

/* ---------- Friends (people become friends only after the other person accepts) ---------- */
const people=()=>ST.people.filter(p=>!ST.me||p.id!=ST.me.id);
const fbtn=p=>{const id=p.id;
 if(ST.friends.includes(id))return`<button class="btn sm sec" data-fa="remove" data-id="${id}">Unfriend</button>`;
 if(ST.incoming.includes(id))return`<button class="btn sm" data-fa="accept" data-id="${id}">Accept</button><button class="btn sm sec" data-fa="decline" data-id="${id}">Decline</button>`;
 if(ST.outgoing.includes(id))return`<button class="btn sm sec" data-fa="cancel" data-id="${id}">Cancel request</button>`;
 return`<button class="btn sm" data-fa="send" data-id="${id}">Add friend</button>`};
const frow=p=>`<div class="person"><button class="plink" data-user="${p.id}"><i style="background:${p.color}">${esc(p.name[0])}</i><span><b>${esc(p.name)}</b><small>${esc(subl(p))}${ST.outgoing.includes(p.id)?" · request sent":""}${ST.incoming.includes(p.id)?" · wants to be your friend":""}</small></span></button><span class="fb">${fbtn(p)}</span></div>`;
function renderFriends(){const u=ST.me,q=$("#fq").value.toLowerCase(),all=people(),rank=p=>ST.incoming.includes(p.id)?0:ST.friends.includes(p.id)?1:ST.outgoing.includes(p.id)?2:3;
 const reqs=all.filter(p=>ST.incoming.includes(p.id)),list=all.filter(p=>p.name.toLowerCase().includes(q)&&!ST.incoming.includes(p.id)).sort((a,b)=>rank(a)-rank(b));
 document.querySelector('.tabs [data-t=friends]').innerHTML="Friends"+(reqs.length?` <span class="nb">${reqs.length}</span>`:"");
 $("#frList").innerHTML=(u?`<p style="color:var(--mut);margin:4px 0">Friends: <b>${ST.friends.length}</b></p>`:`<div class="card"><p style="margin:0">Log in to add friends. <button class="chip" data-auth="login">Log in</button></p></div>`)
  +(reqs.length?`<h3 style="margin:12px 0 2px;font-size:15px">Friend requests <span class="nb">${reqs.length}</span></h3>`+reqs.map(frow).join(""):"")
  +(reqs.length&&list.length?`<h3 style="margin:16px 0 2px;font-size:15px">Students</h3>`:"")+list.map(frow).join("")}
$("#fq").oninput=renderFriends;
const udlg=$("#udlg");
async function friendAct(act,id){if(!ST.me)return need("Log in to add friends");const r=await api.friend(act,id,ST.me);if(r.error)return toast(r.error);await refresh();if(udlg.open)openUser(id);
 toast({send:"Friend request sent",accept:"You are now friends",decline:"Request declined",cancel:"Request cancelled",remove:"Removed from friends"}[act])}
$("#frList").onclick=e=>{const u=e.target.closest("[data-user]");if(u)return openUser(u.dataset.user);const b=e.target.closest("[data-fa]");if(b)friendAct(b.dataset.fa,b.dataset.id)};

/* ---------- Other people's profiles (public: name, faculty, year, bio, avatar, events they join; e-mails stay private) ---------- */
function openUser(id){if(!ST.me)return need("Log in to see profiles");const p=ST.people.find(x=>x.id==id);if(!p)return;
 if(p.id==ST.me.id){if(udlg.open)udlg.close();showTab("profile");return}
 const going=events.filter(v=>ST.attend.some(a=>a.event_id==v.id&&a.user_id==id));
 const rel=ST.friends.includes(id)?"You are friends":ST.incoming.includes(id)?"Wants to be your friend":ST.outgoing.includes(id)?"Request sent":"";
 $("#ubody").innerHTML=`<div class="pf"><i class="av" style="background:${p.color}">${esc(p.name[0].toUpperCase())}</i><div><h2>${esc(p.name)}${p.role=="admin"?'<span class="badge">admin</span>':""}</h2><small>${esc(subl(p))}</small>${isAdmin()&&p.email?`<small>${esc(p.email)}</small>`:""}${rel?`<small>${rel}</small>`:""}</div></div>
 <p class="bio">${p.bio?esc(p.bio):"No bio yet."}</p><div class="row fb" style="justify-content:flex-start">${fbtn(p)}</div>
 <h3 style="margin:14px 0 4px;font-size:15px">Going to</h3>${going.length?going.map(v=>`<div class="mini"><div><b>${esc(v.t)}</b><small>${fmt(v.d)}, ${v.tm} · ${esc(rn(v.room))}</small></div></div>`).join(""):'<p style="color:var(--mut)">No events yet.</p>'}`;
 if(!udlg.open)udlg.showModal()}
$("#udx").onclick=()=>udlg.close();
$("#ubody").onclick=e=>{const b=e.target.closest("[data-fa]");if(b)friendAct(b.dataset.fa,b.dataset.id)};

/* ---------- Profile ---------- */
const opts=(l,v)=>l.map(x=>`<option${x==v?" selected":""}>${esc(x)}</option>`).join("");
function renderProfile(){const u=ST.me,el=$("#p-profile");
 if(!u){el.innerHTML=`<div class="empty">Log in to see your profile, join events and add friends.<div class="row" style="justify-content:center;margin-top:14px"><button class="btn sm" data-auth="login">Log in</button><button class="btn sm sec" data-auth="reg">Sign up</button></div></div>`;return}
 const going=events.filter(v=>ST.going.includes(v.id)),mine=events.filter(v=>v.by==u.id),admin=u.role=="admin";
 el.innerHTML=`<div class="pf"><i class="av" style="background:${u.color}">${esc(u.name[0].toUpperCase())}</i><div><h2>${esc(u.name)}<span class="badge">${admin?"admin":"member"}</span></h2><small>${esc(u.email||"")}</small><small>${esc(subl(u))}</small></div></div>
 ${u.bio?`<p class="bio">${esc(u.bio)}</p>`:""}
 <div class="stats"><div><b>${ST.friends.length}</b>Friends</div><div><b>${going.length}</b>Going</div>${admin?`<div><b>${mine.length}</b>Created</div>`:""}</div>
 ${admin?`<button class="btn" data-tab="events" style="margin-bottom:6px">+ Create an event</button>`:""}
 <h3>My events</h3>${going.length?going.map(v=>`<div class="mini"><div><b>${esc(v.t)}</b><small>${fmt(v.d)}, ${v.tm} · ${esc(rn(v.room))}</small></div><button class="btn sm sec" data-map="${esc(v.room)}">Directions</button></div>`).join(""):'<p style="color:var(--mut)">Join an event and it appears here.</p>'}
 <h3>Edit profile</h3><form class="frm" id="pfF"><input name="name" value="${esc(u.name)}" required><select name="faculty">${opts(FAC,u.faculty)}</select>${admin?"":`<select name="year">${[1,2,3,4].map(y=>`<option value="${y}"${y==u.year?" selected":""}>Year ${y}</option>`).join("")}</select>`}
 <textarea name="bio" rows="2" placeholder="About me">${esc(u.bio)}</textarea><div class="sw">${COLORS.map(c=>`<button type="button" data-color="${c}" class="${c==u.color?"on":""}" style="background:${c}" aria-label="Avatar colour"></button>`).join("")}</div><button class="btn">Save profile</button></form>
 ${admin?`<h3>People</h3>${ST.people.filter(p=>!p.seed).map(x=>`<div class="mini"><div><button class="plink2" data-user="${x.id}"><b>${esc(x.name)}</b></button> <span class="badge">${x.role}</span><small>${esc(x.email||"")}</small></div></div>`).join("")}`:""}
 <button class="btn sec" id="logout" style="margin-top:18px">Log out</button>`}
$("#p-profile").onclick=async e=>{const u=ST.me;if(!u)return;const uu=e.target.closest("[data-user]");if(uu)return openUser(uu.dataset.user);const c=e.target.closest("[data-color]"),m=e.target.closest("[data-map]"),t=e.target.closest("[data-tab]");
 if(c){await api.updateProfile({color:c.dataset.color},u);await refresh()}
 if(e.target.closest("#logout")){await api.signOut();ST={...ST,me:null,people:[],going:[],friends:[],incoming:[],outgoing:[]};showTab("route");await refresh();toast("Logged out")}
 if(m)setTo(ROOMS.find(q=>q.id==m.dataset.map));
 if(t)showTab(t.dataset.tab)};
$("#p-profile").onsubmit=async e=>{e.preventDefault();const u=ST.me,o=Object.fromEntries(new FormData(e.target));if(!u)return;
 const p={name:(o.name||"").trim()||u.name,faculty:o.faculty,bio:(o.bio||"").trim()};if(o.year)p.year=+o.year;
 const r=await api.updateProfile(p,u);toast(r.error||"Profile saved");await refresh()};
function renderAll(){renderUser();renderEvents();renderFriends();renderProfile()}

/* ---------- Start ---------- */
addEventListener("resize",fitAll);
document.querySelector(".hint").innerHTML=api.mode=="supabase"?"Log in with your email and password. Admins are chosen by the site owner in the database.":"Demo accounts — admin: admin@sdu.edu.kz / admin123 · student: student@sdu.edu.kz / student123. In demo mode only the demo admin can create events.";
draw();fitAll();renderAll();
api.init().then(refresh);
