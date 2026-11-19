/* =====================================================================
   DATA LAYER. Two versions with the same functions:
   - supaApi  = real shared database (Supabase)  -> used when config.js has keys
   - localApi = demo mode, data stays in this browser
   ===================================================================== */
const FAC=["Engineering & Natural Sciences","Law & Social Sciences","Education & Humanities","Business School"];
const COLORS=["#2f6bff","#1db93c","#f59e0b","#8b5cf6","#ec4899","#0ea5e9","#ef4444"];
const cfg=window.SDU_CONFIG||{};
const useDB=!!(cfg.supabaseUrl&&cfg.supabaseKey&&window.supabase);
if(cfg.supabaseUrl&&!window.supabase)console.warn("Supabase library did not load - running in demo mode.");

/* ---------- Supabase (real database) ---------- */
const supaApi=useDB?(()=>{
 const sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey);
 const fail=r=>r.error?{error:r.error.message}:{};
 return{mode:"supabase",
  async init(){},
  async signUp(o){
   const{data,error}=await sb.auth.signUp({email:o.email,password:o.pw,options:{data:{name:o.name,faculty:o.faculty,year:o.year}}});
   if(error)return{error:error.message};
   if(!data.session)return{info:"Check your email and click the confirmation link, then log in."};
   if(o.role=="admin"){const r=await sb.rpc("claim_admin",{code:o.code});if(r.error)return{error:r.error.message};if(!r.data)return{error:"Wrong admin code. Your account was created as a member."}}
   return{}},
  async signIn(email,pw){return fail(await sb.auth.signInWithPassword({email,password:pw}))},
  async signOut(){await sb.auth.signOut()},
  async load(){
   const{data:{session}}=await sb.auth.getSession(),uid=session?session.user.id:null;
   const[ev,at]=await Promise.all([sb.from("events").select("*").order("event_date").order("event_time"),sb.from("event_attendees").select("event_id,user_id")]);
   let people=[],me=null,friends=[];
   if(uid){
    const[pr,ro,fr]=await Promise.all([sb.from("profiles").select("*"),sb.from("user_roles").select("*"),sb.from("friendships").select("friend_id").eq("user_id",uid)]);
    const role=Object.fromEntries((ro.data||[]).map(r=>[r.user_id,r.role]));
    people=(pr.data||[]).map(p=>({id:p.id,name:p.name,email:p.email,faculty:p.faculty||"",year:p.year||1,bio:p.bio||"",color:p.color,role:role[p.id]||"member"}));
    me=people.find(p=>p.id==uid)||null;friends=(fr.data||[]).map(r=>r.friend_id)}
   const events=(ev.data||[]).map(e=>({id:e.id,t:e.title,d:e.event_date,tm:String(e.event_time).slice(0,5),room:e.room,desc:e.description,by:e.created_by,byName:e.created_by_name}));
   const rows=at.data||[],counts={};rows.forEach(a=>counts[a.event_id]=(counts[a.event_id]||0)+1);
   return{me,people,events,going:rows.filter(a=>a.user_id==uid).map(a=>a.event_id),counts,friends}},
  async createEvent(o,me){return fail(await sb.from("events").insert({title:o.t.trim(),event_date:o.d,event_time:o.tm,room:o.room,description:(o.desc||"").trim(),created_by_name:me.name}))},
  async deleteEvent(id){return fail(await sb.from("events").delete().eq("id",id))},
  async toggleGoing(id,isGoing,me){return fail(isGoing?await sb.from("event_attendees").delete().eq("event_id",id).eq("user_id",me.id):await sb.from("event_attendees").insert({event_id:id,user_id:me.id}))},
  async toggleFriend(fid,isFriend,me){return fail(isFriend?await sb.from("friendships").delete().eq("user_id",me.id).eq("friend_id",fid):await sb.from("friendships").insert({user_id:me.id,friend_id:fid}))},
  async updateProfile(p,me){return fail(await sb.from("profiles").update(p).eq("id",me.id))},
  async setRole(target,role){return fail(await sb.rpc("set_role",{target,new_role:role}))}}
})():null;

