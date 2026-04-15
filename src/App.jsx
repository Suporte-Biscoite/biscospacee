/**
 * App.jsx v8 – Biscoitê Space Shooter
 * - Fundo portrait com object-fit:contain (sem zoom/distorção)
 * - Boss HUD com indicador de fase
 * - Prêmios: 10k = Soft Cookie, 20k = Sacola
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import GameEngine from './GameEngine';
import StartScreen from './StartScreen';

function Toast({msg,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[onDone]);
  return <div className="anim-toast fixed bottom-24 left-1/2 z-50 bg-yellow-400 text-slate-900 font-black text-center px-6 py-4 rounded-2xl shadow-2xl max-w-xs text-sm leading-snug" style={{transform:'translateX(-50%)'}}>{msg}</div>;
}

/* ═══ BOSS HUD com FASE ═══ */
const BC={
  limone:{label:'BOSS 01',name:'LIMONÊ REX',emoji:'🍋',color:'#f5d44a',glow:'rgba(245,212,74,0.4)',grad:'linear-gradient(90deg,#c8a010,#f5d44a,#ffe880,#f5d44a)'},
  tartufao:{label:'BOSS 02',name:'TARTUFÃO',emoji:'🫙',color:'#c99228',glow:'rgba(201,146,40,0.4)',grad:'linear-gradient(90deg,#7a5010,#c99228,#e8b84b,#c99228)'},
  overlord:{label:'BOSS FINAL',name:'COOKIE OVERLORD',emoji:'🍪',color:'#e84393',glow:'rgba(232,67,147,0.45)',grad:'linear-gradient(90deg,#8b0044,#e84393,#ff88cc,#e84393)'},
};
const PHASE_LABELS={1:'FASE 1',2:'FASE 2 — FÚRIA!',3:'FASE 3 — AVANÇO!!'};

