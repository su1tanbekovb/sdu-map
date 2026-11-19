/* =====================================================================
   APP: tabs, login/sign up, events, friends, profile.
   Everything talks to the database only through `api` (see api.js).
   ===================================================================== */
function showTab(t){document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t==t));document.querySelectorAll(".pane").forEach(p=>p.classList.toggle("on",p.id=="p-"+t))}
document.querySelector(".tabs").onclick=e=>{const b=e.target.closest("button");if(b)showTab(b.dataset.t)};
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");setTimeout(()=>t.classList.remove("on"),2600)};
document.addEventListener("click",e=>{const t=e.target.closest("[data-tab]");if(t)showTab(t.dataset.tab)});

let ST={me:null,people:[],events:[],going:[],counts:{},friends:[]},events=[];
const me=()=>ST.me,isAdmin=()=>!!ST.me&&ST.me.role=="admin";
const subl=u=>u.faculty+" · "+(u.role=="admin"?"Staff":"Year "+u.year);
async function refresh(){try{ST=await api.load();events=ST.events}catch(e){console.error(e);toast("Could not reach the database")}renderAll()}
const need=m=>{toast(m||"Log in first");openAuth("login")};
const rn=id=>{const r=ROOMS.find(x=>x.id==id);return r?r.name+" · "+fn(r.f):"—"};
const fmt=d=>new Date(d+"T00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long"});

/* ---------- Login / sign up window ---------- */
const dlg=$("#dlg");
function openAuth(m){setAuth(m||"login");dlg.showModal()}
function setAuth(m){$("#loginF").hidden=m!="login";$("#regF").hidden=m!="reg";document.querySelectorAll(".atab button").forEach(b=>b.classList.toggle("on",b.dataset.m==m));$("#aerr").textContent=""}
document.querySelector(".atab").onclick=e=>{const b=e.target.closest("button");if(b)setAuth(b.dataset.m)};
$("#dx").onclick=()=>dlg.close();
$("#rrole").onchange=e=>$("#rcode").hidden=e.target.value!="admin";
document.addEventListener("click",e=>{const a=e.target.closest("[data-auth]");if(a)openAuth(a.dataset.auth)});
$("#loginF").onsubmit=async e=>{e.preventDefault();const r=await api.signIn($("#lemail").value,$("#lpw").value);if(r.error){$("#aerr").textContent=r.error;return}dlg.close();$("#lpw").value="";await refresh();toast("Welcome back, "+ST.me.name)};
$("#regF").onsubmit=async e=>{e.preventDefault();
 const o={name:$("#rname").value.trim(),email:$("#remail").value.trim().toLowerCase(),pw:$("#rpw").value,faculty:$("#rfac").value,year:+$("#ryear").value,role:$("#rrole").value,code:$("#rcode").value},er=$("#aerr");
 if(o.name.length<2){er.textContent="Enter your full name.";return}
 if(!/^\S+@\S+\.\S+$/.test(o.email)){er.textContent="Enter a valid email address.";return}
 if(o.pw.length<6){er.textContent="Password needs at least 6 characters.";return}
 if(o.role=="admin"&&!o.code){er.textContent="Enter the admin code.";return}
 const r=await api.signUp(o);await refresh();
 if(!ST.me){er.textContent=r.error||r.info||"Could not sign up.";return}
 dlg.close();showTab("profile");toast(r.error||"Account created. Welcome, "+ST.me.name)};
$("#me").onclick=()=>ST.me?showTab("profile"):openAuth("login");
function renderUser(){const u=ST.me;$("#me i").textContent=u?u.name[0].toUpperCase():"?";$("#me i").style.background=u?u.color:"var(--mut)";$("#me span").textContent=u?u.name.split(" ")[0]+(u.role=="admin"?" · admin":""):"Sign in"}

/* ---------- Events ---------- */
function renderEvents(){const u=ST.me,admin=isAdmin();
 $("#evList").innerHTML=events.length?events.map(v=>`<article class="card"><span class="date">📅 ${fmt(v.d)}, ${v.tm}</span><h3>${esc(v.t)}</h3><p>${esc(v.desc)}</p><p style="margin-top:-4px">📍 ${esc(rn(v.room))}</p>
 <div class="row" style="margin:0"><button class="btn sm" data-map="${esc(v.room)}">Get directions</button><button class="btn sm sec" data-go="${v.id}">${ST.going.includes(v.id)?"✓ Going":"I’m going"}</button>${admin?`<button class="btn sm sec" data-del="${v.id}" style="margin-left:auto">Delete</button>`:""}</div>
 <small style="color:var(--mut);display:block;margin-top:8px">${ST.counts[v.id]||0} going${v.byName?" · by "+esc(v.byName):""}</small></article>`).join(""):'<div class="empty">No events yet</div>';
 $("#evAdmin").innerHTML=admin?`<h3 style="margin:8px 0">Create an event<span class="badge">admin</span></h3><form class="frm" id="ef">
 <input name="t" placeholder="Title" required><div style="display:flex;gap:8px"><input name="d" type="date" required><input name="tm" type="time" required></div>
 <select name="room">${ROOMS.map(r=>`<option value="${esc(r.id)}">${esc(r.name)} · ${fn(r.f)}</option>`).join("")}</select><textarea name="desc" rows="2" placeholder="Description"></textarea>
 <button class="btn">Publish event</button></form>`:`<p class="empty" style="padding:8px">${u?"Only admins can create events.":"Log in to join events. Only admins can create them."}</p>`;
 const f=$("#ef");if(f)f.onsubmit=async e=>{e.preventDefault();const o=Object.fromEntries(new FormData(f));const r=await api.createEvent(o,ST.me);if(r.error){toast(r.error);return}await refresh();toast("Event published")}}
