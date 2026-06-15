// ━━━━━ LANGUAGE SWITCHER ━━━━━
const FH_LANG_KEY='fh-lang';
function applyLang(lang){
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-no]').forEach(el=>{
    const t=el.getAttribute('data-'+lang);
    if(t!=null){
      // If element has children, only swap text — preserve markup like <span class="accent">
      if(el.children.length===0){el.textContent=t;}
      else{el.innerHTML=t;}
    }
  });
  document.querySelectorAll('[data-no-attr]').forEach(el=>{
    const map=el.getAttribute('data-'+lang+'-attr');
    if(!map) return;
    // format: "attr1:value1|attr2:value2"
    map.split('|').forEach(pair=>{const[k,v]=pair.split(':');if(k&&v!=null)el.setAttribute(k.trim(),v.trim());});
  });
  // Toggle visual state on switcher
  document.querySelectorAll('.lang-opt,.mob-lang span').forEach(o=>{
    o.classList.toggle('active',o.dataset.lang===lang);
  });
  try{localStorage.setItem(FH_LANG_KEY,lang);}catch(e){}
}
function initLang(){
  let lang='no';
  try{lang=localStorage.getItem(FH_LANG_KEY)||'no';}catch(e){}
  applyLang(lang);
  document.querySelectorAll('.lang-opt,.mob-lang span').forEach(o=>{
    o.addEventListener('click',e=>{e.preventDefault();applyLang(o.dataset.lang);});
  });
}

// ━━━━━ CUSTOM CURSOR ━━━━━
function initCursor(){
  const cur=document.getElementById('cur'),curR=document.getElementById('cur-r');
  if(!cur||!curR) return;
  let mx=0,my=0,rx=0,ry=0;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
  function loop(){rx+=(mx-rx)*0.18;ry+=(my-ry)*0.18;curR.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(loop);}
  loop();
  document.querySelectorAll('a,button,.s-card,.car-card,.btn-glass,.btn-ghost,.car-arrow,.car-dot,.lang-opt').forEach(el=>{
    el.addEventListener('mouseenter',()=>curR.classList.add('hover'));
    el.addEventListener('mouseleave',()=>curR.classList.remove('hover'));
  });
}

// ━━━━━ MAGNETIC BUTTONS ━━━━━
function initMagnetic(){
  document.querySelectorAll('.btn-glass,.nav-cta').forEach(b=>{
    b.addEventListener('mousemove',e=>{
      const r=b.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*0.22;
      const y=(e.clientY-r.top-r.height/2)*0.22;
      b.style.transform=`translate(${x}px,${y}px)`;
    });
    b.addEventListener('mouseleave',()=>b.style.transform='');
  });
}

// ━━━━━ BURGER + MOBILE NAV ━━━━━
function initBurger(){
  const burger=document.getElementById('burger'),mob=document.getElementById('mob');
  if(!burger||!mob) return;
  burger.addEventListener('click',()=>{burger.classList.toggle('open');mob.classList.toggle('open');document.body.style.overflow=mob.classList.contains('open')?'hidden':'';});
  mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{burger.classList.remove('open');mob.classList.remove('open');document.body.style.overflow='';}));
}

// ━━━━━ SCROLL REVEALS ━━━━━
function initReveals(){
  const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');ro.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.rev').forEach(el=>ro.observe(el));
}

// ━━━━━ NAV HIDE ON SCROLL DOWN ━━━━━
function initNav(){
  let lastY=0;const navEl=document.getElementById('nav');
  if(!navEl) return;
  addEventListener('scroll',()=>{
    const y=scrollY;
    navEl.style.transform=`translateX(-50%) translateY(${y>lastY&&y>200?'-130%':'0'})`;
    lastY=y;
  },{passive:true});
}

