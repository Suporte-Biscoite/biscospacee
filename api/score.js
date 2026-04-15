import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, playerId, score } = req.body;
  if (!phone || !playerId || score === undefined) return res.status(400).json({ error: 'Dados incompletos' });

  const cleanPhone = phone.replace(/\D/g, '');
  const day = new Date().toISOString().split('T')[0]; // '2025-04-17'

  try {
    // Salvar no ranking global (sorted set — mantém o maior score)
    const currentBest = await kv.zscore('ranking', playerId);
    if (!currentBest || score > currentBest) {
      await kv.zadd('ranking', { score, member: playerId });
    }

    // Salvar no ranking do dia
    const dayKey = `ranking:${day}`;
    const currentDayBest = await kv.zscore(dayKey, playerId);
    if (!currentDayBest || score > currentDayBest) {
      await kv.zadd(dayKey, { score, member: playerId });
    }

    // Salvar histórico de partidas
    const matchKey = `matches:${cleanPhone}`;
    const match = { score, playerId, playedAt: new Date().toISOString(), day };
    await kv.lpush(matchKey, JSON.stringify(match));

    return res.status(200).json({ ok: true, score, bestScore: Math.max(score, currentBest || 0) });

  } catch (err) {
    console.error('Score error:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}