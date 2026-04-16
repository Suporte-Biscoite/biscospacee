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

      {/* FUNDO DA TELA INICIAL */}
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

      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(3,8,14,0.1) 0%, rgba(3,8,14,0) 30%, rgba(3,8,14,0.2) 70%, rgba(3,8,14,0.8) 100%)",
      }}/>

      {/* ── HIGHSCORES GIGANTE ── */}
      <div style={{
        position: "absolute", top: "4%", right: "4%",
        width: "500px", zIndex: 20, pointerEvents: "none",
      }}>
        {/* Antenas */}
        <div style={{ display: "flex", justifyContent: "center", gap: 30, paddingBottom: 4 }}>
          {[{ rot: "-22deg", color: "#ff3333" }, { rot: "22deg", color: "#ff3333" }].map((a, i) => (
            <div key={i} style={{
              width: 8, height: 45, borderRadius: 4,
              background: "linear-gradient(180deg,#aaa,#666)",
              transform: `rotate(${a.rot})`, transformOrigin: "bottom center",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: -5, left: "50%",
                transform: "translateX(-50%)", width: 16, height: 16,
                borderRadius: "50%", background: a.color,
                boxShadow: `0 0 12px ${a.color}`,
              }}/>
            </div>
          ))}
        </div>
        {/* Corpo monitor */}
        <div style={{
          background: "linear-gradient(145deg,#9aa4b2,#c4cdd8 22%,#868e98 58%,#5c6470)",
          borderRadius: "20px 20px 30px 30px",
          padding: "20px 24px 34px",
          boxShadow: "5px 5px 0 #3a4248,10px 10px 0 #282e34,inset 0 4px 8px rgba(255,255,255,.45)",
        }}>
          <div style={{
            background: "#000", borderRadius: 10, padding: "18px 20px 15px",
            border: "8px solid #181e18", overflow: "hidden", position: "relative",
            boxShadow: "inset 0 0 40px rgba(0,26,0,.65)",
          }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
              background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.15) 3px,rgba(0,0,0,.15) 6px)",
            }}/>
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 24, color: "#ff8800", textAlign: "center", margin: "0 0 5px", textShadow: "0 0 12px #ff880099", position: "relative", zIndex: 4 }}>TOP 5</p>
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: "#ff5500", textAlign: "center", margin: "0 0 20px", textShadow: "0 0 12px #ff550099", position: "relative", zIndex: 4 }}>FORNEIROS</p>
            <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#2ec4b666,transparent)", marginBottom: 15, position: "relative", zIndex: 4 }}/>
            {top5.map((r, i) => (
              <div key={i} style={{
                fontFamily: "'Press Start 2P',monospace", fontSize: 16,
                display: "flex", alignItems: "center", marginBottom: 12,
                borderRadius: 5, padding: "6px 8px", position: "relative", zIndex: 4,
                background: hl === i ? "rgba(232,184,75,.14)" : "transparent",
              }}>
                <span style={{ color: "#ff8800", minWidth: 35 }}>{i + 1}.</span>
                <span style={{ color: "#00e5cc", minWidth: 80, textShadow: "0 0 8px #00e5cc88", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {String(r.name || r.id || "---").substring(0, 5).toUpperCase()}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 16, color: i === 0 ? "#e8b84b" : i === 1 ? "#00e5cc" : "#aaddaa" }}>
                  {fmt(r.pts)}
                </span>
              </div>
            ))}
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: "#225522", textAlign: "center", marginTop: 15, position: "relative", zIndex: 4, letterSpacing: 2 }}>
              GAME OVER? INSERT COIN
            </p>
          </div>
          <div style={{ width: 80, height: 20, background: "linear-gradient(180deg,#878f98,#585e68)", margin: "0 auto", borderRadius: "0 0 6px 6px" }}/>
          <div style={{ width: 200, height: 16, background: "linear-gradient(180deg,#686e78,#484e58)", margin: "0 auto", borderRadius: 6, boxShadow: "3px 3px 0 #282e34" }}/>
        </div>
      </div>

      {/* ── BOTÃO START GIGANTE ── */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: "10%",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        zIndex: 30, pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 46,
          color: "#e84393", letterSpacing: 8, margin: 0,
          textShadow: "0 0 25px #e84393cc, 0 0 50px #e8439366",
        }}>
          ·· START ··
        </p>
        <button
          onClick={handleStart}
          onTouchEnd={handleStart}
          style={{
            pointerEvents: "auto",
            width: 550, padding: "35px 0",
            fontFamily: "'Press Start 2P', monospace", fontSize: 22,
            color: "#fff", letterSpacing: 5,
            background: "rgba(232,67,147,0.15)",
            border: "4px solid rgba(232,67,147,0.5)",
            borderRadius: 20, cursor: "pointer",
            textShadow: "0 0 12px #e8439388",
            boxShadow: "0 0 30px rgba(232,67,147,0.3)",
            WebkitTapHighlightColor: "transparent", outline: "none",
          }}
        >
          PRESSIONAR TELA
        </button>
      </div>
    </div>
  );
}