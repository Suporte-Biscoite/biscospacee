/**
 * GameBackground.jsx — Biscoitê Space Shooter
 * Fundo animado para Totem 43" 1080×1920 portrait
 * Baseado em biscoite_fundo_jogo_FINAL.html
 * pointer-events: none — componente puramente visual
 */

import { useEffect } from "react";

/* ── Dados das estrelas (3 camadas paralaxe) ────────────── */
const STAR_LAYERS = [
  { cls: "sl1", count: 55 },
  { cls: "sl2", count: 38 },
  { cls: "sl3", count: 22 },
];

/* Partículas que sobem */
const PARTICLES = [
  { w:2, l:"12%", c:"#e8b84b", dur:"9s",  dx:"18px",  delay:"0s"   },
  { w:1, l:"28%", c:"#2ec4b6", dur:"12s", dx:"-14px", delay:"2s"   },
  { w:2, l:"52%", c:"#e84393", dur:"10s", dx:"10px",  delay:"4s"   },
  { w:1, l:"68%", c:"#e8b84b", dur:"14s", dx:"-20px", delay:"1s"   },
  { w:3, l:"83%", c:"#2ec4b6", dur:"11s", dx:"5px",   delay:"3s"   },
  { w:1, l:"44%", c:"#ffe066", dur:"13s", dx:"-10px", delay:"5.5s" },
  { w:2, l:"18%", c:"#ff66aa", dur:"8s",  dx:"24px",  delay:"6.5s" },
  { w:1, l:"62%", c:"#e8b84b", dur:"15s", dx:"-28px", delay:"1.8s" },
  { w:2, l:"35%", c:"#aa44ff", dur:"9s",  dx:"16px",  delay:"7s"   },
];

const COOKIE_EMOJIS = ["🍪","🍪","🍪","🍪","⭐","🌟","✨"];

/* Geração de estrelas com seed determinística */
function genStars(count, li) {
  const sizes = [1,1,1,2,2,2,3,3,4];
  const ops   = [.2,.3,.4,.5,.6,.7,.8,.9,1];
  return Array.from({ length: count }, (_, i) => {
    const rng = (n) => ((i*1664525 + li*22695477 + n*1013904223) & 0x7fffffff) / 0x7fffffff;
    return {
      w:    sizes[Math.floor(rng(1)*sizes.length)],
      top:  (rng(2)*200).toFixed(1) + "%",
      left: (rng(3)*100).toFixed(1) + "%",
      op:   ops[Math.floor(rng(4)*ops.length)],
      tw:   (2+rng(5)*4).toFixed(1) + "s",
      dd:   (rng(6)*6).toFixed(1) + "s",
    };
  });
}

/* Cookie stars estáticas */
const COOKIE_STARS = Array.from({ length: 22 }, (_, i) => {
  const rng = (n) => ((i*1664525 + n*22695477 + 1013904223) & 0x7fffffff) / 0x7fffffff;
  const sz  = rng(1)<0.6 ? 16 : rng(2)<0.5 ? 22 : 12;
  return {
    emoji: COOKIE_EMOJIS[Math.floor(rng(3)*COOKIE_EMOJIS.length)],
    top:   (rng(4)*95).toFixed(1) + "%",
    left:  (rng(5)*92).toFixed(1) + "%",
    sz,
    op:    (rng(6)*0.18+0.06).toFixed(2),
    dur:   (6+rng(7)*10).toFixed(1) + "s",
    delay: (rng(9)*8).toFixed(1) + "s",
  };
});

