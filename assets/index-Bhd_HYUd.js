var R=Object.defineProperty;var N=(n,e,t)=>e in n?R(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var E=(n,e,t)=>N(n,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();const f="https://async-race-api-eh9l.onrender.com";async function q(n=1,e=7){const t=new URL(`${f}/garage`);t.searchParams.append("_page",String(n)),t.searchParams.append("_limit",String(e));const a=await fetch(t.toString());if(!a.ok)throw new Error(`HTTP error! status: ${a.status}`);const r=await a.json(),i=Number(a.headers.get("X-Total-Count"))||0;return{cars:r,total:i}}async function x(n,e){const t=await fetch(`${f}/garage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:n,color:e})});if(!t.ok)throw new Error(`Failed to create car: ${t.status}`);return t.json()}async function M(n){const e=await fetch(`${f}/garage/${n}`,{method:"DELETE"});if(!e.ok)throw new Error(`Failed to delete car: ${e.status}`)}async function j(n,e,t){const a=await fetch(`${f}/garage/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e,color:t})});if(!a.ok)throw new Error(`Failed to update car: ${a.status}`);return a.json()}async function O(n=100){const e=["Tesla","BMW","Mercedes","Audi","Ford","Toyota","Honda","Nissan","Volkswagen","Porsche","Ferrari","Lamborghini","Maserati","Jaguar","Bugatti","Lexus","Volvo","Hyundai","Kia","Subaru"],t=["Model S","X5","C-Class","A6","Mustang","Camry","Civic","GT-R","Golf","911","F40","Aventador","GranTurismo","F-Type","Veyron","RX","XC90","Sonata","Stinger","Outback"],a=[];for(let r=0;r<n;r++){const i=e[Math.floor(Math.random()*e.length)],s=t[Math.floor(Math.random()*t.length)],c=`${i} ${s}`,d=H();try{const o=await x(c,d);a.push(o)}catch(o){console.error(`Failed to create car #${r+1}:`,o)}}return a}function H(){const n="0123456789ABCDEF";let e="#";for(let t=0;t<6;t++)e+=n[Math.floor(Math.random()*16)];return e}async function X(n){const e=await fetch(`${f}/engine?id=${n}&status=started`,{method:"PATCH"});if(!e.ok)throw new Error(`Failed to start engine: ${e.status}`);return e.json()}async function T(n){const e=await fetch(`${f}/engine?id=${n}&status=stopped`,{method:"PATCH"});if(!e.ok)throw new Error(`Failed to stop engine: ${e.status}`)}async function G(n){const e=await fetch(`${f}/engine?id=${n}&status=drive`,{method:"PATCH"});if(!e.ok)throw e.status===500?new Error("Car engine broken!"):new Error(`Failed to switch to drive: ${e.status}`);return e.json()}async function _(n=1,e=10,t,a){const r=new URL(`${f}/winners`);r.searchParams.append("_page",String(n)),r.searchParams.append("_limit",String(e)),t&&(r.searchParams.append("_sort",t),r.searchParams.append("_order",a||"ASC"));const i=await fetch(r.toString());if(!i.ok)throw new Error(`Failed to get winners: ${i.status}`);const s=await i.json(),c=Number(i.headers.get("X-Total-Count"))||0;return{winners:await Promise.all(s.map(async o=>{try{const u=await fetch(`${f}/garage/${o.id}`);if(!u.ok)return{...o,name:`Car #${o.id}`,color:"#000000"};const l=await u.json();return{...o,name:l.name,color:l.color}}catch{return{...o,name:`Car #${o.id}`,color:"#000000"}}})),total:c}}async function D(n,e,t){const a=await fetch(`${f}/winners`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:n,wins:e,time:t})});if(!a.ok)throw new Error(`Failed to create winner: ${a.status}`);return a.json()}async function U(n,e,t){const a=await fetch(`${f}/winners/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({wins:e,time:t})});if(!a.ok)throw new Error(`Failed to update winner: ${a.status}`);return a.json()}async function V(n){try{const e=await fetch(`${f}/winners/${n}`);if(e.status===404)return null;if(!e.ok)throw new Error(`Failed to get winner: ${e.status}`);return e.json()}catch{return null}}class J{constructor(e=600){E(this,"animations",new Map);E(this,"trackWidth");this.trackWidth=e}setTrackWidth(e){e>50&&(this.trackWidth=e)}getTrackWidth(){return this.trackWidth}startAnimation(e,t,a,r){return new Promise((i,s)=>{if(this.animations.has(e)){s(new Error(`Car ${e} is already animating`));return}const c=r/a,d={id:e,element:t,startPosition:0,finishPosition:this.trackWidth,duration:c,startTime:null,animationId:null,isFinished:!1,isBroken:!1};this.animations.set(e,d);const o=performance.now();d.startTime=o;const u=l=>{const b=l-o,A=Math.min(b/c,1),W=A*this.trackWidth;t.style.transform=`translateX(${W}px)`,A<1&&!d.isBroken?d.animationId=requestAnimationFrame(u):(d.isFinished=!0,d.animationId=null,i())};d.animationId=requestAnimationFrame(u)})}stopAnimation(e){const t=this.animations.get(e);t&&(t.animationId!==null&&(cancelAnimationFrame(t.animationId),t.animationId=null),t.isFinished||(t.isBroken=!0))}resetCar(e){const t=this.animations.get(e);t&&(t.animationId!==null&&(cancelAnimationFrame(t.animationId),t.animationId=null),this.animations.delete(e));const a=document.querySelector(`.car-on-track[data-car-id="${e}"]`);a&&(a.style.transform="translateX(0px)",a.classList.remove("broken","finished"))}isCarFinished(e){const t=this.animations.get(e);return t?t.isFinished:!1}isCarBroken(e){const t=this.animations.get(e);return t?t.isBroken:!1}resetAll(){for(const[e,t]of this.animations){t.animationId!==null&&cancelAnimationFrame(t.animationId);const a=document.querySelector(`.car-on-track[data-car-id="${e}"]`);a&&(a.style.transform="translateX(0px)",a.classList.remove("broken","finished"))}this.animations.clear()}getActiveAnimations(){return Array.from(this.animations.keys())}getProgress(e){const t=this.animations.get(e);if(!t||t.startTime===null)return null;const a=performance.now()-t.startTime;return Math.min(a/t.duration,1)}markAsBroken(e){const t=this.animations.get(e);t&&(t.isBroken=!0,t.element.classList.add("broken"))}markAsFinished(e){const t=this.animations.get(e);t&&(t.isFinished=!0,t.element.classList.add("finished"))}}function z(n,e,t,a,r){const i=Math.ceil(e/10);return`
    <div class="winners-container">
      <header class="winners-header">
        <h2>🏆 Winners</h2>
        <span class="winners-count">Total: ${e}</span>
      </header>

      <div class="winners-table-wrapper">
        <table class="winners-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Car</th>
              <th>Name</th>
              <th 
                class="sortable ${a==="wins"?"active":""}"
                data-sort="wins"
              >
                Wins ${a==="wins"?r==="ASC"?"▲":"▼":""}
              </th>
              <th 
                class="sortable ${a==="time"?"active":""}"
                data-sort="time"
              >
                Best time (s) ${a==="time"?r==="ASC"?"▲":"▼":""}
              </th>
            </tr>
          </thead>
          <tbody>
            ${n.length===0?`
              <tr>
                <td colspan="5" class="empty">No winners yet. Start a race!</td>
              </tr>
            `:n.map((s,c)=>`
              <tr>
                <td>${(t-1)*10+c+1}</td>
                <td>
                  <span class="winner-color" style="background-color: ${s.color}"></span>
                </td>
                <td>${s.name}</td>
                <td>${s.wins}</td>
                <td>${s.time.toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="pagination winners-pagination">
        <button 
          class="btn-pagination" 
          id="winners-prev" 
          ${t<=1?"disabled":""}
        >
          ◀ Previous
        </button>
        <span class="page-info">Page ${t} of ${i||1}</span>
        <button 
          class="btn-pagination" 
          id="winners-next" 
          ${t>=i?"disabled":""}
        >
          Next ▶
        </button>
      </div>
    </div>
  `}function K(n,e,t,a){const r=document.getElementById("winners-prev"),i=document.getElementById("winners-next");r==null||r.addEventListener("click",()=>{var c,d;const s=document.getElementById("winners-page-info");if(s){const o=parseInt(((d=(c=s.textContent)==null?void 0:c.match(/\d+/))==null?void 0:d[0])||"1");o>1&&n(o-1)}}),i==null||i.addEventListener("click",()=>{var c,d;const s=document.getElementById("winners-page-info");if(s){const o=parseInt(((d=(c=s.textContent)==null?void 0:c.match(/\d+/))==null?void 0:d[0])||"1");n(o+1)}}),document.querySelectorAll(".sortable").forEach(s=>{s.addEventListener("click",()=>{const c=s.getAttribute("data-sort");if(!c)return;let d="ASC";t===c&&a==="ASC"&&(d="DESC"),e(c,d)})})}let p=[],L=0;const B=7;let m=1,y="garage",C=1,Q=0,w=null,v="ASC",$=!1,k=null;const g=new J(600);window.addEventListener("resize",()=>{const n=document.querySelector(".race-track");if(n){const e=n.clientWidth-40;e>50&&g.setTrackWidth(e)}});async function Y(){const n=document.getElementById("app");n&&(Z(n),await h(m))}function Z(n){n.innerHTML=`
    <div class="container">
      <header class="app-header">
        <h1>🏎️ Async Race</h1>
        <span class="stats">Total cars: <span id="total-cars">0</span></span>
      </header>

      <nav class="nav">
        <button class="active" data-view="garage">Garage</button>
        <button data-view="winners">Winners</button>
      </nav>

      <div id="view-container">
        ${P()}
      </div>
    </div>
  `,F()}function P(){return`
    <div id="garage-view">
      <div class="car-form">
        <h3>Create Car</h3>
        <input type="text" id="car-name" placeholder="Car name" />
        <input type="color" id="car-color" value="#007bff" />
        <button class="btn btn-primary" id="create-car-btn">Create</button>
        <button class="btn btn-secondary" id="cancel-edit-btn" style="display:none;">Cancel</button>
        <button class="btn btn-success" id="generate-cars-btn">🚀 Generate 100</button>
      </div>

      <!-- Кнопки для гонки -->
      <div class="race-controls">
        <button class="btn btn-race" id="start-race-btn">🏁 Start Race</button>
        <button class="btn btn-reset" id="reset-race-btn">🔄 Reset Race</button>
        <span id="race-status" class="race-status"></span>
      </div>

      <div id="car-list" class="car-list"></div>

      <div class="pagination">
        <button id="prev-page" disabled>◀ Previous</button>
        <span class="page-info" id="page-info">Page 1</span>
        <button id="next-page">Next ▶</button>
      </div>
    </div>
  `}function F(){var r,i,s,c,d;document.querySelectorAll(".nav button").forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(".nav button").forEach(l=>l.classList.remove("active")),o.classList.add("active"),o.dataset.view==="winners"?et():tt()})});const n=document.getElementById("create-car-btn"),e=document.getElementById("cancel-edit-btn"),t=document.getElementById("car-name"),a=document.getElementById("car-color");n==null||n.addEventListener("click",async()=>{const o=t.value.trim(),u=a.value;if(!o){alert("Please enter a car name");return}try{const l=n.dataset.editId;l?(await j(Number(l),o,u),delete n.dataset.editId,n.textContent="Create",e&&(e.style.display="none")):await x(o,u),t.value="",y==="garage"&&await h(m)}catch(l){console.error("Error saving car:",l),alert("Failed to save car")}}),e==null||e.addEventListener("click",()=>{const o=document.getElementById("create-car-btn");o&&(delete o.dataset.editId,o.textContent="Create"),t.value="",a.value="#007bff",e.style.display="none"}),(r=document.getElementById("prev-page"))==null||r.addEventListener("click",()=>{m>1&&(m--,h(m))}),(i=document.getElementById("next-page"))==null||i.addEventListener("click",()=>{m*B<L&&(m++,h(m))}),(s=document.getElementById("generate-cars-btn"))==null||s.addEventListener("click",async()=>{const o=document.getElementById("generate-cars-btn"),u=o.textContent;o.disabled=!0,o.textContent="⏳ Generating...";try{const l=await O(100);console.log(`✅ Generated ${l.length} cars`),m=1,y==="garage"&&await h(m),alert(`Successfully generated ${l.length} cars!`)}catch(l){console.error("Error generating cars:",l),alert("Failed to generate cars. Check console for details.")}finally{o.disabled=!1,o.textContent=u}}),(c=document.getElementById("start-race-btn"))==null||c.addEventListener("click",at),(d=document.getElementById("reset-race-btn"))==null||d.addEventListener("click",rt)}async function tt(){y="garage";const n=document.getElementById("view-container");n&&(n.innerHTML=P(),F(),await h(m))}async function et(){y="winners",await S(C)}async function h(n){if(y==="garage")try{const{cars:e,total:t}=await q(n,B);p=e,L=t,nt(e),it(n,t),st(t)}catch(e){console.error("Error loading cars:",e)}}function nt(n){const e=document.getElementById("car-list");if(e){if(n.length===0){e.innerHTML='<p class="empty">No cars in garage. Create one!</p>';return}e.innerHTML=`
    <div class="car-grid">
      ${n.map(t=>`
        <div class="car-card" data-id="${t.id}">
          <div class="car-info">
            <span class="car-color" style="background-color: ${t.color}"></span>
            <span class="car-name">${t.name}</span>
            <span class="car-id">#${t.id}</span>
          </div>
          <div class="car-actions">
            <button class="btn-delete" data-id="${t.id}">🗑️ Delete</button>
            <button class="btn-edit" data-id="${t.id}">✏️ Edit</button>
            <button class="btn-start" data-id="${t.id}">▶️ Start</button>
            <button class="btn-stop" data-id="${t.id}" disabled>⏹️ Stop</button>
          </div>
          <div class="race-track" data-car-id="${t.id}">
            <div class="track-road">
              <div class="car-on-track" data-car-id="${t.id}" style="transform: translateX(0px);">
                🏎️
              </div>
              <div class="finish-line"></div>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `,document.querySelectorAll(".btn-delete").forEach(t=>{t.addEventListener("click",async a=>{const r=Number(a.target.getAttribute("data-id"));if(confirm(`Delete car #${r}?`))try{g.resetCar(r),await M(r),await h(m)}catch(i){console.error("Error deleting car:",i),alert("Failed to delete car")}})}),document.querySelectorAll(".btn-edit").forEach(t=>{t.addEventListener("click",a=>{const r=Number(a.target.getAttribute("data-id")),i=p.find(s=>s.id===r);if(i){const s=document.getElementById("car-name"),c=document.getElementById("car-color"),d=document.getElementById("create-car-btn"),o=document.getElementById("cancel-edit-btn");s&&(s.value=i.name),c&&(c.value=i.color),d&&(d.textContent="Update",d.dataset.editId=String(i.id)),o&&(o.style.display="inline-block")}})}),document.querySelectorAll(".btn-start").forEach(t=>{t.addEventListener("click",async a=>{const r=Number(a.target.getAttribute("data-id")),i=a.target,s=document.querySelector(`.btn-stop[data-id="${r}"]`);try{await I(r)}catch(c){console.error(`Error starting car ${r}:`,c),i.textContent="❌ Error",s.disabled=!1}})}),document.querySelectorAll(".btn-stop").forEach(t=>{t.addEventListener("click",async a=>{const r=Number(a.target.getAttribute("data-id")),i=document.querySelector(`.btn-start[data-id="${r}"]`),s=a.target;s.disabled=!0,s.textContent="⏳ Stopping...";try{g.stopAnimation(r),await T(r),console.log(`⏹️ Car #${r} engine stopped`),g.resetCar(r),i.disabled=!1,i.textContent="▶️ Start",s.textContent="⏹️ Stop"}catch(c){console.error(`Error stopping car #${r}:`,c),alert("Failed to stop car")}finally{s.disabled=!1,s.textContent="⏹️ Stop"}})}),setTimeout(()=>{document.querySelectorAll(".race-track").forEach(t=>{const a=t.clientWidth-40;a>50&&a>g.getTrackWidth()&&g.setTrackWidth(a)})},100)}}function I(n){return new Promise(async(e,t)=>{const a=document.querySelector(`.btn-start[data-id="${n}"]`),r=document.querySelector(`.btn-stop[data-id="${n}"]`),i=document.querySelector(`.car-on-track[data-car-id="${n}"]`);if(!i){t(new Error(`Car ${n} not found`));return}a&&(a.disabled=!0,a.textContent="⏳ Racing..."),r&&(r.disabled=!0);try{const s=await X(n);console.log(`🚀 Car #${n} engine started:`,s);const c=s.distance/s.velocity/1e3;console.log(`⏱️ Car #${n} estimated time: ${c.toFixed(2)}s`);const d=document.querySelector(`.race-track[data-car-id="${n}"]`);if(d){const b=d.clientWidth-40;b>50&&g.setTrackWidth(b)}const o=g.startAnimation(n,i,s.velocity,s.distance),u=G(n);if((await Promise.allSettled([u,o]))[0].status==="rejected"){console.log(`💥 Car #${n} broken!`),g.markAsBroken(n),a&&(a.textContent="💥 Broken"),t(new Error(`Car ${n} broken`));return}console.log(`🏁 Car #${n} finished in ${c.toFixed(2)}s`),g.markAsFinished(n),a&&(a.textContent="✅ Finished"),e({id:n,time:c})}catch(s){console.error(`Error with car ${n}:`,s),a&&(a.textContent="❌ Error"),t(s)}finally{r&&(r.disabled=!1)}})}async function at(){if($)return;if(p.length===0){alert("No cars to race! Please add some cars first.");return}const n=document.getElementById("start-race-btn"),e=document.getElementById("reset-race-btn"),t=document.getElementById("race-status");$=!0,k=null,n.disabled=!0,e.disabled=!0,t&&(t.textContent="🏁 Race in progress...");try{const a=p.map(c=>I(c.id).then(d=>({...d,name:c.name})).catch(()=>null)),i=(await Promise.all(a)).filter(c=>c!==null);if(i.length===0){t&&(t.textContent="❌ No car finished the race!"),alert("❌ No car finished the race! All cars broken?");return}const s=i.sort((c,d)=>c.time-d.time)[0];k=s,await ot(s.id,s.time),t&&(t.textContent=`🏆 Winner: ${s.name} (${s.time.toFixed(2)}s)!`),alert(`🏆 Race finished! Winner: ${s.name}! (${s.time.toFixed(2)}s)`)}catch(a){console.error("Race error:",a),t&&(t.textContent="❌ Race failed!")}finally{$=!1,n.disabled=!1,e.disabled=!1}}async function rt(){if($){alert("Race is still running! Please wait.");return}const n=document.getElementById("reset-race-btn"),e=document.getElementById("race-status");n.disabled=!0,e&&(e.textContent="🔄 Resetting...");try{for(const t of p)try{g.resetCar(t.id),await T(t.id);const a=document.querySelector(`.btn-start[data-id="${t.id}"]`),r=document.querySelector(`.btn-stop[data-id="${t.id}"]`);a&&(a.disabled=!1,a.textContent="▶️ Start"),r&&(r.disabled=!0,r.textContent="⏹️ Stop");const i=document.querySelector(`.car-on-track[data-car-id="${t.id}"]`);i&&(i.style.transform="translateX(0px)",i.classList.remove("broken","finished"))}catch(a){console.error(`Error resetting car ${t.id}:`,a)}k=null,e&&(e.textContent="✅ All cars reset")}catch(t){console.error("Error resetting race:",t),e&&(e.textContent="❌ Reset failed!")}finally{n.disabled=!1}}function it(n,e){const t=document.getElementById("prev-page"),a=document.getElementById("next-page"),r=document.getElementById("page-info");t&&(t.disabled=n<=1),a&&(a.disabled=n*B>=e),r&&(r.textContent=`Page ${n}`)}function st(n){const e=document.getElementById("total-cars");e&&(e.textContent=String(n))}async function ot(n,e){try{const t=await V(n);if(t){const a=t.wins+1,r=Math.min(t.time,e);await U(n,a,r),console.log(`🏆 Updated winner #${n}: ${a} wins, best time ${r}s`)}else await D(n,1,e),console.log(`🏆 New winner #${n} with time ${e}s`)}catch(t){console.error("Error saving winner:",t)}}async function S(n=C){try{const{winners:e,total:t}=await _(n,10,w||void 0,v);Q=t,C=n;const a=document.getElementById("view-container");if(!a)return;a.innerHTML=z(e,t,n,w,v),K(r=>S(r),(r,i)=>{w=r,v=i,S(1)},w,v)}catch(e){console.error("Error loading winners:",e)}}Y();
