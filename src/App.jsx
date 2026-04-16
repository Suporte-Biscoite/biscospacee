/**
 * App.jsx v9 – Biscoitê Space Shooter
 * Fluxo: Start → Auth (telefone+ID) → Game → GameOver (prêmios+cupons)
 * Backend: Vercel KV para ranking, prêmios e jogadores
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import GameEngine, { PRIZE_THRESHOLDS } from './GameEngine';
import StartScreen from './StartScreen';
import AuthScreen from './AuthScreen';

// Cheat mode: vida infinita + prêmios não consomem estoque
const CHEAT_PHONE = '11948911448';

function Toast({msg,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t);},[onDone]);
  return <div className="anim-toast fixed bottom-28 left-1/2 z-50 bg-yellow-400 text-slate-900 font-black text-center px-6 py-4 rounded-2xl shadow-2xl max-w-xs text-sm leading-snug" style={{transform:'translateX(-50%)'}}>{msg}</div>;
}

/* ═══ BOSS HUD ═══ */
const BC={
  limone:{label:'BOSS 01',name:'LIMONÊ REX',emoji:'🍋',color:'#f5d44a',glow:'rgba(245,212,74,0.4)',grad:'linear-gradient(90deg,#c8a010,#f5d44a,#ffe880,#f5d44a)'},
  tartufao:{label:'BOSS 02',name:'TARTUFÃO',emoji:'🫙',color:'#c99228',glow:'rgba(201,146,40,0.4)',grad:'linear-gradient(90deg,#7a5010,#c99228,#e8b84b,#c99228)'},
  overlord:{label:'BOSS FINAL',name:'COOKIE OVERLORD',emoji:'🍪',color:'#e84393',glow:'rgba(232,67,147,0.45)',grad:'linear-gradient(90deg,#8b0044,#e84393,#ff88cc,#e84393)'},
};
const PL={1:'FASE 1',2:'FASE 2 — FÚRIA!',3:'FASE 3 — AVANÇO!!'};