export default function GameBackground() {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
      <style>{`
        .sl1{animation:bgScrollY 60s linear infinite}
        .sl2{animation:bgScrollY 38s linear infinite;animation-delay:-15s}
        .sl3{animation:bgScrollY 22s linear infinite;animation-delay:-8s}
        @keyframes bgScrollY{0%{transform:translateY(0)}100%{transform:translateY(100%)}}
        .bg-tw{animation:bgTwinkle var(--tw,3s) ease-in-out infinite;animation-delay:var(--dd,0s)}
        @keyframes bgTwinkle{0%,100%{opacity:var(--op,.5);transform:scale(1)}50%{opacity:1;transform:scale(1.6)}}
        @keyframes bgNebula{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
        @keyframes bgCookie{0%,100%{transform:translateY(0) translateX(0) rotate(0deg)}33%{transform:translateY(-18px) translateX(8px) rotate(120deg)}66%{transform:translateY(8px) translateX(-6px) rotate(240deg)}}
        @keyframes bgPart{0%{transform:translateY(0) translateX(0);opacity:0}8%{opacity:var(--pop,.4)}88%{opacity:var(--pop,.4)}100%{transform:translateY(-110vh) translateX(var(--dx,0px));opacity:0}}
        .bg-grid{background-image:linear-gradient(#2ec4b608 1px,transparent 1px),linear-gradient(90deg,#2ec4b608 1px,transparent 1px);background-size:56px 56px}
      `}</style>

      {/* Espaço profundo */}
      <div style={{
        position:"absolute",inset:0,
        background:`
          radial-gradient(ellipse at 28% 18%,#1a3a6a18 0%,transparent 55%),
          radial-gradient(ellipse at 75% 80%,#2ec4b60a 0%,transparent 50%),
          radial-gradient(ellipse at 85% 15%,#e8b84b08 0%,transparent 45%),
          linear-gradient(180deg,#050810 0%,#080d18 40%,#060b14 100%)
        `,
      }}/>

      {/* Nebulosas */}
      {[
        {top:"-8%",right:"-5%",w:"52%",h:"46%",c:"#e8b84b09",spd:"9s",del:"0s"},
        {bottom:"-6%",left:"-4%",w:"44%",h:"38%",c:"#2ec4b60c",spd:"12s",del:"-4s"},
        {top:"30%",left:"30%",w:"60%",h:"32%",c:"#e8439308",spd:"15s",del:"-7s"},
      ].map((n,i)=>(
        <div key={i} style={{
          position:"absolute",...(n.top&&{top:n.top}),...(n.bottom&&{bottom:n.bottom}),
          ...(n.right&&{right:n.right}),...(n.left&&{left:n.left}),
          width:n.w,height:n.h,
          background:`radial-gradient(ellipse at 50% 50%,${n.c} 0%,transparent 68%)`,
          borderRadius:"50%",
          animation:`bgNebula ${n.spd} ease-in-out infinite`,
          animationDelay:n.del,
        }}/>
      ))}

      {/* Camadas de estrelas */}
      {STAR_LAYERS.map(({cls,count},li)=>(
        <div key={li} className={cls} style={{position:"absolute",inset:0}}>
          {genStars(count,li).map((s,i)=>(
            <div key={i} className="bg-tw" style={{
              position:"absolute",borderRadius:"50%",background:"#fff",
              width:s.w,height:s.w,top:s.top,left:s.left,
              "--op":s.op,"--tw":s.tw,"--dd":s.dd,
            }}/>
          ))}
        </div>
      ))}

      {/* Cookie stars temáticas */}
      <div style={{position:"absolute",inset:0}}>
        {COOKIE_STARS.map((c,i)=>(
          <div key={i} style={{
            position:"absolute",top:c.top,left:c.left,
            fontSize:c.sz,opacity:c.op,userSelect:"none",
            filter:"sepia(1) saturate(1.4) hue-rotate(15deg) brightness(0.7)",
            animation:`bgCookie ${c.dur} ease-in-out infinite`,
            animationDelay:c.delay,
          }}>{c.emoji}</div>
        ))}
      </div>

      {/* Grade */}
      <div className="bg-grid" style={{position:"absolute",inset:0}}/>

      {/* Bordas laterais */}
      <div style={{position:"absolute",top:0,bottom:0,left:2,width:2,background:"linear-gradient(180deg,transparent,#2ec4b640 30%,#2ec4b640 70%,transparent)"}}/>
      <div style={{position:"absolute",top:0,bottom:0,right:2,width:2,background:"linear-gradient(180deg,transparent,#2ec4b640 30%,#2ec4b640 70%,transparent)"}}/>

      {/* Planeta dourado */}
      <svg style={{position:"absolute",top:"6%",right:"4%",width:100,height:100,opacity:.18,animation:"bgNebula 8s ease-in-out infinite"}} viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="38" fill="#c99228"/>
        <circle cx="45" cy="41" r="34" fill="#f0c840"/>
        <ellipse cx="38" cy="35" rx="8" ry="6" fill="#d4a030" opacity=".5"/>
        <ellipse cx="55" cy="50" rx="6" ry="4" fill="#d4a030" opacity=".4"/>
        <ellipse cx="45" cy="55" rx="50" ry="10" fill="none" stroke="#c99228" strokeWidth="3" opacity=".6"/>
      </svg>

      {/* Planeta teal */}
      <svg style={{position:"absolute",bottom:"12%",left:"5%",width:58,height:58,opacity:.15,animation:"bgNebula 11s ease-in-out infinite reverse"}} viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="22" fill="#1a6a60"/>
        <circle cx="25" cy="23" r="20" fill="#2ec4b6"/>
        <ellipse cx="20" cy="20" rx="5" ry="4" fill="#5addd6" opacity=".5"/>
      </svg>

      {/* Asteroide biscoito */}
      <svg style={{position:"absolute",top:"22%",left:"3%",width:40,height:30,opacity:.11,animation:"bgCookie 18s ease-in-out infinite"}} viewBox="0 0 36 28">
        <polygon points="4,14 10,4 22,2 32,8 34,20 26,26 12,26 2,20" fill="#c99228"/>
        <polygon points="6,14 11,6 21,4 30,9 32,19 25,24 13,24 4,19" fill="#e8b84b"/>
        <circle cx="14" cy="12" r="3" fill="#c99228"/>
        <circle cx="24" cy="18" r="2" fill="#c99228"/>
      </svg>

      {/* Partículas que sobem */}
      {PARTICLES.map((p,i)=>(
        <div key={i} style={{
          position:"absolute",borderRadius:"50%",
          width:p.w,height:p.w,background:p.c,
          left:p.l,bottom:-4,opacity:0,
          animation:`bgPart ${p.dur} ease-in-out infinite`,
          animationDelay:p.delay,
          "--dx":p.dx,"--pop":"0.45",
        }}/>
      ))}

      {/* Scanlines */}
      <div style={{
        position:"absolute",inset:0,zIndex:2,
        background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.04) 3px,rgba(0,0,0,.04) 4px)",
      }}/>

      {/* Vinheta */}
      <div style={{
        position:"absolute",inset:0,zIndex:3,
        background:"radial-gradient(ellipse at 50% 50%,transparent 32%,rgba(0,0,0,.52) 100%)",
      }}/>
    </div>
  );
}