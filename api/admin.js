import { kv } from '@vercel/kv';

const ADMIN_SECRET = 'biscoite2025';
const CHEAT_PHONE = '11948911448';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  if (req.query.secret !== ADMIN_SECRET) return res.status(401).json({ error: 'Use ?secret=biscoite2025' });

  const format = req.query.format || 'json';
  const type = req.query.type || 'all';

  try {
    const playerKeys = [];
    let cursor = 0;
    do { const [n, k] = await kv.scan(cursor, { match: 'player:*', count: 200 }); cursor = n; playerKeys.push(...k); } while (cursor !== 0);

    const players = [];
    for (const key of playerKeys) {
      const data = await kv.get(key);
      if (data) {
        const phone = key.replace('player:', '');
        const prizes = await kv.get(`prizes:${phone}`) || [];
        const matches = await kv.lrange(`matches:${phone}`, 0, 50) || [];
        const parsedMatches = matches.map(m => { try { return JSON.parse(m); } catch { return { score: 0 }; } });
        players.push({
          phone: data.phone, playerId: data.playerId, createdAt: data.createdAt,
          isCheat: phone === CHEAT_PHONE, totalPrizes: prizes.length,
          prizes: prizes.map(p => `${p.name} (${p.coupon})`).join(' | '),
          prizesRaw: prizes, totalMatches: matches.length,
          bestScore: Math.max(0, ...parsedMatches.map(m => m.score || 0)),
          totalScore: parsedMatches.reduce((s, m) => s + (m.score || 0), 0),
        });
      }
    }

    const today = new Date().toISOString().split('T')[0];
    let rankingToday = [];
    try { const t = await kv.zrange(`ranking:${today}`, 0, 99, { rev: true, withScores: true }); for (let i = 0; i < t.length; i += 2) rankingToday.push({ pos: i/2+1, playerId: t[i], score: t[i+1] }); } catch (e) {}

    let rankingGlobal = [];
    try { const t = await kv.zrange('ranking', 0, 99, { rev: true, withScores: true }); for (let i = 0; i < t.length; i += 2) rankingGlobal.push({ pos: i/2+1, playerId: t[i], score: t[i+1] }); } catch (e) {}

    const couponKeys = [];
    cursor = 0;
    do { const [n, k] = await kv.scan(cursor, { match: 'coupon:*', count: 200 }); cursor = n; couponKeys.push(...k); } while (cursor !== 0);
    const coupons = [];
    for (const key of couponKeys) { const d = await kv.get(key); if (d) coupons.push({ coupon: key.replace('coupon:', ''), ...d }); }

    const stock = {
      nutella: { used: (await kv.get('used:nutella'))||0, total: 25 },
      pistache: { used: (await kv.get('used:pistache'))||0, total: 25 },
      sacola: { used: (await kv.get('used:sacola'))||0, total: 100 },
    };

    // ── CSV Export ──
    if (format === 'csv') {
      let csv = '';
      if (type === 'players' || type === 'all') {
        csv += 'TELEFONE,ID_JOGADOR,DATA_CADASTRO,MELHOR_SCORE,SCORE_TOTAL,TOTAL_PARTIDAS,PREMIOS\n';
        players.filter(p=>!p.isCheat).forEach(p => { csv += `${p.phone},${p.playerId},${p.createdAt},${p.bestScore},${p.totalScore},${p.totalMatches},"${p.prizes}"\n`; });
        if (type === 'all') csv += '\n';
      }
      if (type === 'ranking' || type === 'all') {
        csv += 'POSICAO,ID_JOGADOR,SCORE\n';
        rankingToday.filter(r=>r.playerId!=='KAME').forEach(r => { csv += `${r.pos},${r.playerId},${r.score}\n`; });
        if (type === 'all') csv += '\n';
      }
      if (type === 'prizes' || type === 'coupons' || type === 'all') {
        csv += 'CUPOM,TELEFONE,ID_JOGADOR,PREMIO,DATA_RESGATE\n';
        coupons.filter(c=>!c.isCheat).forEach(c => { csv += `${c.coupon},${c.phone},${c.playerId},${c.prize||''},${c.claimedAt}\n`; });
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="biscoite_${type}_${today}.csv"`);
      return res.status(200).send('\uFEFF' + csv);
    }

    // ── HTML Dashboard ──
    if (format === 'html') {
      const realPlayers = players.filter(p=>!p.isCheat).sort((a,b)=>b.bestScore-a.bestScore);
      const realCoupons = coupons.filter(c=>!c.isCheat);
      const realRanking = rankingToday.filter(r=>r.playerId!=='KAME');

      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Biscoitê Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;padding:20px;max-width:1200px;margin:0 auto}
h1{font-size:28px;color:#e8b84b;margin-bottom:8px}h2{font-size:18px;color:#2ec4b6;margin:24px 0 12px;padding:8px 12px;background:#1e293b;border-radius:8px;border-left:4px solid #2ec4b6}
.subtitle{color:#64748b;font-size:14px;margin-bottom:20px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:24px}
.stat{background:#1e293b;padding:16px;border-radius:12px;text-align:center}
.stat-num{font-size:32px;font-weight:900;color:#e8b84b}.stat-label{font-size:11px;color:#64748b;letter-spacing:2px;margin-top:4px}
.stock{display:flex;gap:8px;margin-top:8px;justify-content:center}
.stock-item{background:#0f172a;padding:4px 10px;border-radius:6px;font-size:12px}
.stock-ok{color:#4ade80}.stock-low{color:#fbbf24}.stock-out{color:#ef4444}
table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px}
th{background:#1e293b;color:#94a3b8;padding:10px 12px;text-align:left;font-size:11px;letter-spacing:1px;position:sticky;top:0}
td{padding:8px 12px;border-bottom:1px solid #1e293b}tr:hover td{background:#1e293b44}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700}
.badge-cookie{background:#e8b84b22;color:#e8b84b;border:1px solid #e8b84b44}
.badge-sacola{background:#2ec4b622;color:#2ec4b6;border:1px solid #2ec4b644}
.export-bar{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.btn{padding:8px 16px;border:2px solid #334155;border-radius:8px;background:#1e293b;color:#94a3b8;cursor:pointer;font-size:12px;text-decoration:none;display:inline-block}
.btn:hover{background:#334155;color:#fff}.btn-primary{border-color:#2ec4b6;color:#2ec4b6}.btn-primary:hover{background:#2ec4b6;color:#0f172a}
.mono{font-family:'Courier New',monospace;font-size:12px;letter-spacing:1px}
.updated{color:#475569;font-size:11px;margin-top:16px;text-align:center}
</style></head><body>
<h1>🍪 Biscoitê Space Shooter — Painel Admin</h1>
<p class="subtitle">Relatório do evento — ${today}</p>

<div class="export-bar">
  <a class="btn btn-primary" href="/api/admin?secret=${ADMIN_SECRET}&format=csv&type=all">📥 Exportar TUDO (CSV)</a>
  <a class="btn" href="/api/admin?secret=${ADMIN_SECRET}&format=csv&type=players">📥 Jogadores CSV</a>
  <a class="btn" href="/api/admin?secret=${ADMIN_SECRET}&format=csv&type=ranking">📥 Ranking CSV</a>
  <a class="btn" href="/api/admin?secret=${ADMIN_SECRET}&format=csv&type=coupons">📥 Cupons CSV</a>
  <a class="btn" href="/api/admin?secret=${ADMIN_SECRET}&format=json">📋 JSON Bruto</a>
</div>

<div class="stats">
  <div class="stat"><div class="stat-num">${realPlayers.length}</div><div class="stat-label">JOGADORES</div></div>
  <div class="stat"><div class="stat-num">${realCoupons.length}</div><div class="stat-label">PRÊMIOS RESGATADOS</div></div>
  <div class="stat">
    <div class="stat-num">${realRanking[0]?.score||0}</div><div class="stat-label">MELHOR SCORE</div>
    <div style="color:#2ec4b6;font-size:12px;margin-top:4px">${realRanking[0]?.playerId||'-'}</div>
  </div>
  <div class="stat">
    <div class="stat-label" style="margin-bottom:8px">ESTOQUE</div>
    <div class="stock">
      <span class="stock-item ${stock.nutella.total-stock.nutella.used>5?'stock-ok':stock.nutella.total-stock.nutella.used>0?'stock-low':'stock-out'}">🍪N ${stock.nutella.total-stock.nutella.used}/${stock.nutella.total}</span>
      <span class="stock-item ${stock.pistache.total-stock.pistache.used>5?'stock-ok':stock.pistache.total-stock.pistache.used>0?'stock-low':'stock-out'}">🍪P ${stock.pistache.total-stock.pistache.used}/${stock.pistache.total}</span>
      <span class="stock-item ${stock.sacola.total-stock.sacola.used>5?'stock-ok':stock.sacola.total-stock.sacola.used>0?'stock-low':'stock-out'}">🎁 ${stock.sacola.total-stock.sacola.used}/${stock.sacola.total}</span>
    </div>
  </div>
</div>

<h2>🏆 Ranking do Dia (${today})</h2>
<table><tr><th>#</th><th>JOGADOR</th><th>SCORE</th></tr>
${realRanking.map(r=>`<tr><td>${r.pos}</td><td class="mono">${r.playerId}</td><td>${Number(r.score).toLocaleString('pt-BR')}</td></tr>`).join('')}
${realRanking.length===0?'<tr><td colspan="3" style="text-align:center;color:#475569">Nenhum score ainda</td></tr>':''}
</table>

<h2>👥 Jogadores (${realPlayers.length})</h2>
<table><tr><th>TELEFONE</th><th>ID</th><th>CADASTRO</th><th>MELHOR</th><th>PARTIDAS</th><th>PRÊMIOS</th></tr>
${realPlayers.map(p=>`<tr>
<td class="mono">${p.phone}</td><td class="mono" style="color:#2ec4b6">${p.playerId}</td>
<td style="font-size:11px">${new Date(p.createdAt).toLocaleString('pt-BR')}</td>
<td style="color:#e8b84b">${Number(p.bestScore).toLocaleString('pt-BR')}</td>
<td>${p.totalMatches}</td>
<td>${p.prizesRaw.map(pr=>`<span class="badge ${pr.type==='sacola'?'badge-sacola':'badge-cookie'}">${pr.name}</span>`).join(' ')}</td>
</tr>`).join('')}
</table>

<h2>🎫 Cupons Resgatados (${realCoupons.length})</h2>
<table><tr><th>CUPOM</th><th>TELEFONE</th><th>JOGADOR</th><th>PRÊMIO</th><th>DATA</th></tr>
${realCoupons.map(c=>`<tr>
<td class="mono" style="color:#e8b84b">${c.coupon}</td><td class="mono">${c.phone}</td>
<td class="mono" style="color:#2ec4b6">${c.playerId}</td>
<td><span class="badge ${(c.prize||'').includes('SACOLA')?'badge-sacola':'badge-cookie'}">${c.prize||''}</span></td>
<td style="font-size:11px">${new Date(c.claimedAt).toLocaleString('pt-BR')}</td>
</tr>`).join('')}
${realCoupons.length===0?'<tr><td colspan="5" style="text-align:center;color:#475569">Nenhum cupom resgatado</td></tr>':''}
</table>

<p class="updated">Atualizado em ${new Date().toLocaleString('pt-BR')} — Recarregue para atualizar</p>
</body></html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    // ── JSON (default) ──
    return res.status(200).json({
      ok: true, timestamp: new Date().toISOString(),
      summary: {
        totalPlayers: players.filter(p=>!p.isCheat).length,
        totalCouponsUsed: coupons.filter(c=>!c.isCheat).length,
        stock: { nutella: `${stock.nutella.total-stock.nutella.used}/${stock.nutella.total}`, pistache: `${stock.pistache.total-stock.pistache.used}/${stock.pistache.total}`, sacola: `${stock.sacola.total-stock.sacola.used}/${stock.sacola.total}` },
      },
      rankingToday: rankingToday.filter(r=>r.playerId!=='KAME'),
      players: players.filter(p=>!p.isCheat).sort((a,b)=>b.bestScore-a.bestScore),
      coupons: coupons.filter(c=>!c.isCheat),
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}