/* ---------- Demo mode (this browser only) ---------- */
const localApi=(()=>{
 const SEED=[["Aidana Nurlanova","Computer Science",2],["Timur Serikov","Business",3],["Dana Kassymova","Philology",1],["Arman Zhumabekov","Engineering",4],["Madina Omarova","Psychology",2],["Yerlan Bakhtiyarov","Computer Science",3],["Aliya Tolegen","International Relations",1]];
 const DEMO=[{id:1,t:"Open Day",d:"2026-11-20",tm:"11:00",room:"1:Barrel E",desc:"Meet the faculties and tour the labs.",byName:"SDU Admin"},
  {id:2,t:"Career Fair",d:"2026-11-25",tm:"14:00",room:"1:Canteen",desc:"Companies from Almaty are hiring interns and graduates.",byName:"SDU Admin"},
  {id:3,t:"Chess Tournament",d:"2026-12-02",tm:"16:30",room:"2:Barrel F",desc:"Open tournament for students of every year.",byName:"SDU Admin"}];
 let users=store.get("sdu4_users",[]),sid=store.get("sdu4_session",null),evs=store.get("sdu4_events",DEMO);
 const saveU=()=>store.set("sdu4_users",users),saveE=()=>store.set("sdu4_events",evs);
 const cur=()=>users.find(u=>u.id==sid)||null,adm=()=>{const u=cur();return !!u&&u.role=="admin"};
 const pub=u=>({id:u.id,name:u.name,email:u.email,role:u.role,faculty:u.faculty,year:u.year,bio:u.bio,color:u.color});
 async function hashPw(pw,salt){const s=salt+pw;try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch(e){let h=5381;for(const c of s)h=((h<<5)+h+c.charCodeAt(0))|0;return"f"+h}}
 async function mk(o){const salt=Math.random().toString(36).slice(2),u={id:"u"+Date.now()+Math.random().toString(36).slice(2,6),name:o.name,email:o.email,salt,hash:await hashPw(o.pw,salt),role:o.role,faculty:o.faculty,year:o.year,bio:"",color:COLORS[users.length%COLORS.length],friends:[],going:[]};users.push(u);saveU();return u}
 return{mode:"local",
  async init(){
   if(!users.some(u=>u.email=="admin@sdu.edu.kz"))await mk({name:"SDU Admin",email:"admin@sdu.edu.kz",pw:"admin123",role:"admin",faculty:FAC[3],year:4});
   if(!users.some(u=>u.email=="student@sdu.edu.kz"))await mk({name:"Demo Student",email:"student@sdu.edu.kz",pw:"student123",role:"member",faculty:FAC[0],year:2})},
  async signUp(o){
   if(users.some(u=>u.email==o.email))return{error:"This email is already registered. Log in instead."};
   if(o.role=="admin"&&o.code!="SDU-admin")return{error:"Wrong admin code."};
   sid=(await mk(o)).id;store.set("sdu4_session",sid);return{}},
  async signIn(email,pw){const u=users.find(x=>x.email==email.trim().toLowerCase());if(!u||u.hash!=await hashPw(pw,u.salt))return{error:"Wrong email or password."};sid=u.id;store.set("sdu4_session",sid);return{}},
  async signOut(){sid=null;store.set("sdu4_session",null)},
  async load(){const u=cur(),counts={};users.forEach(x=>x.going.forEach(i=>counts[i]=(counts[i]||0)+1));
   return{me:u?pub(u):null,events:evs,counts,going:u?u.going:[],friends:u?u.friends:[],
    people:[...SEED.map((p,i)=>({id:"s"+i,name:p[0],faculty:p[1],year:p[2],role:"member",color:COLORS[i%7],bio:"",email:"",seed:true})),...users.map(pub)]}},
  async createEvent(o,me){if(!adm())return{error:"Only admins can create events."};evs.push({id:Date.now(),t:o.t.trim(),d:o.d,tm:o.tm,room:o.room,desc:(o.desc||"").trim(),by:me.id,byName:me.name});evs.sort((a,b)=>(a.d+a.tm).localeCompare(b.d+b.tm));saveE();return{}},
  async deleteEvent(id){if(!adm())return{error:"Only admins can delete events."};evs=evs.filter(v=>v.id!=id);users.forEach(x=>x.going=x.going.filter(i=>i!=id));saveU();saveE();return{}},
  async toggleGoing(id,isGoing){const u=cur();if(!u)return{error:"Log in first."};u.going=isGoing?u.going.filter(x=>x!=id):[...u.going,id];saveU();return{}},
  async toggleFriend(fid,isFriend){const u=cur();if(!u)return{error:"Log in first."};u.friends=isFriend?u.friends.filter(x=>x!=fid):[...u.friends,fid];saveU();return{}},
  async updateProfile(p){const u=cur();if(!u)return{error:"Log in first."};Object.assign(u,p);saveU();return{}},
  async setRole(target,role){if(!adm())return{error:"Only admins can change roles."};const x=users.find(q=>q.id==target);if(x){x.role=role;saveU()}return{}}}
})();

const api=useDB?supaApi:localApi;
