/**
 * StartScreen.jsx – Biscoitê Space Shooter
 * FUNDO ESTÁTICO via tela_de_inicio.jpeg (precisa estar em public/)
 * ZERO animações HTML — tudo estático
 * Click APENAS no botão
 */
import { useState, useEffect } from "react";

function fmt(n) { return Number(n).toLocaleString("pt-BR"); }

export default function StartScreen({ ranking = [], onStart }) {
  const [hl, setHl] = useState(0);
  const top5 = [...ranking].sort((a, b) => b.pts - a.pts).slice(0, 5);

  useEffect(() => {
    const id = setInterval(() => setHl(h => (h + 1) % Math.max(top5.length, 1)), 1900);
    return () => clearInterval(id);
  }, [top5.length]);

  const handleStart = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    onStart?.();
  };

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      overflow: "hidden", fontFamily: "'Orbitron', monospace",
      background: "#03080e", userSelect: "none", WebkitUserSelect: "none",
    }}>

      {/* ══ FUNDO ESTÁTICO ══
          Coloque tela_de_inicio.jpeg na pasta public/
          Se não encontrar a imagem, fica fundo escuro sólido */}
      <img
        src="/tela_de_inicio.jpeg"
        alt=""
        draggable="false"
        onError={(e) => { e.target.style.display = 'none'; }}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center top",
          pointerEvents: "none",
        }}
      />

      {/* Overlay leve para legibilidade dos textos */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(3,8,14,0.1) 0%, rgba(3,8,14,0) 30%, rgba(3,8,14,0.2) 70%, rgba(3,8,14,0.8) 100%)",
      }}/>

      {/* ── HIGHSCORES (monitor CRT) ── */}
      <div style={{
        position: "absolute", top: "2%", right: "2%",
        width: "min(300px, 42%)", zIndex: 20, pointerEvents: "none",
      }}>
        {/* Antenas */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, paddingBottom: 2 }}>
          {[{ rot: "-22deg", color: "#ff3333" }, { rot: "22deg", color: "#ff3333" }].map((a, i) => (
            <div key={i} style={{
              width: 5, height: 32, borderRadius: 3,
              background: "linear-gradient(180deg,#aaa,#666)",
              transform: `rotate(${a.rot})`, transformOrigin: "bottom center",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: -3, left: "50%",
                transform: "translateX(-50%)", width: 10, height: 10,
                borderRadius: "50%", background: a.color,
                boxShadow: `0 0 8px ${a.color}`,
              }}/>
            </div>
          ))}
        </div>
        {/* Corpo monitor */}
        <div style={{
          background: "linear-gradient(145deg,#9aa4b2,#c4cdd8 22%,#868e98 58%,#5c6470)",
          borderRadius: "14px 14px 20px 20px",
          padding: "12px 16px 22px",
          boxShadow: "3px 3px 0 #3a4248,7px 7px 0 #282e34,inset 0 2px 5px rgba(255,255,255,.45)",
        }}>
          <div style={{
            background: "#000", borderRadius: 7, padding: "12px 14px 10px",
            border: "5px solid #181e18", overflow: "hidden", position: "relative",
            boxShadow: "inset 0 0 30px rgba(0,26,0,.65)",
          }}>
            {/* Scanlines (estático) */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
              background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px)",
            }}/>
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 13, color: "#ff8800", textAlign: "center", margin: "0 0 2px", textShadow: "0 0 9px #ff880099", position: "relative", zIndex: 4 }}>TOP 5</p>
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: "#ff5500", textAlign: "center", margin: "0 0 10px", textShadow: "0 0 9px #ff550099", position: "relative", zIndex: 4 }}>FORNEIROS</p>
            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#2ec4b666,transparent)", marginBottom: 10, position: "relative", zIndex: 4 }}/>
            {top5.map((r, i) => (
              <div key={i} style={{
                fontFamily: "'Press Start 2P',monospace", fontSize: 9,
                display: "flex", alignItems: "center", marginBottom: 8,
                borderRadius: 3, padding: "2px 4px", position: "relative", zIndex: 4,
                background: hl === i ? "rgba(232,184,75,.14)" : "transparent",
              }}>
                <span style={{ color: "#ff8800", minWidth: 22 }}>{i + 1}.</span>
                <span style={{ color: "#00e5cc", minWidth: 52, textShadow: "0 0 5px #00e5cc88", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {String(r.name || r.id || "---").substring(0, 5).toUpperCase()}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 8, color: i === 0 ? "#e8b84b" : i === 1 ? "#00e5cc" : "#aaddaa" }}>
                  {fmt(r.pts)}
                </span>
              </div>
            ))}
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: "#225522", textAlign: "center", marginTop: 6, position: "relative", zIndex: 4, letterSpacing: 1 }}>
              GAME OVER? INSERT COIN
            </p>
          </div>
          <div style={{ width: 50, height: 14, background: "linear-gradient(180deg,#878f98,#585e68)", margin: "0 auto", borderRadius: "0 0 4px 4px" }}/>
          <div style={{ width: 130, height: 10, background: "linear-gradient(180deg,#686e78,#484e58)", margin: "0 auto", borderRadius: 4, boxShadow: "2px 2px 0 #282e34" }}/>
        </div>
      </div>

      {/* ── CTA – BOTÃO START ── */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: "8%",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        zIndex: 30, pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 28,
          color: "#e84393", letterSpacing: 6, margin: 0,
          textShadow: "0 0 20px #e84393cc, 0 0 40px #e8439366",
        }}>
          ·· START ··
        </p>
        <button
          onClick={handleStart}
          onTouchEnd={handleStart}
          style={{
            pointerEvents: "auto",
            width: 280, padding: "18px 0",
            fontFamily: "'Press Start 2P', monospace", fontSize: 12,
            color: "#fff", letterSpacing: 4,
            background: "rgba(232,67,147,0.15)",
            border: "2px solid rgba(232,67,147,0.5)",
            borderRadius: 12, cursor: "pointer",
            textShadow: "0 0 8px #e8439388",
            boxShadow: "0 0 20px rgba(232,67,147,0.2)",
            WebkitTapHighlightColor: "transparent", outline: "none",
          }}
        >
          PRESSIONAR TELA
        </button>
      </div>

      {/* Frame metálico */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50,
        border: "9px solid transparent", borderRadius: 20,
        background: "linear-gradient(135deg,#aabbc8,#d4e2ec,#7a8c9c,#566070,#aabbc8,#d4e2ec) border-box",
        WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "destination-out", maskComposite: "exclude",
      }}/>
    </div>
  );
}