function BossHUD({boss}){
  if(!boss?.active)return null;
  const c=BC[boss.name]||BC.limone, pct=Math.max(0,boss.hp/boss.maxHp), dng=pct<0.2, col=dng?'#ff4466':c.color, ph=boss.phase||1;
  return(
    <div style={{position:'absolute',top:56,left:'50%',transform:'translateX(-50%)',width:'min(420px,92%)',zIndex:25,fontFamily:"'Press Start 2P','Orbitron',monospace",pointerEvents:'none'}}>
      <div style={{display:'flex',alignItems:'center',gap:0,position:'relative',zIndex:2}}>
        <div style={{width:44,height:44,border:`2px solid ${col}`,borderBottom:'none',borderRadius:'6px 6px 0 0',background:'#08101e',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:`0 0 10px ${c.glow}`}}>{c.emoji}</div>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:1,padding:'0 8px 3px',borderBottom:`2px solid ${col}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:6,color:col,letterSpacing:2,opacity:0.7}}>{c.label}</span>
            {ph>=2&&<span style={{fontSize:5,color:dng?'#ff4466':'#ff8800',letterSpacing:1,background:'rgba(0,0,0,0.6)',padding:'1px 4px',borderRadius:2}}>{PL[ph]||`FASE ${ph}`}</span>}
          </div>
          <span style={{fontSize:8,color:'#fff',letterSpacing:1,textShadow:`0 0 8px ${col}`}}>{c.name}</span>
        </div>
        <div style={{position:'absolute',right:0,bottom:5,fontSize:7,color:col,letterSpacing:1}}>{boss.hp}/{boss.maxHp}</div>
      </div>
      <div style={{width:'100%',height:18,background:'#020810',border:`2px solid ${col}`,borderTop:'none',borderRadius:'0 0 5px 5px',position:'relative',overflow:'hidden',boxShadow:`0 4px 14px ${c.glow}`}}>
        <div style={{position:'absolute',top:0,left:0,bottom:0,width:`${pct*100}%`,background:dng?'linear-gradient(90deg,#ff2222,#ff6600)':c.grad,transition:'width 0.15s ease',backgroundImage:'repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.3) 10px,rgba(0,0,0,0.3) 12px)'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:5,background:'linear-gradient(180deg,rgba(255,255,255,0.2),transparent)'}}/>
        </div>
        {dng&&<div style={{position:'absolute',inset:0,zIndex:4,background:'rgba(255,0,0,0.12)',animation:'df .5s step-end infinite'}}/>}
      </div>
      <style>{`@keyframes df{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}

/* ══ GAME SCREEN ══ */
function GameScreen({playerData, onGameOver}){
  const keysRef=useRef({left:false,right:false,up:false,down:false});
  const [score,setScore]=useState(0);
  const [lives,setLives]=useState(2);
  const [wave,setWave]=useState(1);
  const [bossS,setBossS]=useState(null);
  const [toast,setToast]=useState(null);
  const tq=useRef([]),ts=useRef(false);
  const fireToast=useCallback((msg)=>{tq.current.push(msg);if(!ts.current)flushT();},[]);
  const flushT=()=>{if(!tq.current.length){ts.current=false;return;}ts.current=true;setToast(tq.current.shift());};
  const noop=useCallback(()=>{},[]);
  const dir=(d)=>({
    onTouchStart:(e)=>{e.preventDefault();e.stopPropagation();keysRef.current[d]=true;},
    onTouchEnd:(e)=>{e.preventDefault();e.stopPropagation();keysRef.current[d]=false;},
    onTouchCancel:(e)=>{e.preventDefault();e.stopPropagation();keysRef.current[d]=false;},
    onMouseDown:(e)=>{e.stopPropagation();keysRef.current[d]=true;},
    onMouseUp:(e)=>{e.stopPropagation();keysRef.current[d]=false;},
    onMouseLeave:(e)=>{e.stopPropagation();keysRef.current[d]=false;},
  });

  return(
    <div className="relative w-full h-full overflow-hidden" style={{backgroundColor:'#02040a'}}>
      <img src="/tela_de_jogo.jpeg" alt="" draggable="false" onError={(e)=>{e.target.style.display='none';}}
        style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',height:'100%',width:'auto',maxWidth:'none',pointerEvents:'none',zIndex:0}} />
      <GameEngine keysRef={keysRef} onScoreUpdate={setScore} onLivesUpdate={setLives} onWaveUpdate={setWave} onGameOver={(s)=>onGameOver(s)} onPrize={fireToast} onBossWarning={noop} onBossUpdate={setBossS} cheatMode={playerData?.phone===CHEAT_PHONE} />

      {/* HUD */}
      <div style={{position:'absolute',top:0,left:0,right:0,zIndex:20,height:52,background:'linear-gradient(180deg,rgba(4,6,15,0.97) 0%,rgba(4,6,15,0.6) 80%,transparent 100%)',borderBottom:'1px solid #2ec4b622',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',pointerEvents:'none',fontFamily:"'Orbitron',monospace"}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{fontSize:8,fontWeight:900,color:'#e8b84b',letterSpacing:2}}>🍪 BISCOITÊ</div>
          <div style={{fontSize:6,color:'#e84393',letterSpacing:3}}>L O V E R S</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:7,color:'#4a7090',letterSpacing:3}}>PONTUAÇÃO</div>
          <div style={{fontSize:24,fontWeight:900,color:'#e8b84b',letterSpacing:3,lineHeight:1,textShadow:'0 0 20px #e8b84b88'}}>{score.toLocaleString('pt-BR')}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:7,color:'#4a7090',letterSpacing:2}}>JOGADOR</div>
          <div style={{fontSize:12,fontWeight:900,color:'#2ec4b6',fontFamily:"'Press Start 2P',monospace"}}>{playerData?.playerId||'???'}</div>
        </div>
      </div>

      <div style={{position:'absolute',top:56,left:12,zIndex:20,display:'flex',flexDirection:'column',gap:4,pointerEvents:'none'}}>
        <div style={{fontSize:7,color:'#4a7090',letterSpacing:2,fontFamily:"'Orbitron',monospace"}}>VIDAS</div>
        <div style={{display:'flex',gap:6}}>
          {[0,1].map(i=>(<img key={i} src={i<lives?'/vida_cheio.png':'/vida_vazio.png'} alt="" style={{width:28,height:28,objectFit:'contain',imageRendering:'pixelated',filter:'drop-shadow(0 0 6px #ff446688)'}} />))}
        </div>
      </div>
      <div style={{position:'absolute',top:56,right:12,zIndex:20,pointerEvents:'none',fontFamily:"'Orbitron',monospace"}}>
        <div style={{fontSize:7,color:'#4a7090',letterSpacing:2}}>FASE</div>
        <div style={{fontSize:16,fontWeight:900,color:'#2ec4b6',textShadow:'0 0 10px #2ec4b666',textAlign:'right'}}>W{wave}</div>
      </div>

      <BossHUD boss={bossS} />

      {/* JOYSTICK GIGANTE PARA TOTEM 43" */}
      <div style={{position:'absolute',bottom:40,left:0,right:0,zIndex:30,display:'flex',justifyContent:'center'}}>
        <div style={{position:'relative',width:320,height:320,pointerEvents:'auto'}}>
          <DBtn pos={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)'}} label="▲" {...dir('up')} />
          <DBtn pos={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)'}} label="▼" {...dir('down')} />
          <DBtn pos={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)'}} label="◀" {...dir('left')} />
          <DBtn pos={{position:'absolute',right:0,top:'50%',transform:'translateY(-50%)'}} label="▶" {...dir('right')} />
        </div>
      </div>
      {toast&&<Toast msg={toast} onDone={()=>{setToast(null);setTimeout(flushT,300);}} />}
    </div>
  );
}