// ━━━━━ TESTIMONIAL CAROUSEL ━━━━━
function initCarousel(){
  const car=document.getElementById('car');if(!car) return;
  const prev=document.getElementById('car-prev'),next=document.getElementById('car-next'),dotsBox=document.getElementById('car-dots');
  const cards=Array.from(car.children);
  cards.forEach((_,i)=>{const d=document.createElement('button');d.className='car-dot'+(i===0?' active':'');d.setAttribute('aria-label','Card '+(i+1));d.addEventListener('click',()=>scrollIdx(i));dotsBox.appendChild(d);});
  const dots=Array.from(dotsBox.children);
  function step(){return cards.length<2?car.clientWidth:cards[1].getBoundingClientRect().left-cards[0].getBoundingClientRect().left;}
  function idx(){const s=step();return s?Math.round(car.scrollLeft/s):0;}
  function scrollIdx(i){car.scrollTo({left:i*step(),behavior:'smooth'});}
  prev.addEventListener('click',()=>scrollIdx(Math.max(0,idx()-1)));
  next.addEventListener('click',()=>scrollIdx(Math.min(cards.length-1,idx()+1)));
  let raf;car.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const i=idx();dots.forEach((d,j)=>d.classList.toggle('active',j===i));prev.disabled=(i<=0);next.disabled=(i>=cards.length-1);});},{passive:true});
  let down=false,sx=0,sl=0,moved=false;
  car.addEventListener('mousedown',e=>{down=true;moved=false;sx=e.pageX;sl=car.scrollLeft;car.classList.add('dragging');});
  car.addEventListener('mouseleave',()=>{if(down){down=false;car.classList.remove('dragging');if(moved)scrollIdx(idx());}});
  car.addEventListener('mouseup',()=>{if(down){down=false;car.classList.remove('dragging');if(moved)scrollIdx(idx());}});
  car.addEventListener('mousemove',e=>{if(!down)return;e.preventDefault();const dx=e.pageX-sx;if(Math.abs(dx)>4)moved=true;car.scrollLeft=sl-dx;});
  car.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
  car.setAttribute('tabindex','0');
  car.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();scrollIdx(Math.min(cards.length-1,idx()+1));}if(e.key==='ArrowLeft'){e.preventDefault();scrollIdx(Math.max(0,idx()-1));}});
  prev.disabled=true;
}

// ━━━━━ OPENING HOURS STATUS ━━━━━
function initHours(){
  const status=document.getElementById('kt-status'),text=document.getElementById('kt-status-text');
  if(!status) return;
  const now=new Date();const d=now.getDay();const h=now.getHours()+now.getMinutes()/60;
  const isWeekday=(d>=1&&d<=5),isOpen=(isWeekday&&h>=8&&h<16);
  const lang=document.documentElement.lang||'no';
  if(isOpen){status.classList.add('open');text.textContent=lang==='en'?'Open now · closes 16:00':'Åpent nå · stenger 16:00';}
  else{text.textContent=lang==='en'?'Closed now':'Stengt nå';}
  document.querySelectorAll('.kt-day').forEach(el=>{if(+el.dataset.day===d)el.classList.add('today');});
}

// ━━━━━ INIT ALL ━━━━━
document.addEventListener('DOMContentLoaded',()=>{
  initLang();
  initCursor();
  initMagnetic();
  initBurger();
  initReveals();
  initNav();
  initCarousel();
  initHours();
});

// ━━━━━ GSAP + LENIS + TILT (after libs load) ━━━━━
addEventListener('load',()=>{
  if(window.Lenis){
    const lenis=new Lenis({duration:1.2,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
    function raf(t){lenis.raf(t);requestAnimationFrame(raf);}requestAnimationFrame(raf);
    if(window.ScrollTrigger)lenis.on('scroll',ScrollTrigger.update);
  }
  if(window.VanillaTilt){
    VanillaTilt.init(document.querySelectorAll('.om-vis,.car-card'),{max:6,speed:600,glare:true,'max-glare':.35,perspective:1400,scale:1.01});
  }
  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.hero-inner',{opacity:0,scale:.94,y:-50,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero-img',{scale:1.10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.cta-o1',{xPercent:15,yPercent:-15,scrollTrigger:{trigger:'.cta',start:'top bottom',end:'bottom top',scrub:1.5}});
    gsap.to('.cta-o2',{xPercent:-15,yPercent:15,scrollTrigger:{trigger:'.cta',start:'top bottom',end:'bottom top',scrub:1.5}});
    ScrollTrigger.refresh();
  }
});
