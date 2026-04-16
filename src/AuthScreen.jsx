import { useState, useCallback } from 'react';

// TECLADO NUMÉRICO GIGANTE
function NumPad({ value, onChange, maxLen = 11 }) {
  const press = (n) => { if (value.length < maxLen) onChange(value + n); };
  const del = () => onChange(value.slice(0, -1));
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, width:'100%', maxWidth:600 }}>
      {keys.map((k, i) => k === '' ? <div key={i}/> : (
        <button key={i} onClick={() => k === '⌫' ? del() : press(k)}
          style={{
            height:100, fontSize:48, fontWeight:700, borderRadius:20,
            background:'rgba(255,255,255,0.08)', border:'3px solid rgba(255,255,255,0.15)',
            color:'#fff', cursor:'pointer', fontFamily:"'Orbitron',monospace",
            display:'flex', alignItems:'center', justifyContent:'center',
            WebkitTapHighlightColor:'transparent', outline:'none',
            boxShadow: '0 0 15px rgba(0,0,0,0.5)',
          }}>{k}</button>
      ))}
    </div>
  );
}

// TECLADO ALFANUMÉRICO GIGANTE
function AlphaPad({ value, onChange, maxLen = 4 }) {
  const press = (c) => { if (value.length < maxLen) onChange((value + c).toUpperCase()); };
  const del = () => onChange(value.slice(0, -1));
  const rows = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
  const nums = '1234567890';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:850, alignItems:'center' }}>
      {/* Números */}
      <div style={{ display:'flex', gap:8, justifyContent:'center', width:'100%' }}>
        {nums.split('').map(c => (
          <button key={c} onClick={() => press(c)}
            style={{ flex: 1, height:80, fontSize:28, fontWeight:700, borderRadius:12, background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.12)', color:'#e8b84b', cursor:'pointer', fontFamily:'monospace' }}>{c}</button>
        ))}
      </div>
      {/* Letras */}
      {rows.map((row, ri) => (
        <div key={ri} style={{ display:'flex', gap:8, justifyContent:'center', width: ri === 0 ? '100%' : 'auto' }}>
          {row.split('').map(c => (
            <button key={c} onClick={() => press(c)}
              style={{ width: ri === 0 ? 'auto' : 70, flex: ri === 0 ? 1 : 'none', height:85, fontSize:32, fontWeight:700, borderRadius:12, background:'rgba(255,255,255,0.06)', border:'2px solid rgba(255,255,255,0.1)', color:'#fff', cursor:'pointer', fontFamily:'monospace' }}>{c}</button>
          ))}
          {ri === 2 && (
            <button onClick={del}
              style={{ width:100, height:85, fontSize:24, borderRadius:12, background:'rgba(255,68,102,0.15)', border:'2px solid rgba(255,68,102,0.3)', color:'#ff4466', cursor:'pointer', fontFamily:'monospace' }}>⌫</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AuthScreen({ onAuth }) {
  const [step, setStep] = useState('phone');
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
    setLoading(true);

    // Verificar se telefone já tem cadastro
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean, playerId: '__CHECK__' }),
      });
      const data = await res.json();
      // Se API retornou jogador existente, pula direto pro jogo
      if (data.ok && data.player && data.message?.includes('já registrado')) {
        let existingPrizes = [];
        try {
          const pRes = await fetch(`/api/prize?phone=${clean}`);
          const pData = await pRes.json();
          existingPrizes = pData.prizes || [];
        } catch (e) { /* ignore */ }
        setLoading(false);
        onAuth({ phone: clean, playerId: data.player.playerId, existingPrizes });
        return;
      }
    } catch (e) {
      // API offline — verificar localStorage
      const stored = JSON.parse(localStorage.getItem('biscoite_players') || '{}');
      if (stored[clean]) {
        const day = new Date().toISOString().split('T')[0];
        const localPrizes = JSON.parse(localStorage.getItem(`biscoite_prizes_${clean}_${day}`) || '[]');
        setLoading(false);
        onAuth({ phone: clean, playerId: stored[clean].playerId, existingPrizes: localPrizes, offline: true });
        return;
      }
    }

    // Telefone novo — pedir ID
    setLoading(false);
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

      let existingPrizes = [];
      try {
        const pRes = await fetch(`/api/prize?phone=${cleanPhone}`);
        const pData = await pRes.json();
        existingPrizes = pData.prizes || [];
      } catch (e) { /* ignore */ }

      onAuth({ phone: cleanPhone, playerId: data.player?.playerId || cleanId, existingPrizes });

    } catch (err) {
      // FALLBACK OFFLINE (localStorage)
      console.warn('API offline — usando localStorage como fallback');
      const stored = JSON.parse(localStorage.getItem('biscoite_players') || '{}');
      const idOwner = Object.entries(stored).find(([ph, p]) => p.playerId === cleanId && ph !== cleanPhone);
      if (idOwner) {
        setError('ID já em uso por outro jogador. Escolha outro.');
        setLoading(false);
        return;
      }
      stored[cleanPhone] = { phone: cleanPhone, playerId: cleanId, createdAt: new Date().toISOString() };
      localStorage.setItem('biscoite_players', JSON.stringify(stored));
      const day = new Date().toISOString().split('T')[0];
      const localPrizes = JSON.parse(localStorage.getItem(`biscoite_prizes_${cleanPhone}_${day}`) || '[]');
      onAuth({ phone: cleanPhone, playerId: cleanId, existingPrizes: localPrizes, offline: true });
    }
  }, [phone, playerId, onAuth]);

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'#04060f', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:30, padding:40,
      fontFamily:"'Orbitron',monospace", userSelect:'none',
    }}>
      {/* FUNDO DA AUTENTICAÇÃO */}
      <img src="/tela_de_inicio.jpeg" alt="" draggable="false"
        onError={(e) => { e.target.style.display = 'none'; }}
        style={{ position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',height:'100%',width:'auto',maxWidth:'none',pointerEvents:'none',opacity:0.3,zIndex:0 }} />

      <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', gap:24, width:'100%', maxWidth:800 }}>

        {/* Logo Gigante */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:64, fontWeight:900, color:'#e8b84b', fontFamily:"'Nunito',sans-serif", textShadow:'0 0 20px rgba(232,184,75,0.5)' }}>🍪 Biscoitê</div>
          <div style={{ fontSize:18, color:'#e84393', letterSpacing:12, marginTop: 5 }}>L O V E R S</div>
        </div>

        {step === 'phone' ? (
          <>
            <p style={{ fontSize:22, color:'#4a7090', letterSpacing:4, textAlign:'center' }}>DIGITE SEU TELEFONE</p>
            <div style={{
              width:'100%', maxWidth: 600, padding:'24px 30px', borderRadius:20,
              background:'rgba(15,23,42,0.9)', border:'3px solid #2ec4b644',
              fontSize:48, fontWeight:900, color:'#2ec4b6', textAlign:'center',
              fontFamily:"'Orbitron',monospace", letterSpacing:4,
              minHeight:100, display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: '0 0 25px rgba(46,196,182,0.2)',
            }}>
              {phone ? formatPhone(phone) : <span style={{ color:'#334455' }}>(00) 00000-0000</span>}
            </div>

            <NumPad value={phone} onChange={setPhone} maxLen={11} />

            {error && <p style={{ fontSize:18, color:'#ff4466', textAlign:'center', fontWeight: 'bold' }}>{error}</p>}

            <button onClick={handlePhoneNext}
              disabled={phone.length < 10}
              style={{
                width:'100%', maxWidth: 600, padding:'30px 0', borderRadius:20, fontSize:28,
                fontWeight:900, fontFamily:"'Press Start 2P',monospace",
                background: phone.length >= 10 ? '#2ec4b6' : 'rgba(255,255,255,0.05)',
                color: phone.length >= 10 ? '#0f172a' : '#334455',
                border:'none', cursor: phone.length >= 10 ? 'pointer' : 'default',
                letterSpacing:4, transition: '0.3s',
                boxShadow: phone.length >= 10 ? '0 0 30px rgba(46,196,182,0.6)' : 'none',
              }}>
              PRÓXIMO →
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize:22, color:'#4a7090', letterSpacing:4, textAlign:'center' }}>CRIE SEU ID DE JOGADOR</p>
            <p style={{ fontSize:16, color:'#556677', textAlign:'center', marginTop: -10 }}>3-4 letras/números — estilo fliperama</p>

            <div style={{
              width:'100%', maxWidth: 600, padding:'24px 30px', borderRadius:20,
              background:'rgba(15,23,42,0.9)', border:'3px solid #e8b84b44',
              fontSize:56, fontWeight:900, color:'#e8b84b', textAlign:'center',
              fontFamily:"'Press Start 2P',monospace", letterSpacing:12,
              minHeight:110, display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: '0 0 25px rgba(232,184,75,0.2)',
            }}>
              {playerId || <span style={{ color:'#334455', fontSize:32 }}>_ _ _ _</span>}
            </div>

            <AlphaPad value={playerId} onChange={setPlayerId} maxLen={4} />

            {error && <p style={{ fontSize:18, color:'#ff4466', textAlign:'center', fontWeight: 'bold' }}>{error}</p>}

            <div style={{ display:'flex', gap:20, width:'100%', maxWidth: 850 }}>
              <button onClick={() => { setStep('phone'); setError(''); }}
                style={{ flex:1, padding:'30px 0', borderRadius:20, fontSize:22, fontWeight:700, background:'rgba(255,255,255,0.05)', color:'#8899aa', border:'2px solid rgba(255,255,255,0.1)', cursor:'pointer', fontFamily:"'Press Start 2P',monospace" }}>
                ← VOLTAR
              </button>
              <button onClick={handleRegister}
                disabled={playerId.length < 3 || loading}
                style={{
                  flex:2, padding:'30px 0', borderRadius:20, fontSize:26,
                  fontWeight:900, fontFamily:"'Press Start 2P',monospace",
                  background: playerId.length >= 3 ? '#e8b84b' : 'rgba(255,255,255,0.05)',
                  color: playerId.length >= 3 ? '#0f172a' : '#334455',
                  border:'none', cursor: playerId.length >= 3 ? 'pointer' : 'default',
                  letterSpacing:3, transition: '0.3s',
                  boxShadow: playerId.length >= 3 ? '0 0 30px rgba(232,184,75,0.6)' : 'none',
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