$("#evList").onclick=async e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.map)setTo(ROOMS.find(r=>r.id==b.dataset.map));
 if(b.dataset.go){if(!ST.me)return need("Log in to join events");const id=isNaN(b.dataset.go)?b.dataset.go:+b.dataset.go,r=await api.toggleGoing(id,ST.going.includes(id),ST.me);if(r.error)toast(r.error);await refresh()}
 if(b.dataset.del){const id=isNaN(b.dataset.del)?b.dataset.del:+b.dataset.del,r=await api.deleteEvent(id);toast(r.error||"Event deleted");await refresh()}};

/* ---------- Friends ---------- */
const people=()=>ST.people.filter(p=>!ST.me||p.id!=ST.me.id);
function renderFriends(){const u=ST.me,q=$("#fq").value.toLowerCase(),fr=ST.friends;
 const list=people().filter(p=>p.name.toLowerCase().includes(q)).sort((a,b)=>fr.includes(b.id)-fr.includes(a.id));
 $("#frList").innerHTML=(u?`<p style="color:var(--mut);margin:4px 0">Friends: <b>${fr.length}</b></p>`:`<div class="card"><p style="margin:0">Log in to add friends. <button class="chip" data-auth="login">Log in</button></p></div>`)+list.map(p=>`<div class="person"><i style="background:${p.color}">${esc(p.name[0])}</i><div><b>${esc(p.name)}</b><small>${esc(subl(p))}</small></div><button class="btn sm ${fr.includes(p.id)?"sec":""}" data-fr="${p.id}">${fr.includes(p.id)?"Friends":"Add friend"}</button></div>`).join("")}
$("#fq").oninput=renderFriends;
$("#frList").onclick=async e=>{const b=e.target.closest("[data-fr]");if(!b)return;if(!ST.me)return need("Log in to add friends");const id=b.dataset.fr,had=ST.friends.includes(id),r=await api.toggleFriend(id,had,ST.me);if(r.error)return toast(r.error);await refresh();toast(had?"Removed from friends":"Friend added")};

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
 ${admin?`<h3>People</h3>${ST.people.filter(p=>!p.seed).map(x=>`<div class="mini"><div><b>${esc(x.name)}</b> <span class="badge">${x.role}</span><small>${esc(x.email||"")}</small></div>${x.id==u.id?"":`<button class="btn sm sec" data-role="${x.id}">${x.role=="admin"?"Make member":"Make admin"}</button>`}</div>`).join("")}`:""}
 <button class="btn sec" id="logout" style="margin-top:18px">Log out</button>`}
$("#p-profile").onclick=async e=>{const u=ST.me;if(!u)return;const c=e.target.closest("[data-color]"),r=e.target.closest("[data-role]"),m=e.target.closest("[data-map]");
 if(c){await api.updateProfile({color:c.dataset.color},u);await refresh()}
 if(r&&isAdmin()){const x=ST.people.find(q=>q.id==r.dataset.role);if(x){const nr=x.role=="admin"?"member":"admin",res=await api.setRole(x.id,nr);toast(res.error||x.name+" is now "+nr);await refresh()}}
 if(e.target.closest("#logout")){await api.signOut();await refresh();showTab("route");toast("Logged out")}
 if(m)setTo(ROOMS.find(q=>q.id==m.dataset.map))};
$("#p-profile").onsubmit=async e=>{e.preventDefault();const u=ST.me,o=Object.fromEntries(new FormData(e.target));if(!u)return;
 const p={name:(o.name||"").trim()||u.name,faculty:o.faculty,bio:(o.bio||"").trim()};if(o.year)p.year=+o.year;
 const r=await api.updateProfile(p,u);toast(r.error||"Profile saved");await refresh()};
function renderAll(){renderUser();renderEvents();renderFriends();renderProfile()}

/* ---------- Start ---------- */
addEventListener("resize",fitAll);
if(api.mode=="supabase")document.querySelector(".hint").innerHTML="Your account is saved in the school database. Admin sign-up needs the admin code from the site owner.";
draw();fitAll();renderAll();
api.init().then(refresh);
