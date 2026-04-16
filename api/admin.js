import { kv } from '@vercel/kv';

/**
 * GET /api/admin?secret=biscoite2025
 * 
 * Retorna todos os jogadores, scores e prêmios do banco de dados.
 * Acesse pelo navegador: https://seu-site.vercel.app/api/admin?secret=biscoite2025
 * 
 * Também mostra estoque restante de prêmios.
 */

const ADMIN_SECRET = 'biscoite2025';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  // Autenticação simples por query param
  if (req.query.secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Acesso negado. Use ?secret=biscoite2025' });
  }

  try {
    // Buscar todas as chaves de jogadores
    const playerKeys = [];
    let cursor = 0;
    do {
      const [nextCursor, keys] = await kv.scan(cursor, { match: 'player:*', count: 100 });
      cursor = nextCursor;
      playerKeys.push(...keys);
    } while (cursor !== 0);

    // Buscar dados de cada jogador
    const players = [];
    for (const key of playerKeys) {
      const data = await kv.get(key);
      if (data) {
        const phone = key.replace('player:', '');
        // Buscar prêmios deste jogador
        const prizes = await kv.get(`prizes:${phone}`) || [];
        // Buscar histórico de partidas
        const matches = await kv.lrange(`matches:${phone}`, 0, 10) || [];
        players.push({
          ...data,
          prizes,
          recentMatches: matches.map(m => {
            try { return JSON.parse(m); } catch { return m; }
          }),
        });
      }
    }

    // Ranking do dia
    const today = new Date().toISOString().split('T')[0];
    let ranking = [];
    try {
      const top = await kv.zrange(`ranking:${today}`, 0, 19, { rev: true, withScores: true });
      for (let i = 0; i < top.length; i += 2) {
        ranking.push({ playerId: top[i], score: top[i + 1] });
      }
    } catch (e) { /* empty */ }

    // Ranking global
    let globalRanking = [];
    try {
      const top = await kv.zrange('ranking', 0, 19, { rev: true, withScores: true });
      for (let i = 0; i < top.length; i += 2) {
        globalRanking.push({ playerId: top[i], score: top[i + 1] });
      }
    } catch (e) { /* empty */ }

    // Estoque de prêmios
    const stock = {
      soft_nutella:  { used: (await kv.get('used:nutella')) || 0,  total: 25 },
      soft_pistache: { used: (await kv.get('used:pistache')) || 0, total: 25 },
      sacola:        { used: (await kv.get('used:sacola')) || 0,   total: 100 },
    };
    stock.soft_nutella.remaining = stock.soft_nutella.total - stock.soft_nutella.used;
    stock.soft_pistache.remaining = stock.soft_pistache.total - stock.soft_pistache.used;
    stock.sacola.remaining = stock.sacola.total - stock.sacola.used;

    // Buscar todos os cupons usados
    const couponKeys = [];
    cursor = 0;
    do {
      const [nextCursor, keys] = await kv.scan(cursor, { match: 'coupon:*', count: 100 });
      cursor = nextCursor;
      couponKeys.push(...keys);
    } while (cursor !== 0);

    const coupons = [];
    for (const key of couponKeys) {
      const data = await kv.get(key);
      if (data) coupons.push({ coupon: key.replace('coupon:', ''), ...data });
    }

    return res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalPlayers: players.length,
        totalCouponsUsed: coupons.length,
        stock,
      },
      rankingToday: ranking,
      rankingGlobal: globalRanking,
      players: players.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
      coupons: coupons.sort((a, b) => (b.claimedAt || '').localeCompare(a.claimedAt || '')),
    });

  } catch (err) {
    console.error('Admin error:', err);
    return res.status(500).json({ error: 'Erro interno', details: err.message });
  }
}