function BossHUD({boss}){
  if(!boss?.active)return null;
  const c=BC[boss.name]||BC.limone;
  const pct=Math.max(0,boss.hp/boss.maxHp);
  const dng=pct<0.2;
  const col=dng?'#ff4466':c.color;
  const phase=boss.phase||1;
  return(
    <div style={{position:'absolute',bottom:220,left:'50%',transform:'translateX(-50%)',width:'min(380px,92%)',zIndex:25,fontFamily:"'Press Start 2P','Orbitron',monospace",pointerEvents:'none'}}>
      <div style={{display:'flex',alignItems:'center',gap:0,position:'relative',zIndex:2}}>
        <div style={{width:44,height:44,border:`2px solid ${col}`,borderBottom:'none',borderRadius:'6px 6px 0 0',background:'#08101e',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:`0 0 10px ${c.glow}`}}>{c.emoji}</div>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:1,padding:'0 8px 3px',borderBottom:`2px solid ${col}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:6,color:col,letterSpacing:2,opacity:0.7}}>{c.label}</span>
            {phase>=2&&<span style={{fontSize:5,color:dng?'#ff4466':'#ff8800',letterSpacing:1,background:'rgba(0,0,0,0.6)',padding:'1px 4px',borderRadius:2}}>{PHASE_LABELS[phase]||`FASE ${phase}`}</span>}
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

function GameScreen({onGameOver}){
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
      {/* Fundo portrait — CONTAIN para não distorcer, centralizado */}
      <img src="/tela_de_jogo.jpeg" alt="" draggable="false"
        onError={(e)=>{e.target.style.display='none';}}
        style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',height:'100%',width:'auto',maxWidth:'none',pointerEvents:'none',zIndex:0}} />

      <GameEngine keysRef={keysRef} onScoreUpdate={setScore} onLivesUpdate={setLives} onWaveUpdate={setWave} onGameOver={onGameOver} onPrize={fireToast} onBossWarning={noop} onBossUpdate={setBossS} />

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
          <div style={{fontSize:7,color:'#4a7090',letterSpacing:2}}>FASE</div>
          <div style={{fontSize:16,fontWeight:900,color:'#2ec4b6',textShadow:'0 0 10px #2ec4b666'}}>W{wave}</div>
        </div>
      </div>

      <div style={{position:'absolute',top:56,left:12,zIndex:20,display:'flex',flexDirection:'column',gap:4,pointerEvents:'none'}}>
        <div style={{fontSize:7,color:'#4a7090',letterSpacing:2,fontFamily:"'Orbitron',monospace"}}>VIDAS</div>
        <div style={{display:'flex',gap:6}}>
          {[0,1].map(i=>(<img key={i} src={i<lives?'/vida_cheio.png':'/vida_vazio.png'} alt="" style={{width:28,height:28,objectFit:'contain',imageRendering:'pixelated',filter:'drop-shadow(0 0 6px #ff446688)'}} />))}
        </div>
      </div>

      <BossHUD boss={bossS} />

      <div style={{position:'absolute',bottom:24,left:0,right:0,zIndex:30,display:'flex',justifyContent:'center'}}>
        <div style={{position:'relative',width:200,height:180,pointerEvents:'auto'}}>
          <DBtn pos={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)'}} label="▲" {...dir('up')} />
          <DBtn pos={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)'}} label="▼" {...dir('down')} />
          <DBtn pos={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)'}} label="◀" {...dir('left')} />
          <DBtn pos={{position:'absolute',right:0,top:'50%',transform:'translateY(-50%)'}} label="▶" {...dir('right')} />
          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:48,height:48,borderRadius:10,background:'rgba(59,195,204,0.06)',border:'1px solid rgba(59,195,204,0.15)'}} />
        </div>
      </div>
      {toast&&<Toast msg={toast} onDone={()=>{setToast(null);setTimeout(flushT,300);}} />}
    </div>
  );
}

function DBtn({label,pos,onTouchStart,onTouchEnd,onTouchCancel,onMouseDown,onMouseUp,onMouseLeave}){
  const [p,setP]=useState(false);
  return(<button style={{...pos,width:64,height:64,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,borderRadius:16,userSelect:'none',cursor:'pointer',background:p?'rgba(59,195,204,0.4)':'rgba(255,255,255,0.07)',border:`2px solid ${p?'rgba(59,195,204,0.9)':'rgba(255,255,255,0.15)'}`,color:p?'#3bc3cc':'rgba(255,255,255,0.5)',boxShadow:p?'0 0 16px rgba(59,195,204,0.6)':'none',outline:'none',WebkitTapHighlightColor:'transparent'}}
    onTouchStart={(e)=>{setP(true);onTouchStart?.(e);}} onTouchEnd={(e)=>{setP(false);onTouchEnd?.(e);}} onTouchCancel={(e)=>{setP(false);onTouchCancel?.(e);}} onMouseDown={(e)=>{setP(true);onMouseDown?.(e);}} onMouseUp={(e)=>{setP(false);onMouseUp?.(e);}} onMouseLeave={(e)=>{setP(false);onMouseLeave?.(e);}}>{label}</button>);
}

function GameOverScreen({score,onRetry}){
  return(
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6 gap-8 overflow-hidden" style={{backgroundColor:'#02040a'}}>
      <img src="/tela_de_jogo.jpeg" alt="" draggable="false" onError={(e)=>{e.target.style.display='none';}}
        style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',height:'100%',width:'auto',maxWidth:'none',pointerEvents:'none',filter:'brightness(0.2) blur(3px)'}} />
      <div className="relative flex flex-col items-center gap-6 w-full max-w-sm" style={{zIndex:10}}>
        <h1 className="pixelfont text-2xl text-center leading-tight" style={{color:'#ef4444',textShadow:'0 0 30px #ef4444, 0 0 60px #ef4444'}}>FIM<br/>DE<br/>JOGO</h1>
        <img src="/nave_biscoite_frame_4.png" alt="" style={{width:60,height:60,objectFit:'contain',opacity:.4,transform:'rotate(180deg)',imageRendering:'pixelated'}} />
        <div style={{width:'100%',borderRadius:16,padding:'24px 32px',textAlign:'center',background:'rgba(15,23,42,0.9)',border:'2px solid rgba(71,85,105,0.8)'}}>
          <p className="pixelfont text-xs mb-1" style={{color:'#64748b'}}>PONTUAÇÃO FINAL</p>
          <p className="font-mono font-black tabular-nums" style={{color:'#facc15',fontSize:48}}>{score.toLocaleString('pt-BR')}</p>
          {score>=10_000&&<p className="pixelfont text-xs mt-3" style={{color:'#4ade80'}}>🍪 SOFT COOKIE GARANTIDO!</p>}
          {score>=20_000&&<p className="pixelfont text-xs mt-1" style={{color:'#38bdf8'}}>🎁 SACOLA SURPRESA!</p>}
        </div>
        <button onClick={onRetry} className="w-full py-5 pixelfont text-sm rounded-2xl font-black active:scale-95" style={{background:'#3bc3cc',color:'#0f172a',border:'4px solid rgba(255,255,255,0.2)',boxShadow:'0 0 30px rgba(59,195,204,0.7)'}}>TENTAR NOVAMENTE</button>
      </div>
    </div>
  );
}

export default function App(){
  const [screen,setScreen]=useState('start');
  const [finalScore,setFinalScore]=useState(0);
  const [ranking,setRanking]=useState([
    {pos:1,name:'ANA PAULA',pts:21_500},{pos:2,name:'PEDRO M.',pts:19_800},
    {pos:3,name:'HUNA A.',pts:15_800},{pos:4,name:'JOÃO B.',pts:13_000},{pos:5,name:'MARIA C.',pts:11_000},
  ]);
  const gk=useRef(0);
  const handleGO=useCallback((s)=>{setFinalScore(s);setRanking(p=>[...p,{pos:0,name:'VOCÊ',pts:s}].sort((a,b)=>b.pts-a.pts).slice(0,5).map((r,i)=>({...r,pos:i+1})));setScreen('gameover');},[]);
  const handleRetry=useCallback(()=>{gk.current++;setScreen('game');},[]);
  return(
    <div className="w-full h-full relative">
      {screen==='start'&&<StartScreen ranking={ranking} onStart={()=>setScreen('game')} />}
      {screen==='game'&&<GameScreen key={gk.current} onGameOver={handleGO} />}
      {screen==='gameover'&&<GameOverScreen score={finalScore} onRetry={handleRetry} />}
    </div>
  );
}