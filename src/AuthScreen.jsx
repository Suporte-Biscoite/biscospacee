/**
 * AuthScreen.jsx — Tela de autenticação
 * Fluxo:
 * 1. Digita telefone (teclado numérico touch)
 * 2. Digita ID de 3-4 caracteres (teclado alfanumérico)
 * 3. Registra via API e inicia jogo
 */
import { useState, useCallback } from 'react';

// Teclado numérico para totem touchscreen
function NumPad({ value, onChange, maxLen = 11 }) {
  const press = (n) => { if (value.length < maxLen) onChange(value + n); };
  const del = () => onChange(value.slice(0, -1));
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, width:'100%', maxWidth:320 }}>
      {keys.map((k, i) => k === '' ? <div key={i}/> : (
        <button key={i} onClick={() => k === '⌫' ? del() : press(k)}
          style={{
            height:56, fontSize:24, fontWeight:700, borderRadius:12,
            background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.15)',
            color:'#fff', cursor:'pointer', fontFamily:"'Orbitron',monospace",
            display:'flex', alignItems:'center', justifyContent:'center',
            WebkitTapHighlightColor:'transparent', outline:'none',
          }}>{k}</button>
      ))}
    </div>
  );
}

// Teclado alfanumérico para ID
function AlphaPad({ value, onChange, maxLen = 4 }) {
  const press = (c) => { if (value.length < maxLen) onChange((value + c).toUpperCase()); };
  const del = () => onChange(value.slice(0, -1));
  const rows = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
  const nums = '1234567890';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, width:'100%', maxWidth:400, alignItems:'center' }}>
      {/* Números */}
      <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
        {nums.split('').map(c => (
          <button key={c} onClick={() => press(c)}
            style={{ width:34, height:38, fontSize:14, fontWeight:700, borderRadius:8, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#e8b84b', cursor:'pointer', fontFamily:'monospace' }}>{c}</button>
        ))}
      </div>
      {/* Letras */}
      {rows.map((row, ri) => (
        <div key={ri} style={{ display:'flex', gap:4, justifyContent:'center' }}>
          {row.split('').map(c => (
            <button key={c} onClick={() => press(c)}
              style={{ width:34, height:42, fontSize:14, fontWeight:700, borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', cursor:'pointer', fontFamily:'monospace' }}>{c}</button>
          ))}
          {ri === 2 && (
            <button onClick={del}
              style={{ width:50, height:42, fontSize:12, borderRadius:8, background:'rgba(255,68,102,0.15)', border:'1px solid rgba(255,68,102,0.3)', color:'#ff4466', cursor:'pointer', fontFamily:'monospace' }}>⌫</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AuthScreen({ onAuth }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'id'
  const [phone, setPhone] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (p) => {
    const d = p.replace(/\D/g, '');
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
  };

  const handlePhoneNext = () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) { setError('Digite um telefone válido com DDD'); return; }
    setError('');
    setStep('id');
  };

  const handleRegister = useCallback(async () => {
    if (playerId.length < 3) { setError('ID deve ter 3-4 caracteres'); return; }
    setError('');
    setLoading(true);

    const cleanPhone = phone.replace(/\D/g, '');
    const cleanId = playerId.toUpperCase();

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, playerId: cleanId }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Erro ao registrar');
        setLoading(false);
        return;
      }

      // Sucesso via API — buscar prêmios já resgatados
      let existingPrizes = [];
      try {
        const pRes = await fetch(`/api/prize?phone=${cleanPhone}`);
        const pData = await pRes.json();
        existingPrizes = pData.prizes || [];
      } catch (e) { /* ignore */ }

      onAuth({ phone: cleanPhone, playerId: data.player?.playerId || cleanId, existingPrizes });

    } catch (err) {
      // ═══ FALLBACK OFFLINE (localStorage) ═══
      // Quando a API não está disponível (dev local), salva no localStorage
      console.warn('API offline — usando localStorage como fallback');
      
      const stored = JSON.parse(localStorage.getItem('biscoite_players') || '{}');
      
      // Verificar se ID já existe (de outro telefone)
      const idOwner = Object.entries(stored).find(([ph, p]) => p.playerId === cleanId && ph !== cleanPhone);
      if (idOwner) {
        setError('ID já em uso por outro jogador. Escolha outro.');
        setLoading(false);
        return;
      }

      // Registrar localmente
      stored[cleanPhone] = { phone: cleanPhone, playerId: cleanId, createdAt: new Date().toISOString() };
      localStorage.setItem('biscoite_players', JSON.stringify(stored));

      // Buscar prêmios locais
      const day = new Date().toISOString().split('T')[0];
      const localPrizes = JSON.parse(localStorage.getItem(`biscoite_prizes_${cleanPhone}_${day}`) || '[]');

      onAuth({ phone: cleanPhone, playerId: cleanId, existingPrizes: localPrizes, offline: true });
    }
  }, [phone, playerId, onAuth]);

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'#04060f', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:20, padding:24,
      fontFamily:"'Orbitron',monospace", userSelect:'none',
    }}>
      {/* Fundo */}
      <img src="/tela_de_inicio.jpeg" alt="" draggable="false"
        onError={(e) => { e.target.style.display = 'none'; }}
        style={{ position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',height:'100%',width:'auto',maxWidth:'none',pointerEvents:'none',opacity:0.2,zIndex:0 }} />

      <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', gap:16, width:'100%', maxWidth:400 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <div style={{ fontSize:36, fontWeight:900, color:'#e8b84b', fontFamily:"'Nunito',sans-serif" }}>🍪 Biscoitê</div>
          <div style={{ fontSize:9, color:'#e84393', letterSpacing:8 }}>L O V E R S</div>
        </div>

        {step === 'phone' ? (
          <>
            <p style={{ fontSize:11, color:'#4a7090', letterSpacing:2, textAlign:'center' }}>DIGITE SEU TELEFONE</p>
            <div style={{
              width:'100%', padding:'16px 20px', borderRadius:12,
              background:'rgba(15,23,42,0.9)', border:'2px solid #2ec4b644',
              fontSize:28, fontWeight:900, color:'#2ec4b6', textAlign:'center',
              fontFamily:"'Orbitron',monospace", letterSpacing:2,
              minHeight:60, display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {phone ? formatPhone(phone) : <span style={{ color:'#334455' }}>(00) 00000-0000</span>}
            </div>

            <NumPad value={phone} onChange={setPhone} maxLen={11} />

            {error && <p style={{ fontSize:9, color:'#ff4466', textAlign:'center' }}>{error}</p>}

            <button onClick={handlePhoneNext}
              disabled={phone.length < 10}
              style={{
                width:'100%', padding:'18px 0', borderRadius:12, fontSize:14,
                fontWeight:900, fontFamily:"'Press Start 2P',monospace",
                background: phone.length >= 10 ? '#2ec4b6' : 'rgba(255,255,255,0.05)',
                color: phone.length >= 10 ? '#0f172a' : '#334455',
                border:'none', cursor: phone.length >= 10 ? 'pointer' : 'default',
                letterSpacing:2,
              }}>
              PRÓXIMO →
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize:11, color:'#4a7090', letterSpacing:2, textAlign:'center' }}>CRIE SEU ID DE JOGADOR</p>
            <p style={{ fontSize:8, color:'#556677', textAlign:'center' }}>3-4 letras/números — estilo fliperama</p>

            <div style={{
              width:'100%', padding:'16px 20px', borderRadius:12,
              background:'rgba(15,23,42,0.9)', border:'2px solid #e8b84b44',
              fontSize:36, fontWeight:900, color:'#e8b84b', textAlign:'center',
              fontFamily:"'Press Start 2P',monospace", letterSpacing:8,
              minHeight:70, display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {playerId || <span style={{ color:'#334455', fontSize:18 }}>_ _ _ _</span>}
            </div>

            <AlphaPad value={playerId} onChange={setPlayerId} maxLen={4} />

            {error && <p style={{ fontSize:9, color:'#ff4466', textAlign:'center' }}>{error}</p>}

            <div style={{ display:'flex', gap:12, width:'100%' }}>
              <button onClick={() => { setStep('phone'); setError(''); }}
                style={{ flex:1, padding:'16px 0', borderRadius:12, fontSize:10, fontWeight:700, background:'rgba(255,255,255,0.05)', color:'#667788', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', fontFamily:"'Press Start 2P',monospace" }}>
                ← VOLTAR
              </button>
              <button onClick={handleRegister}
                disabled={playerId.length < 3 || loading}
                style={{
                  flex:2, padding:'16px 0', borderRadius:12, fontSize:12,
                  fontWeight:900, fontFamily:"'Press Start 2P',monospace",
                  background: playerId.length >= 3 ? '#e8b84b' : 'rgba(255,255,255,0.05)',
                  color: playerId.length >= 3 ? '#0f172a' : '#334455',
                  border:'none', cursor: playerId.length >= 3 ? 'pointer' : 'default',
                  letterSpacing:2,
                }}>
                {loading ? 'REGISTRANDO...' : 'JOGAR! 🚀'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}