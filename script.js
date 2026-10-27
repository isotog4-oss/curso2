/* ===== Configuración: pon aquí los enlaces de tus 3 videos ===== */
/* YouTube: https://www.youtube.com/embed/ID_DEL_VIDEO   ·   Drive: https://drive.google.com/file/d/ID/preview */
const VIDEOS=[
 {titulo:"🎬 Video 1: Suma de Riemann (rectángulos)",https://youtu.be/OAElUFRmQDI:""},
 {titulo:"🎬 Video 2: Área con la integral definida",url:""},
 {titulo:"🎬 Video 3: Área entre dos curvas",url:""}
];
const $=id=>document.getElementById(id);
const FUNCS={"x²":x=>x*x,"x³−2x+3":x=>x**3-2*x+3,"sen(x)+1.5":x=>Math.sin(x)+1.5,"√x":x=>Math.sqrt(Math.max(x,0)),"e^(x/2)":x=>Math.exp(x/2),"1/(1+x²)":x=>1/(1+x*x)};
const CS={type:"axis",field:"cF"};
/* Integral numérica precisa (Simpson) */
function simpson(f,a,b,n=2000){if(a===b)return 0;const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=f(a+i*h)*(i%2?4:2);return s*h/3}

/* Dibujo genérico: curvas, rangos y relleno */
function plot(cv,o){
 const c=cv.getContext("2d"),W=cv.width,H=cv.height,p=34;
 const css=getComputedStyle(document.body),ink=css.color;
 c.clearRect(0,0,W,H);
 let xs=o.xmin,xe=o.xmax,ys=o.ymin,ye=o.ymax;
 const X=x=>p+(x-xs)/(xe-xs)*(W-2*p),Y=y=>H-p-(y-ys)/(ye-ys)*(H-2*p);
 c.lineWidth=1;c.strokeStyle="rgba(128,140,160,.25)";c.fillStyle=ink;c.font="12px sans-serif";
 for(let x=Math.ceil(xs);x<=xe;x+=o.gx||1){c.beginPath();c.moveTo(X(x),p/2);c.lineTo(X(x),H-p);c.stroke();c.fillText(+x.toFixed(2),X(x)-6,H-p+14)}
 for(let y=Math.ceil(ys);y<=ye;y+=o.gy||1){c.beginPath();c.moveTo(p,Y(y));c.lineTo(W-p/2,Y(y));c.stroke();c.fillText(+y.toFixed(2),4,Y(y)+4)}
 c.strokeStyle=ink;c.lineWidth=1.5;
 if(ys<=0&&ye>=0){c.beginPath();c.moveTo(p,Y(0));c.lineTo(W-p/2,Y(0));c.stroke()}
 if(xs<=0&&xe>=0){c.beginPath();c.moveTo(X(0),p/2);c.lineTo(X(0),H-p);c.stroke()}
 (o.shapes||[]).forEach(s=>s(c,X,Y));
 o.curves.forEach(cu=>{c.beginPath();c.strokeStyle=cu.color;c.lineWidth=2.5;let st=false;
  for(let i=0;i<=400;i++){const x=xs+(xe-xs)*i/400,y=cu.f(x);if(!isFinite(y)||y<ys-50||y>ye+50){st=false;continue}
   st?c.lineTo(X(x),Y(y)):c.moveTo(X(x),Y(y));st=true}c.stroke()});
}
function range(fs,a,b,pad=.15){let mn=0,mx=0;fs.forEach(f=>{for(let i=0;i<=200;i++){const y=f(a+(b-a)*i/200);if(isFinite(y)){mn=Math.min(mn,y);mx=Math.max(mx,y)}}});
 if(mx===mn)mx=mn+1;const d=(mx-mn)*pad;return[mn-d,mx+d]}

/* ===== Carátula y concepto ===== */
function riemannShapes(f,a,b,n,m){return[(c,X,Y)=>{const h=(b-a)/n;c.fillStyle="rgba(58,134,255,.4)";c.strokeStyle="#3a86ff";c.lineWidth=1;
 for(let i=0;i<n;i++){const x0=a+i*h,x1=x0+h;
  if(m==="trap"){c.beginPath();c.moveTo(X(x0),Y(0));c.lineTo(X(x0),Y(f(x0)));c.lineTo(X(x1),Y(f(x1)));c.lineTo(X(x1),Y(0));c.closePath()}
  else{const xm=m==="left"?x0:m==="right"?x1:(x0+x1)/2,y=f(xm);c.beginPath();c.rect(X(x0),Y(Math.max(y,0)),X(x1)-X(x0),Math.abs(Y(y)-Y(0)))}
  c.fill();c.stroke()}}]}
function drawStatic(){
 if(!$("cvHero")&&!$("cvConcept"))return;
 const f=x=>x*x;
 [["cvHero",0,3,6,"mid"],["cvConcept",0,3,6,"left"]].forEach(([id,a,b,n,m])=>{if(!$(id))return;
  plot($(id),{xmin:-.3,xmax:3.3,ymin:-.5,ymax:9.8,curves:[{f,color:"#fb5607"}],shapes:riemannShapes(f,a,b,n,m)})});
}

/* ===== Calculadora ===== */
function parseFn(src){
 let s=src.toLowerCase().replace(/\s+/g,"").replace(/\^/g,"**").replace(/π/g,"pi");
 if(!s)throw new Error("Escribe una función.");
 if(/[^0-9a-z+\-*/().,]/.test(s))throw new Error("Hay símbolos no permitidos.");
 s=s.replace(/(\d)(x|\(|[a-z])/g,"$1*$2").replace(/(x|\))(\d|x|\()/g,"$1*$2").replace(/\)([a-z])/g,")*$1");
 const names=s.match(/[a-z]+/g)||[],ok=["x","sin","cos","tan","sqrt","exp","ln","abs","pi","e"];
 for(const n of names)if(!ok.includes(n))throw new Error("No reconozco «"+n+"».");
 s=s.replace(/\bln\b/g,"Math.log").replace(/\b(sin|cos|tan|sqrt|exp|abs)\b/g,"Math.$1").replace(/\bpi\b/g,"Math.PI").replace(/(^|[^.a-z])e(?![a-z])/g,"$1Math.E");
 const fn=new Function("x","return "+s);fn(1);return x=>fn(x);
}
function roots(h,a,b){const r=[],N=2000;let px=a,py=h(a);
 for(let i=1;i<=N;i++){const x=a+(b-a)*i/N,y=h(x);
  if(isFinite(py)&&isFinite(y)&&py*y<0){let lo=px,hi=x;for(let k=0;k<60;k++){const m=(lo+hi)/2;(h(lo)*h(m)<=0)?hi=m:lo=m}r.push((lo+hi)/2)}
  else if(y===0&&x<b)r.push(x);px=x;py=y}
 return r.filter((v,i)=>i===0||Math.abs(v-r[i-1])>1e-7)}
const fx=v=>(Math.abs(v)<1e-9?0:+v.toFixed(5));
function calcular(){
 const out=$("cOut");
 try{
  const f=parseFn($("cF").value),between=CS.type==="between",g=between?parseFn($("cG").value):null;
  const a=+$("cA").value,b=+$("cB").value;
  if(!(b>a))throw new Error("b debe ser mayor que a.");
  const h=g?x=>f(x)-g(x):f;
  if(!isFinite(h(a))||!isFinite(h((a+b)/2)))throw new Error("La función no está definida en el intervalo.");
  const r=roots(h,a,b),pts=[a,...r,b];
  let html="<ol>",total=0;
  html+=between?`<li>Planteamos el área entre las curvas: \\(A=\\int_{${a}}^{${b}} |f(x)-g(x)|\\,dx\\), con \\(f(x)=${$("cF").value}\\), \\(g(x)=${$("cG").value}\\).</li>`
   :`<li>Planteamos el área real: \\(A=\\int_{${a}}^{${b}} |f(x)|\\,dx\\), con \\(f(x)=${$("cF").value}\\).</li>`;
  html+=`<li>Buscamos dónde ${between?"f(x) − g(x)":"f(x)"} cambia de signo en [${a}, ${b}]: ${r.length?"x ≈ "+r.map(v=>fx(v)).join(", "):"no hay cambios de signo"}.</li>`;
  html+=`<li>Separamos en ${pts.length-1} subintervalo(s) y calculamos cada integral (regla de Simpson, n = 2000):<ul>`;
  for(let i=0;i<pts.length-1;i++){const v=simpson(h,pts[i],pts[i+1]),mid=h((pts[i]+pts[i+1])/2);total+=Math.abs(v);
   html+=`<li>[${fx(pts[i])}, ${fx(pts[i+1])}]: integral = ${fx(v)} → ${mid>=0?"sobre":"bajo"} ${between?"g":"el eje"}, aporta |${fx(v)}| = ${fx(Math.abs(v))}</li>`}
  html+="</ul></li>";
  html+=`<li>Sumamos los aportes (todos positivos).</li></ol><p class="final">Área = ${total.toFixed(5)} u²</p><p>Integral neta (con signo): ${fx(simpson(h,a,b))}</p>`;
  out.innerHTML=html;
  const [ys,ye]=range(g?[f,g]:[f],a,b),pad=(b-a)*.1;
  const fill=(c,X,Y)=>{c.fillStyle="rgba(255,190,11,.5)";c.beginPath();c.moveTo(X(a),Y(g?g(a):0));
   for(let i=0;i<=300;i++){const x=a+(b-a)*i/300;c.lineTo(X(x),Y(f(x)))}
   for(let i=300;i>=0;i--){const x=a+(b-a)*i/300;c.lineTo(X(x),Y(g?g(x):0))}c.closePath();c.fill()};
  const curves=[{f,color:"#3a86ff"}];if(g)curves.push({f:g,color:"#ff5d8f"});
  plot($("cvCalc"),{xmin:a-pad,xmax:b+pad,ymin:ys,ymax:ye,gx:(b-a)>8?2:1,gy:Math.max(1,Math.round((ye-ys)/6)),curves,shapes:[fill]});
  if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([out]);
 }catch(e){out.innerHTML=`<p class="err">${e.message}</p>`}
}

function typeset(el){if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise(el?[el]:undefined)}

/* ===== Cada página llama solo lo que necesita ===== */
/* ===== Videos ===== */
function buildVideos(){
 $("videoGrid").innerHTML=VIDEOS.map(v=>`<div class="video"><h3 style="font-size:1rem">${v.titulo}</h3>`+
  (v.url?`<iframe src="${v.url}" allowfullscreen loading="lazy"></iframe>`:`<div class="ph">📹 Pega el enlace de tu video en VIDEOS (script.js)</div>`)+`</div>`).join("");
}

/* ===== Pasos que se revelan ===== */
function initSteps(){
 document.querySelectorAll(".steps-card").forEach(card=>{
  const li=[...card.querySelectorAll(".reveal li")],btn=card.querySelector(".stepbtn");let n=0;
  const next=()=>{if(n<li.length){li[n++].classList.add("shown");typeset(card);}
   if(n>=li.length){btn.textContent="🎉 ¡Listo! Ver de nuevo";btn.dataset.done="1"}else btn.textContent=`👆 Mostrar siguiente paso (${n}/${li.length})`};
  btn.addEventListener("click",()=>{if(btn.dataset.done){li.forEach(x=>x.classList.remove("shown"));n=0;btn.dataset.done="";btn.textContent="👆 Mostrar siguiente paso";}else next()});
 });
}

/* ===== Rectángulos interactivos ===== */
const R={fn:Object.keys(FUNCS)[0],m:"mid"};
function updRiemann(){
 const f=FUNCS[R.fn],n=+$("rN").value;let a=+$("rA").value,b=+$("rB").value;$("rNv").textContent=n;
 if(!(b>a)){$("rOut").innerHTML='<span class="err">b debe ser mayor que a 😉</span>';return}
 const [ys,ye]=range([f],a,b),pad=(b-a)*.1;
 plot($("cvRiemann"),{xmin:a-pad,xmax:b+pad,ymin:Math.min(ys,-.3),ymax:ye,gx:(b-a)>8?2:1,gy:Math.max(1,Math.round((ye-ys)/6)),curves:[{f,color:"#fb5607"}],shapes:riemannShapes(f,a,b,n,R.m)});
 const h=(b-a)/n;let s=0;
 for(let i=0;i<n;i++){const x0=a+i*h;s+=R.m==="left"?f(x0):R.m==="right"?f(x0+h):R.m==="mid"?f(x0+h/2):(f(x0)+f(x0+h))/2}
 const ap=s*h,ex=simpson(f,a,b),er=Math.abs(ap-ex);
 $("rOut").innerHTML=`🧱 Aproximación: <b>${ap.toFixed(4)}</b> · 🎯 Exacto: <b>${ex.toFixed(4)}</b> · Error: <b>${er.toFixed(4)}</b> ${er<0.01?"🤩":er<0.1?"😃":"🙂"}`;
}
function initRiemann(){
 $("rFns").innerHTML=Object.keys(FUNCS).map((k,i)=>`<button class="chip${i?"":" on"}" data-f="${k}">f(x) = ${k}</button>`).join("");
 $("rFns").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;R.fn=b.dataset.f;[...$("rFns").children].forEach(c=>c.classList.toggle("on",c===b));updRiemann()});
 $("rMeths").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;R.m=b.dataset.m;[...$("rMeths").children].forEach(c=>c.classList.toggle("on",c===b));updRiemann()});
 const setN=v=>{$("rN").value=Math.max(1,Math.min(100,v));updRiemann()};
 $("rMinus").onclick=()=>setN(+$("rN").value-1);$("rPlus").onclick=()=>setN(+$("rN").value+1);
 document.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>setN(+b.dataset.n));
 ["rN","rA","rB"].forEach(i=>$(i).addEventListener("input",updRiemann));
}

