/**
 * GameEngine.jsx v8 – Biscoitê Space Shooter
 * 
 * GAME DESIGN BALANCEADO:
 * - Prêmio 1 (Soft Cookie) = 10.000 pts → ~2-3 min de jogo
 * - Prêmio 2 (Sacola) = 20.000 pts → jogador bom
 * - Pontuação: inimigos 100-200, bosses 1000-3000
 * - Boss dano = 5 por hit, fases ativam em 50% HP
 * - Fundo portrait (object-fit contain para não distorcer)
 * - Ondas variadas com formações divertidas
 */

// ─── BALANCEAMENTO DE PONTUAÇÃO (baseado nos prêmios) ───
export const SCORE = {
  ENEMY_MIGALHA:   100,
  ENEMY_COBERTURA: 150,
  ENEMY_DARKBAKER: 200,
  PENALTY_ESCAPED: -250,  // -250 pts por inimigo que escapa
  BOSS_LIMONE:   5_000,   // Conforme PDF
  BOSS_TARTUFAO: 8_000,
  BOSS_OVERLORD: 15_000, // Conforme PDF
};

export const PRIZE_THRESHOLDS = [
  { pts: 10_000, msg: '🍪 PARABÉNS! VOCÊ GANHOU UM SOFT COOKIE!' },
  { pts: 20_000, msg: '🎁 PARABÉNS! VOCÊ GANHOU UMA SACOLA SURPRESA!' },
];

export const ONEUP_DROP_CHANCE = 0.0000001;
export const LOOP_MULTIPLIER = 1.2;
export const HIT_SHRINK = 0.55;
export const POWER_DURATION = 10_000;

// ─── BOSS BALANCE ───
// Dano por tiro = 5. Boss phases at 50% HP.
// Limonê: 300HP → 60 tiros, phase2 at 150HP
// Tartufão: 500HP → 100 tiros, phase2 at 250HP
// Overlord: 800HP → 160 tiros, phase2 at 400HP, phase3 at 200HP
const BOSS_DMG = 5;

import { useEffect, useRef } from 'react';

const rand=(a,b)=>Math.random()*(b-a)+a;
const randI=(a,b)=>Math.floor(rand(a,b+1));

function collides(a,b,s=HIT_SHRINK){
  const k=(1-s)/2;
  return a.x+a.w*k < b.x+b.w-b.w*k && a.x+a.w-a.w*k > b.x+b.w*k &&
         a.y+a.h*k < b.y+b.h-b.h*k && a.y+a.h-a.h*k > b.y+b.h*k;
}

const _c={};
function img(s){if(_c[s])return _c[s];const i=new Image();i.src=s;_c[s]=i;return i;}

const A={
  nave:['/nave_biscoite_frame_1.png','/nave_biscoite_frame_2.png','/nave_biscoite_frame_3.png','/nave_biscoite_frame_4.png'],
  migalha:['/mini_limone_move_f1.png','/mini_limone_move_f2.png','/mini_limone_move_f3.png','/mini_limone_move_f4.png'],
  cobertura:['/mini_tart_move_f1.png','/mini_tart_move_f2.png','/mini_tart_move_f3.png','/mini_tart_move_f4.png'],
  darkbaker:['/mini_cookie_move_f1.png','/mini_cookie_move_f2.png','/mini_cookie_move_f3.png','/mini_cookie_move_f4.png'],
  limone:['/limone_idle_f1.png','/limone_idle_f2.png','/limone_idle_f3.png'],
  tartufao:['/tartufao_idle_f1.png','/tartufao_idle_f2.png','/tartufao_idle_f3.png','/tartufao_idle_f4.png'],
  overlord:['/overlord_idle_f1.png','/overlord_idle_f2.png','/overlord_idle_f3.png'],
  projPadrao:['/proj_padrao_f1.png','/proj_padrao_f2.png'],
  projGranR:['/proj_gran_vermelho.png'],projGranT:['/proj_gran_teal.png'],
  projGranA:['/proj_gran_amarelo.png'],projGranP:['/proj_gran_rosa.png'],projGranX:['/proj_gran_roxo.png'],
  projGota:['/limone_proj_gota.png'],projPalito:['/tartufao_proj_palito.png'],projChip:['/overlord_proj_chip.png'],
  miniLP:['/mini_limone_proj_gota.png'],miniTP:['/mini_tart_proj_nevoa.png'],miniCP:['/mini_cookie_proj_chip.png'],
  dropVida:['/drop_vida_extra.png'],dropTurbo:['/drop_turbo.png'],
  dropGlace:['/drop_glace.png'],dropGran:['/drop_granulado.png'],dropBonus:['/drop_bonus_x2.png'],
  pts100:['/pontos_100.png'],pts400:['/pontos_400.png'],pts2000:['/pontos_2000.png'],
  pts5000:['/pontos_5000.png'],pts8000:['/pontos_8000.png'],pts15000:['/pontos_15000.png'],
};
Object.values(A).flat().forEach(s=>img(s));
const GC=['projGranR','projGranT','projGranA','projGranP','projGranX'];

