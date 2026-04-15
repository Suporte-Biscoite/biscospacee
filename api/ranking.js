import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const day = req.query.day || new Date().toISOString().split('T')[0];
  const scope = req.query.scope || 'day'; // 'day' or 'all'

  try {
    const key = scope === 'all' ? 'ranking' : `ranking:${day}`;
    // ZREVRANGE com scores — top 5 maiores scores
    const top = await kv.zrange(key, 0, 4, { rev: true, withScores: true });
    
    // top vem como [member, score, member, score, ...]
    const ranking = [];
    for (let i = 0; i < top.length; i += 2) {
      ranking.push({ playerId: top[i], pts: top[i + 1] });
    }

    return res.status(200).json({ ok: true, ranking, day, scope });

  } catch (err) {
    console.error('Ranking error:', err);
    return res.status(200).json({ ok: true, ranking: [], day, scope });
  }
}