/* ===== Calculadora: botones ===== */
function initCalc(){
 const keys=["x","^","(",")","+","-","*","/","2","3","π","sqrt(","sin(","cos(","exp(","ln(","abs(","⌫","🗑️"];
 $("keys").innerHTML=keys.map(k=>`<button class="key${k==="⌫"||k==="🗑️"?" del":""}">${k}</button>`).join("");
 $("keys").addEventListener("click",e=>{const b=e.target.closest(".key");if(!b)return;const inp=$(CS.field),k=b.textContent;
  if(k==="⌫")inp.value=inp.value.slice(0,-1);else if(k==="🗑️")inp.value="";else inp.value+=k;inp.focus()});
 ["cF","cG"].forEach(i=>$(i).addEventListener("focus",()=>{CS.field=i}));
 $("cTypes").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;CS.type=b.dataset.t;
  [...$("cTypes").children].forEach(c=>c.classList.toggle("on",c===b));$("cGwrap").hidden=CS.type!=="between"});
 const ex=[["x²−4 (0 a 3)","x^2-4",null,0,3],["sen(x) (0 a π)","sin(x)",null,0,3.14159],["x+2 y x² (−1 a 2)","x+2","x^2",-1,2],["√x y x² (0 a 1)","sqrt(x)","x^2",0,1]];
 $("cEx").innerHTML=ex.map((e,i)=>`<button class="chip" data-i="${i}">${e[0]}</button>`).join("");
 $("cEx").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;const x=ex[b.dataset.i];
  $("cF").value=x[1];$("cA").value=x[3];$("cB").value=x[4];
  CS.type=x[2]?"between":"axis";if(x[2])$("cG").value=x[2];
  [...$("cTypes").children].forEach(c=>c.classList.toggle("on",c.dataset.t===CS.type));$("cGwrap").hidden=CS.type!=="between";calcular()});
 $("cGo").addEventListener("click",calcular);
}