/* BOTÕES MAIORES (100px para o Totem 43") */
function DBtn({label,pos,...handlers}){
  const [p,setP]=useState(false);
  return(
    <button
      style={{
        ...pos,
        width:100,
        height:100,
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:45,
        borderRadius:24,userSelect:'none',
        background:p?'rgba(59,195,204,0.6)':'rgba(255,255,255,0.1)',
        border:`3px solid ${p?'rgba(59,195,204,0.9)':'rgba(255,255,255,0.2)'}`,
        color:p?'#ffffff':'rgba(255,255,255,0.7)',
        boxShadow:p?'0 0 25px rgba(59,195,204,0.8)':'0 0 10px rgba(0,0,0,0.5)',
        outline:'none',WebkitTapHighlightColor:'transparent',cursor:'pointer',
      }}
      onTouchStart={(e)=>{setP(true);handlers.onTouchStart?.(e);}}
      onTouchEnd={(e)=>{setP(false);handlers.onTouchEnd?.(e);}}
      onTouchCancel={(e)=>{setP(false);handlers.onTouchCancel?.(e);}}
      onMouseDown={(e)=>{setP(true);handlers.onMouseDown?.(e);}}
      onMouseUp={(e)=>{setP(false);handlers.onMouseUp?.(e);}}
      onMouseLeave={(e)=>{setP(false);handlers.onMouseLeave?.(e);}}
    >
      {label}
    </button>
  );
}