const WAVES=[
  {types:['migalha'],             si:1500, spd:1.0, maxEn:12, boss:'limone',  bHp:300, bPts:SCORE.BOSS_LIMONE},
  {types:['migalha','cobertura'], si:1200, spd:1.4, maxEn:16, boss:'tartufao',bHp:500, bPts:SCORE.BOSS_TARTUFAO},
  {types:['migalha','cobertura','darkbaker'], si:900, spd:1.8, maxEn:20, boss:'overlord',bHp:800, bPts:SCORE.BOSS_OVERLORD},
];

const PATS=['line','v','diagonal','scatter','zigzag','arc'];

export default function GameEngine({
  keysRef, onScoreUpdate, onLivesUpdate, onWaveUpdate,
  onBossUpdate, onGameOver, onPrize, onBossWarning,
  cheatMode = false,
}){
  const canvasRef=useRef(null), boxRef=useRef(null);

  useEffect(()=>{
    const canvas=canvasRef.current, box=boxRef.current;
    if(!canvas||!box)return;
    const rect=box.getBoundingClientRect();
    const W=Math.round(rect.width), H=Math.round(rect.height);
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    const ctx=canvas.getContext('2d',{alpha:true});
    ctx.scale(dpr,dpr); ctx.imageSmoothingEnabled=false;

    let dead=false, raf;
    const u=W/100; // base unit from WIDTH (portrait = narrow)
    const nW=Math.round(u*9), nH=nW;
    const eW=Math.round(u*6), eH=eW;
    const bSz={limone:Math.round(u*18),tartufao:Math.round(u*22),overlord:Math.round(u*28)};
    const blW=Math.round(u*2.5), blH=Math.round(u*4);
    const drS=Math.round(u*5);

    const S={
      W,H, loopMult:1, waveIdx:0, phase:'spawning',
      spawnN:0, lastSpT:0, lastBlT:0, patIdx:0,
      score:0, lives:2, invUntil:0, pF:0, pFT:0,
      prizesFired:new Set(), power:{type:null,until:0},
      player:{x:W/2-nW/2, y:H-nH-160, w:nW, h:nH, speed:Math.max(3,Math.round(u*0.7))},
      bullets:[], eBullets:[], enemies:[], boss:null, drops:[], floats:[],
    };

    function draw(i,x,y,w,h){if(i&&i.complete&&i.naturalWidth)ctx.drawImage(i,x,y,w,h);}
    function hasPower(t,now){return S.power.type===t&&now<S.power.until;}
    function setPower(t,now){S.power.type=t;S.power.until=now+POWER_DURATION;}

    // ── Spawn patterns ──
    function spawnGroup(){
      const w=WAVES[S.waveIdx], pat=PATS[S.patIdx%PATS.length]; S.patIdx++;
      const ts=w.types, spd=w.spd*S.loopMult, m=eW*1.5;

      const mk=(x,y,t)=>({
        x,y,w:eW,h:eH, speed:spd+rand(-0.2,0.2),
        hp:1, type:t, frames:A[t].map(img), f:0, ft:0,
        pts:SCORE[`ENEMY_${t.toUpperCase()}`]||100,
        sT:rand(2500,6000), dx:rand(-0.2,0.2),
      });

      let spawned=0;
      switch(pat){
        case 'line':{
          const n=randI(4,6), gap=(W-m*2)/(n-1);
          for(let i=0;i<n;i++){S.enemies.push(mk(m+i*gap-eW/2, -eH-rand(10,40), ts[i%ts.length])); spawned++;}
          break;
        }
        case 'v':{
          const cx=W/2, t=ts[randI(0,ts.length-1)];
          [{x:0,y:0},{x:-eW*1.8,y:-eH*1.2},{x:eW*1.8,y:-eH*1.2},{x:-eW*3.5,y:-eH*2.4},{x:eW*3.5,y:-eH*2.4}].forEach(o=>{
            S.enemies.push(mk(cx+o.x-eW/2, -eH*3+o.y, t)); spawned++;
          });
          break;
        }
        case 'diagonal':{
          const left=Math.random()>0.5, n=4;
          for(let i=0;i<n;i++){
            const x=left?m+i*eW*2.2:W-m-i*eW*2.2-eW;
            S.enemies.push(mk(x, -eH*(n-i)*1.3, ts[i%ts.length])); spawned++;
          }
          break;
        }
        case 'scatter':{
          const n=randI(3,5);
          for(let i=0;i<n;i++){S.enemies.push(mk(rand(m,W-m-eW), -eH-rand(30,180), ts[randI(0,ts.length-1)])); spawned++;}
          break;
        }
        case 'zigzag':{
          const n=5;
          for(let i=0;i<n;i++){
            const x=m+(i/(n-1))*(W-m*2-eW);
            S.enemies.push(mk(x, -eH*1.8-(i%2)*eH*1.5, ts[i%ts.length])); spawned++;
          }
          break;
        }
        case 'arc':{
          const n=6, cx=W/2, r=W*0.3;
          for(let i=0;i<n;i++){
            const a=Math.PI+Math.PI*(i/(n-1));
            S.enemies.push(mk(cx+Math.cos(a)*r-eW/2, -eH*2+Math.sin(a)*r*0.5, ts[i%ts.length])); spawned++;
          }
          break;
        }
      }
      S.spawnN+=spawned;
    }

    function spawnBoss(){
      const w=WAVES[S.waveIdx], sz=bSz[w.boss];
      S.boss={
        x:W/2-sz/2, y:-sz-20, w:sz, h:sz, targetY:130,
        hp:Math.floor(w.bHp*S.loopMult), maxHp:Math.floor(w.bHp*S.loopMult),
        dx:1.8*S.loopMult, frames:A[w.boss].map(img), f:0, ft:0,
        name:w.boss, pts:w.bPts, sT:800,
        phase:1, // Boss phase tracking
      };
      S.phase='boss';
      onBossUpdate?.({active:true,hp:S.boss.hp,maxHp:S.boss.maxHp,name:w.boss,phase:1});
    }

    function nextWave(){
      S.waveIdx=(S.waveIdx+1)%WAVES.length;
      if(S.waveIdx===0)S.loopMult*=LOOP_MULTIPLIER;
      S.phase='spawning'; S.spawnN=0;
      onWaveUpdate?.(S.waveIdx+1);
      onBossUpdate?.({active:false,hp:0,maxHp:0,name:null,phase:0});
    }

    function firePlayer(now){
      const iv=Math.max(200,350/S.loopMult);
      if(now-S.lastBlT<iv)return;
      S.lastBlT=now;
      const cx=S.player.x+S.player.w/2, cy=S.player.y;
      const spd=Math.max(8,Math.round(u*1.5));
      if(hasPower('gran',now)){
        [-0.35,-0.17,0,0.17,0.35].forEach((a,i)=>{
          const gk=GC[i%5];
          S.bullets.push({x:cx-blW/2,y:cy-blH,w:blW,h:blH,speed:spd,dx:a*2.5,frames:(A[gk]||A.projPadrao).map(img),f:0,ft:0,dmg:BOSS_DMG});
        });
      } else {
        S.bullets.push({x:cx-blW/2,y:cy-blH,w:blW,h:blH,speed:spd,dx:0,frames:A.projPadrao.map(img),f:0,ft:0,dmg:BOSS_DMG});
      }
    }

    function fireEnemy(from,isBoss){
      const cx=from.x+from.w/2-blW/2, cy=from.y+from.h;
      const bossPhase=from.phase||1;
      if(isBoss){
        const pf=(from.name==='limone'?A.projGota:from.name==='tartufao'?A.projPalito:A.projChip).map(img);

        // ═══ LIMONÊ — Chuva cítrica: gotas caem em arco ═══
        if(from.name==='limone'){
          const count=bossPhase>=2?5:3;
          for(let i=0;i<count;i++){
            const angle=(i/(count-1)-0.5)*1.2; // spread de -0.6 a 0.6
            S.eBullets.push({x:cx,y:cy,w:blW,h:blH,speed:(3+bossPhase*0.8)*S.loopMult,dx:angle*2.5,frames:pf,f:0,ft:0});
          }
        }
        // ═══ TARTUFÃO — Rajada concentrada: 3 tiros rápidos em sequência ═══
        else if(from.name==='tartufao'){
          const burstCount=bossPhase>=2?4:2;
          for(let i=0;i<burstCount;i++){
            setTimeout(()=>{
              if(!S.boss)return;
              const bx=S.boss.x+S.boss.w/2-blW/2;
              // Mira no jogador
              const pdx=(S.player.x+S.player.w/2-bx)*0.015;
              S.eBullets.push({x:bx,y:S.boss.y+S.boss.h,w:blW,h:blH,speed:(4+bossPhase)*S.loopMult,dx:pdx,frames:pf,f:0,ft:0});
            },i*150);
          }
          // Fase 2: tiros laterais extras
          if(bossPhase>=2){
            S.eBullets.push({x:cx-from.w/3,y:cy,w:blW,h:blH,speed:3*S.loopMult,dx:-2,frames:pf,f:0,ft:0});
            S.eBullets.push({x:cx+from.w/3,y:cy,w:blW,h:blH,speed:3*S.loopMult,dx:2,frames:pf,f:0,ft:0});
          }
        }
        // ═══ OVERLORD — Padrão espiral: chips giram em espiral ═══
        else if(from.name==='overlord'){
          const count=bossPhase>=3?8:bossPhase>=2?6:4;
          for(let i=0;i<count;i++){
            const a=(Math.PI*2/count)*i+(from.angle||0);
            S.eBullets.push({
              x:cx,y:cy,w:blW,h:blH,
              speed:(3+bossPhase*0.5)*S.loopMult,
              dx:Math.cos(a)*2.5,
              dy:Math.sin(a)*1.5+2, // componente vertical
              frames:pf,f:0,ft:0,
            });
          }
          // Fase 3: onda central que persegue
          if(bossPhase>=3){
            const pdx=(S.player.x+S.player.w/2-cx)*0.02;
            S.eBullets.push({x:cx,y:cy,w:blW*2,h:blH*2,speed:5*S.loopMult,dx:pdx,frames:A.projChip.map(img),f:0,ft:0});
          }
        }
      } else {
        const pm={migalha:A.miniLP,cobertura:A.miniTP,darkbaker:A.miniCP};
        S.eBullets.push({x:cx,y:cy,w:blW,h:blH,speed:3*S.loopMult,dx:0,frames:(pm[from.type]||A.projPadrao).map(img),f:0,ft:0});
      }
    }

    function spawnDrop(x,y){
      const dx=x-drS/2;
      if(Math.random()<ONEUP_DROP_CHANCE){S.drops.push({x:dx,y,w:drS,h:drS,speed:2,type:'1up',frames:A.dropVida.map(img),f:0,ft:0});return;}
      if(Math.random()<0.25){
        const t=['turbo','glace','gran','bonus'][randI(0,3)];
        const fm={turbo:A.dropTurbo,glace:A.dropGlace,gran:A.dropGran,bonus:A.dropBonus};
        S.drops.push({x:dx,y,w:drS,h:drS,speed:2.5,type:t,frames:fm[t].map(img),f:0,ft:0});
      }
    }

    function addScore(pts,x,y){
      const mult=hasPower('bonus',performance.now())?2:1;
      S.score+=pts*mult; onScoreUpdate?.(S.score);
      // Float image based on pts value
      let src=A.pts100[0];
      if(pts>=2000)src=A.pts2000[0]; else if(pts>=400)src=A.pts400[0];
      S.floats.push({x,y,img:img(src),alpha:1,vy:-1,t:0});
      for(const th of PRIZE_THRESHOLDS)
        if(!S.prizesFired.has(th.pts)&&S.score>=th.pts){S.prizesFired.add(th.pts);onPrize?.(th.msg);}
    }

    function loseLife(now){
      if(now<S.invUntil)return;
      if(cheatMode){S.invUntil=now+500;return;} // CHEAT: vida infinita
      if(hasPower('glace',now)){S.power.type=null;S.power.until=0;S.invUntil=now+500;return;}
      S.lives=Math.max(0,S.lives-1);onLivesUpdate?.(S.lives);
      S.invUntil=now+2000;
      if(S.lives<=0){dead=true;onGameOver?.(S.score);}
    }

    /* === LOOP === */
    function loop(now){
      if(dead)return;
      raf=requestAnimationFrame(loop);
      const dt=16;
      ctx.clearRect(0,0,W,H);

      // Player
      const k=keysRef?.current??{};
      let spd=S.player.speed;
      if(hasPower('turbo',now))spd=Math.round(spd*1.5);
      if(k.left)S.player.x-=spd; if(k.right)S.player.x+=spd;
      if(k.up)S.player.y-=spd*0.65; if(k.down)S.player.y+=spd*0.65;
      S.player.x=Math.max(0,Math.min(S.player.x,W-S.player.w));
      S.player.y=Math.max(H*0.15,Math.min(S.player.y,H-S.player.h-10));

      S.pFT+=dt;if(S.pFT>120){S.pF=(S.pF+1)%4;S.pFT=0;}
      const inv=now<S.invUntil;
      if(!inv||Math.floor(now/120)%2===0)
        draw(img(A.nave[S.pF]),S.player.x,S.player.y,S.player.w,S.player.h);

      // Power visuals
      if(hasPower('glace',now)){ctx.save();ctx.strokeStyle='#2ec4b6';ctx.lineWidth=2;ctx.shadowColor='#2ec4b6';ctx.shadowBlur=14;ctx.globalAlpha=0.5+0.3*Math.sin(now/200);ctx.strokeRect(S.player.x-5,S.player.y-5,S.player.w+10,S.player.h+10);ctx.restore();}
      if(hasPower('turbo',now)){ctx.save();ctx.globalAlpha=0.5;const tx=S.player.x+S.player.w/2;ctx.fillStyle='#ff9a3c';ctx.fillRect(tx-4,S.player.y+S.player.h,8,14+Math.sin(now/80)*5);ctx.fillStyle='#ffe066';ctx.fillRect(tx-2,S.player.y+S.player.h+2,4,10);ctx.restore();}
      if(hasPower('bonus',now)){ctx.save();ctx.font=`bold ${Math.round(u*2)}px "Orbitron",monospace`;ctx.fillStyle='#e8b84b';ctx.textAlign='center';ctx.globalAlpha=0.8+0.2*Math.sin(now/250);ctx.fillText('×2',S.player.x+S.player.w/2,S.player.y-10);ctx.restore();}

      firePlayer(now);

      // Bullets
      S.bullets=S.bullets.filter(b=>{b.y-=b.speed;b.x+=(b.dx||0);if(b.y+b.h<0||b.x<-20||b.x>W+20)return false;b.ft+=dt;if(b.ft>80){b.f=(b.f+1)%b.frames.length;b.ft=0;}draw(b.frames[b.f],b.x,b.y,b.w,b.h);return true;});
      S.eBullets=S.eBullets.filter(eb=>{eb.y+=(eb.dy||eb.speed);eb.x+=(eb.dx||0);if(eb.y>H+10||eb.y<-20||eb.x<-30||eb.x>W+30)return false;eb.ft+=dt;if(eb.ft>100){eb.f=(eb.f+1)%eb.frames.length;eb.ft=0;}draw(eb.frames[eb.f],eb.x,eb.y,eb.w,eb.h);if(!inv&&collides(eb,S.player)){loseLife(now);return false;}return true;});

      // Spawning (max 8 enemies on screen at once)
      if(S.phase==='spawning'){
        const w=WAVES[S.waveIdx], si=Math.max(600,w.si/S.loopMult);
        if(S.spawnN<w.maxEn&&S.enemies.length<8&&now-S.lastSpT>si){spawnGroup();S.lastSpT=now;}
        if(S.spawnN>=w.maxEn&&S.enemies.length===0)spawnBoss();
      }

      // Enemies
      S.enemies=S.enemies.filter(en=>{
        en.y+=en.speed; en.x+=(en.dx||0);
        if(en.x<=0||en.x+en.w>=W)en.dx=(en.dx||0)*-1;
        en.x=Math.max(0,Math.min(en.x,W-en.w));
        if(en.y>H+10){S.score=Math.max(0,S.score-Math.abs(SCORE.PENALTY_ESCAPED));onScoreUpdate?.(S.score);return false;}
        en.ft+=dt;if(en.ft>110){en.f=(en.f+1)%en.frames.length;en.ft=0;}
        draw(en.frames[en.f],en.x,en.y,en.w,en.h);
        if(!inv&&collides(en,S.player)){loseLife(now);return false;}
        en.sT-=dt;if(en.sT<=0){fireEnemy(en,false);en.sT=rand(2500,6000)/S.loopMult;}
        let hit=false;
        S.bullets=S.bullets.filter(b=>{if(!hit&&collides(b,en)){en.hp-=1;hit=true;if(en.hp<=0){addScore(en.pts,en.x+en.w/2,en.y);spawnDrop(en.x+en.w/2,en.y+en.h/2);}return false;}return true;});
        return en.hp>0;
      });

      if(S.phase==='spawning'&&S.spawnN>=WAVES[S.waveIdx].maxEn&&S.enemies.length===0)spawnBoss();

      // Boss with PHASES — UNIQUE MOVEMENT PER BOSS
      if(S.boss){
        const b=S.boss;
        // Entrance
        if(b.y<b.targetY){ b.y+=3; }
        else {
          // ═══ LIMONÊ REX — Zigzag suave, desce um pouco e sobe ═══
          if(b.name==='limone'){
            b.x+=b.dx;
            if(b.x<=8||b.x+b.w>=W-8) b.dx*=-1;
            // Fase 2: movimento vertical ondulado
            if(b.phase>=2){
              b.y=b.targetY+Math.sin(now/600)*30;
              b.dx=Math.abs(b.dx)<3?b.dx*1.002:b.dx; // acelera gradualmente
            }
          }
          // ═══ TARTUFÃO — Dash-and-stop: corre rápido, para, atira, corre ═══
          else if(b.name==='tartufao'){
            if(!b.dashTimer) b.dashTimer=0;
            if(!b.dashing) b.dashing=true;
            b.dashTimer+=dt;
            if(b.dashing){
              b.x+=b.dx*2.2; // move rápido
              if(b.x<=8||b.x+b.w>=W-8){b.dx*=-1;}
              if(b.dashTimer>800){b.dashing=false;b.dashTimer=0;} // para depois de 800ms
            } else {
              // Parado — ameaçador
              if(b.dashTimer>600){b.dashing=true;b.dashTimer=0;} // volta a correr
            }
            // Fase 2: desce progressivamente e fica mais agressivo
            if(b.phase>=2){
              b.targetY=Math.min(b.targetY+0.02, H*0.35);
              b.y+=(b.targetY-b.y)*0.02;
            }
          }
          // ═══ COOKIE OVERLORD — Circular + persegue o jogador ═══
          else if(b.name==='overlord'){
            const centerX=W/2-b.w/2, centerY=b.targetY;
            const radius=W*0.25;
            // Fase 1: movimento circular
            if(b.phase===1){
              if(!b.angle) b.angle=0;
              b.angle+=0.015*S.loopMult;
              b.x=centerX+Math.cos(b.angle)*radius;
              b.y=centerY+Math.sin(b.angle)*radius*0.3;
            }
            // Fase 2: circular + persegue jogador no eixo X
            else if(b.phase===2){
              if(!b.angle) b.angle=0;
              b.angle+=0.02*S.loopMult;
              const targetX=S.player.x-b.w/2;
              b.x+=(targetX-b.x)*0.015; // persegue suavemente
              b.y=centerY+Math.sin(b.angle)*40;
            }
            // Fase 3: AVANÇO! — desce e persegue agressivamente
            else if(b.phase>=3){
              if(!b.angle) b.angle=0;
              b.angle+=0.03*S.loopMult;
              const targetX=S.player.x-b.w/2;
              b.x+=(targetX-b.x)*0.03;
              b.y=Math.min(centerY+80, b.targetY+60+Math.sin(b.angle)*50);
              // Treme quando em fase 3 (raiva)
              b.x+=Math.sin(now/50)*2;
            }
          }
          // Fallback
          else {
            b.x+=b.dx;
            if(b.x<=0||b.x+b.w>=W)b.dx*=-1;
          }
          // Clamp position
          b.x=Math.max(0,Math.min(b.x,W-b.w));
          b.y=Math.max(b.targetY-40,Math.min(b.y,H*0.45));
        }
        b.ft+=dt;if(b.ft>130){b.f=(b.f+1)%b.frames.length;b.ft=0;}
        draw(b.frames[b.f],b.x,b.y,b.w,b.h);

        // Boss shooting (faster in higher phases)
        const shootInterval=Math.max(400, (1200-b.phase*200)/S.loopMult);
        b.sT-=dt;
        if(b.sT<=0&&b.y>=b.targetY){fireEnemy(b,true);b.sT=shootInterval;}
        if(!inv&&collides(b,S.player))loseLife(now);

        // Boss hit detection
        S.bullets=S.bullets.filter(bl=>{
          if(collides(bl,b)){
            b.hp-=bl.dmg;
            // Check phase transitions
            const hpPct=b.hp/b.maxHp;
            if(b.name==='overlord'){
              if(hpPct<=0.25&&b.phase<3){b.phase=3;b.dx*=1.5;}
              else if(hpPct<=0.5&&b.phase<2){b.phase=2;b.dx*=1.3;}
            } else {
              if(hpPct<=0.5&&b.phase<2){b.phase=2;b.dx*=1.3;}
            }
            onBossUpdate?.({active:true,hp:Math.max(0,b.hp),maxHp:b.maxHp,name:b.name,phase:b.phase});
            if(b.hp<=0){
              addScore(b.pts,b.x+b.w/2,b.y);
              spawnDrop(b.x+b.w/2,b.y+b.h/2);
              spawnDrop(b.x+b.w/3,b.y+b.h/2);
              S.boss=null;
              onBossUpdate?.({active:false,hp:0,maxHp:0,name:null,phase:0});
              nextWave();
            }
            return false;
          }
          return true;
        });
      }

      // Drops
      S.drops=S.drops.filter(d=>{d.y+=d.speed;if(d.y>H+10)return false;d.ft+=dt;if(d.ft>140){d.f=(d.f+1)%d.frames.length;d.ft=0;}draw(d.frames[d.f],d.x,d.y,d.w,d.h);
        if(collides(d,S.player,1.0)){
          switch(d.type){case '1up':if(S.lives<2){S.lives++;onLivesUpdate?.(S.lives);}break;case 'gran':setPower('gran',now);break;case 'glace':setPower('glace',now);break;case 'turbo':setPower('turbo',now);break;case 'bonus':setPower('bonus',now);break;}
          S.floats.push({x:d.x+d.w/2,y:d.y,img:null,text:d.type==='1up'?'+1 VIDA':'POWER UP!',color:'#2ec4b6',alpha:1,vy:-1.5,t:0});return false;}return true;});

      // Floats
      S.floats=S.floats.filter(f=>{f.t+=dt;f.y+=f.vy;f.alpha=Math.max(0,1-f.t/900);ctx.globalAlpha=f.alpha;
        if(f.img)ctx.drawImage(f.img,f.x-24,f.y,48,18);
        else if(f.text){ctx.font=`bold ${Math.round(u*2.2)}px "Orbitron",monospace`;ctx.fillStyle=f.color||'#ff4466';ctx.textAlign='center';ctx.fillText(f.text,f.x,f.y);}
        ctx.globalAlpha=1;return f.t<900;});
    }

    raf=requestAnimationFrame(loop);
    onLivesUpdate?.(S.lives);onScoreUpdate?.(0);onWaveUpdate?.(1);
    return()=>{dead=true;cancelAnimationFrame(raf);};
  },[]);

  return(<div ref={boxRef} style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{position:'absolute',top:0,left:0,imageRendering:'pixelated',touchAction:'none'}}/></div>);
}