/* ===== Juego de opción múltiple ===== */
const G={round:0,score:0,cur:null,done:false};
function newProblem(){
 const r=(a,b)=>Math.round((a+Math.random()*(b-a))*2)/2;
 const types=[()=>{const c=r(1,3);return x=>c*x},()=>{const c=r(.5,2);return x=>c*x*x},()=>{const c=r(1,3),d=r(1,3);return x=>c*Math.sin(x)+d},()=>{const c=r(1,3);return x=>c*Math.sqrt(x)},()=>{const c=r(2,5);return x=>c/(1+x)}];
 const f=types[Math.floor(Math.random()*types.length)](),a=Math.floor(Math.random()*2),b=a+Math.floor(2+Math.random()*3);
 return{f,a,b,area:simpson(f,a,b)};
}
function drawGame(){
 const p=G.cur,[,ye]=range([p.f],p.a,p.b,.1);
 const fill=(c,X,Y)=>{c.fillStyle="rgba(58,134,255,.45)";c.beginPath();c.moveTo(X(p.a),Y(0));for(let i=0;i<=200;i++){const x=p.a+(p.b-p.a)*i/200;c.lineTo(X(x),Y(p.f(x)))}c.lineTo(X(p.b),Y(0));c.closePath();c.fill()};
 plot($("cvGame"),{xmin:Math.min(0,p.a)-.5,xmax:p.b+.5,ymin:-.5,ymax:Math.ceil(ye),gx:1,gy:1,curves:[{f:p.f,color:"#fb5607"}],shapes:[fill]});
}
function startRound(){
 G.cur=newProblem();G.done=false;const t=+G.cur.area.toFixed(1);
 const set=new Set([t]);const mult=[.6,.75,1.3,1.5,1.8,.45];
 while(set.size<4){set.add(+(t*mult[Math.floor(Math.random()*mult.length)]+(Math.random()<.5?.5:0)).toFixed(1))}
 const opts=[...set].sort(()=>Math.random()-.5);G.correct=t;
 $("gRound").textContent=G.round+1;$("gScore").textContent=G.score;
 $("gOut").textContent=`Zona entre x = ${G.cur.a} y x = ${G.cur.b}. ¿Cuánto vale el área? 🤔`;
 $("gAns").innerHTML=opts.map(o=>`<button class="ans" data-v="${o}">${o} u²</button>`).join("");
 $("gNext").hidden=true;drawGame();
}
function initGame(){
 $("gAns").addEventListener("click",e=>{const b=e.target.closest(".ans");if(!b||G.done)return;G.done=true;
  const v=+b.dataset.v,ok=v===G.correct;
  document.querySelectorAll(".ans").forEach(x=>{x.disabled=true;if(+x.dataset.v===G.correct)x.classList.add("right")});
  if(!ok)b.classList.add("wrong");
  if(ok)G.score++;$("gScore").textContent=G.score;
  $("gOut").innerHTML=ok?`<span class="ok">🎉 ¡Correcto!</span> El área es ${G.cur.area.toFixed(2)} u².`:`<span class="bad">😅 ¡Casi!</span> El área real es ${G.cur.area.toFixed(2)} u².`;
  $("gNext").hidden=false;$("gNext").textContent=G.round>=4?"🏆 Ver resultado":"Siguiente ➡️"});
 $("gNext").addEventListener("click",()=>{
  if(G.over){G.over=false;G.round=0;G.score=0;startRound();return}
  if(G.round>=4){G.over=true;$("gAns").innerHTML="";const s=G.score;
   $("gOut").innerHTML=`<b>🏆 ¡Terminaste! ${s} de 5 ${"⭐".repeat(s)||"💪"}</b><br>${s===5?"¡Eres un genio del área! 🤩":s>=3?"¡Muy bien! 👏":"¡Sigue practicando con los rectángulos! 🧱"}`;
   $("gNext").textContent="🔄 Jugar de nuevo";return}
  G.round++;startRound()});
}