/* ══ GAME OVER COM PRÊMIOS ══ */
function GameOverScreen({score, playerData, onRetry, onHome}){
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const genCoupon = () => {
      const c='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const s=()=>Array.from({length:4},()=>c[Math.floor(Math.random()*c.length)]).join('');
      return `${s()}-${s()}-${s()}-${s()}`;
    };

    async function processPrizes(){
      const day = new Date().toISOString().split('T')[0];

      try {
        // Tentar salvar score via API
        await fetch('/api/score', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({phone:playerData.phone, playerId:playerData.playerId, score}),
        });

        // Verificar prêmios existentes via API
        const existingRes = await fetch(`/api/prize?phone=${playerData.phone}`);
        const existing = await existingRes.json();
        const alreadyClaimed = (existing.prizes||[]).map(p=>p.type);

        // Resgatar prêmios elegíveis via API
        const newPrizes = [];
        if(score>=20_000 && !alreadyClaimed.includes('sacola') && !playerData.existingPrizes?.find(p=>p.type==='sacola')){
          const r=await fetch('/api/prize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:playerData.phone,playerId:playerData.playerId,prizeType:'sacola',score})});
          const d=await r.json();
          if(d.ok&&d.prize) newPrizes.push(d.prize);
        }
        if(score>=10_000 && !alreadyClaimed.includes('soft_cookie') && !playerData.existingPrizes?.find(p=>p.type==='soft_cookie')){
          const r=await fetch('/api/prize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:playerData.phone,playerId:playerData.playerId,prizeType:'soft_cookie',score})});
          const d=await r.json();
          if(d.ok&&d.prize) newPrizes.push(d.prize);
        }
        setPrizes(newPrizes);

      } catch(e){
        // ═══ FALLBACK OFFLINE ═══
        console.warn('API offline — prêmios via localStorage');
        
        // Salvar score localmente
        const scores = JSON.parse(localStorage.getItem('biscoite_scores')||'[]');
        scores.push({phone:playerData.phone, playerId:playerData.playerId, score, day, at:new Date().toISOString()});
        localStorage.setItem('biscoite_scores', JSON.stringify(scores));

        // Salvar no ranking local
        const ranking = JSON.parse(localStorage.getItem('biscoite_ranking')||'{}');
        if(!ranking[playerData.playerId] || score > ranking[playerData.playerId])
          ranking[playerData.playerId] = score;
        localStorage.setItem('biscoite_ranking', JSON.stringify(ranking));

        // Verificar prêmios locais
        const prizesKey = `biscoite_prizes_${playerData.phone}_${day}`;
        const localPrizes = JSON.parse(localStorage.getItem(prizesKey)||'[]');
        const alreadyClaimed = localPrizes.map(p=>p.type);

        const newPrizes = [];
        if(score>=20_000 && !alreadyClaimed.includes('sacola')){
          const p = {type:'sacola',name:'SACOLA SURPRESA',emoji:'🎁',coupon:genCoupon(),score};
          localPrizes.push(p); newPrizes.push(p);
        }
        if(score>=10_000 && !alreadyClaimed.includes('soft_cookie')){
          const p = {type:'soft_cookie',name:'SOFT COOKIE',emoji:'🍪',coupon:genCoupon(),score};
          localPrizes.push(p); newPrizes.push(p);
        }
        localStorage.setItem(prizesKey, JSON.stringify(localPrizes));
        setPrizes(newPrizes);
      }
      setLoading(false);
    }
    processPrizes();
  },[score,playerData]);

  return(
    <div className="relative w-full h-full flex flex-col items-center justify-start overflow-y-auto" style={{backgroundColor:'#02040a',paddingTop:40,paddingBottom:40}}>
      <img src="/tela_de_jogo.jpeg" alt="" draggable="false" onError={(e)=>{e.target.style.display='none';}}
        style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',height:'100%',width:'auto',maxWidth:'none',pointerEvents:'none',filter:'brightness(0.15) blur(3px)'}} />

      <div className="relative flex flex-col items-center gap-5 w-full px-6" style={{zIndex:10,maxWidth:420}}>
        <h1 className="pixelfont text-xl text-center leading-tight" style={{color:'#ef4444',textShadow:'0 0 30px #ef4444'}}>FIM DE JOGO</h1>

        <div style={{width:'100%',borderRadius:16,padding:'20px 24px',textAlign:'center',background:'rgba(15,23,42,0.95)',border:'2px solid rgba(71,85,105,0.8)'}}>
          <p style={{fontSize:8,color:'#4a7090',fontFamily:"'Press Start 2P',monospace",letterSpacing:2,marginBottom:4}}>JOGADOR</p>
          <p style={{fontSize:20,color:'#2ec4b6',fontFamily:"'Press Start 2P',monospace",fontWeight:900,marginBottom:12}}>{playerData?.playerId}</p>
          <p style={{fontSize:8,color:'#4a7090',fontFamily:"'Press Start 2P',monospace",letterSpacing:2,marginBottom:4}}>PONTUAÇÃO FINAL</p>
          <p className="font-mono font-black tabular-nums" style={{color:'#facc15',fontSize:42}}>{score.toLocaleString('pt-BR')}</p>
        </div>

        {/* Prêmios ganhos */}
        {loading ? (
          <p style={{fontSize:10,color:'#4a7090',fontFamily:"'Press Start 2P',monospace"}}>Verificando prêmios...</p>
        ) : prizes.length > 0 ? (
          <div style={{width:'100%',display:'flex',flexDirection:'column',gap:12}}>
            {prizes.map((p,i)=>(
              <div key={i} style={{
                width:'100%',borderRadius:16,padding:'20px 20px',textAlign:'center',
                background:p.type==='sacola'?'rgba(56,189,248,0.1)':'rgba(232,184,75,0.1)',
                border:`2px solid ${p.type==='sacola'?'#38bdf8':'#e8b84b'}`,
              }}>
                <p style={{fontSize:24,marginBottom:8}}>{p.emoji}</p>
                <p style={{fontSize:10,color:'#fff',fontFamily:"'Press Start 2P',monospace",fontWeight:900,marginBottom:4}}>{p.name}</p>
                <p style={{fontSize:8,color:'#8aabb8',fontFamily:"'Orbitron',monospace",marginBottom:12}}>
                  RESGATE COM A ATENDENTE COM O CUPOM:
                </p>
                <div style={{
                  background:'rgba(0,0,0,0.5)',borderRadius:10,padding:'12px 16px',
                  fontFamily:"'Press Start 2P',monospace",fontSize:14,color:'#2ec4b6',
                  letterSpacing:3,wordBreak:'break-all',
                  border:'2px dashed #2ec4b666',
                }}>
                  {p.coupon}
                </div>
              </div>
            ))}
          </div>
        ) : score >= 10_000 ? (
          <div style={{width:'100%',borderRadius:12,padding:'16px',textAlign:'center',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
            <p style={{fontSize:8,color:'#667788',fontFamily:"'Press Start 2P',monospace"}}>Prêmios já resgatados hoje! 🎉</p>
          </div>
        ) : null}

        <div style={{display:'flex',gap:12,width:'100%',marginTop:8}}>
          <button onClick={onRetry} className="pixelfont text-xs rounded-2xl font-black active:scale-95"
            style={{flex:2,padding:'18px 0',background:'#3bc3cc',color:'#0f172a',border:'4px solid rgba(255,255,255,0.2)',boxShadow:'0 0 20px rgba(59,195,204,0.5)'}}>
            JOGAR DE NOVO
          </button>
          <button onClick={onHome} className="pixelfont text-xs rounded-2xl font-black active:scale-95"
            style={{flex:1,padding:'18px 0',background:'rgba(255,255,255,0.05)',color:'#667788',border:'2px solid rgba(255,255,255,0.1)'}}>
            INÍCIO
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ ROOT ══ */
export default function App(){
  const [screen,setScreen]=useState('start');
  const [finalScore,setFinalScore]=useState(0);
  const [playerData,setPlayerData]=useState(null); // {phone, playerId, existingPrizes}
  const [ranking,setRanking]=useState([]);
  const gk=useRef(0);

  // Fetch ranking on mount and periodically
  useEffect(()=>{
    async function fetchRanking(){
      try {
        const r=await fetch('/api/ranking');
        const d=await r.json();
        if(d.ok&&d.ranking&&d.ranking.length>0) {
          setRanking(d.ranking.map((r,i)=>({pos:i+1,name:r.playerId,pts:r.pts})));
          return;
        }
      } catch(e){ /* API offline */ }

      // Fallback: ranking do localStorage
      const local = JSON.parse(localStorage.getItem('biscoite_ranking')||'{}');
      const sorted = Object.entries(local).sort((a,b)=>b[1]-a[1]).slice(0,5);
      if(sorted.length>0){
        setRanking(sorted.map(([id,pts],i)=>({pos:i+1,name:id,pts})));
      } else {
        // Ranking demo inicial
        setRanking([
          {pos:1,name:'ANA P',pts:21_500},{pos:2,name:'PEDRO',pts:19_800},
          {pos:3,name:'HUNA',pts:15_800},{pos:4,name:'JOÃO',pts:13_000},{pos:5,name:'MARIA',pts:11_000},
        ]);
      }
    }
    fetchRanking();
    const iv=setInterval(fetchRanking,15000);
    return()=>clearInterval(iv);
  },[]);

  const authKey = useRef(0);

  const handleAuth=useCallback((data)=>{
    setPlayerData(data);
    gk.current++;
    setScreen('game');
  },[]);

  const handleGameOver=useCallback((score)=>{
    setFinalScore(score);
    setScreen('gameover');
  },[]);

  // JOGAR DE NOVO — mesmo jogador, vai direto pro jogo
  const handleRetry=useCallback(()=>{
    gk.current++;
    setScreen('game');
  },[]);

  // INÍCIO — novo jogador, limpa tudo e volta pra tela inicial
  const handleHome=useCallback(()=>{
    setPlayerData(null);
    authKey.current++; // força AuthScreen resetar completamente
    setScreen('start');
  },[]);

  return(
    <div className="w-full h-full relative">
      {screen==='start'&&<StartScreen ranking={ranking} onStart={()=>setScreen('auth')} />}
      {screen==='auth'&&<AuthScreen key={authKey.current} onAuth={handleAuth} />}
      {screen==='game'&&<GameScreen key={gk.current} playerData={playerData} onGameOver={handleGameOver} />}
      {screen==='gameover'&&<GameOverScreen score={finalScore} playerData={playerData} onRetry={handleRetry} onHome={handleHome} />}
    </div>
  );
}