/* ===== Problemas propuestos ===== */
const PROP=[
 ["Área bajo \\(y=2x+1\\) entre \\(x=0\\) y \\(x=3\\). ⭐",12],
 ["Área bajo \\(y=4-x^2\\) entre \\(x=-2\\) y \\(x=2\\). ⭐⭐",32/3],
 ["Área bajo \\(y=e^x\\) entre \\(x=0\\) y \\(x=\\ln 3\\). ⭐⭐",2],
 ["Área total entre \\(y=x^2-1\\) y el eje \\(x\\), de \\(x=0\\) a \\(x=2\\). ⭐⭐⭐",2],
 ["Área encerrada entre \\(y=\\sqrt{x}\\) y \\(y=x^2\\). ⭐⭐⭐",1/3]
];
function initProp(){
 $("propList").innerHTML=PROP.map((p,i)=>`<div class="card prob"><div class="q"><b>${i+1}.</b> ${p[0]}</div>
  <input type="number" step="any" id="pi${i}" placeholder="Tu respuesta"><button class="btn" data-p="${i}">Comprobar ✅</button><span class="fb" id="pf${i}"></span></div>`).join("");
 $("propList").addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(!b)return;const i=+b.dataset.p,v=parseFloat($("pi"+i).value),fb=$("pf"+i);
  if(isNaN(v)){fb.innerHTML='<span class="err">Escribe un número 😉</span>';return}
  fb.innerHTML=Math.abs(v-PROP[i][1])<0.02?'<span class="ok">🎉 ¡Correcto!</span>':'<span class="bad">🤔 Casi. ¡Inténtalo otra vez!</span>'});
}

window.addEventListener("DOMContentLoaded",()=>{
 drawStatic();
 if($("videoGrid"))buildVideos();
 initSteps();
 if($("rFns")){initRiemann();updRiemann()}
 if($("keys")){initCalc();calcular()}
 if($("gAns")){initGame();startRound()}
 if($("propList"))initProp();
 typeset();
});
