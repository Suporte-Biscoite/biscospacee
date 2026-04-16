import { kv } from '@vercel/kv';

const CHEAT_PHONE = '11948911448';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, playerId, score } = req.body;
  if (!phone || !playerId || score === undefined) return res.status(400).json({ error: 'Dados incompletos' });

  const cleanPhone = phone.replace(/\D/g, '');
  const day = new Date().toISOString().split('T')[0];
  const isCheat = cleanPhone === CHEAT_PHONE;

  try {
    // CHEAT não entra no ranking
    if (!isCheat) {
      const currentBest = await kv.zscore('ranking', playerId);
      if (!currentBest || score > currentBest) {
        await kv.zadd('ranking', { score, member: playerId });
      }
      const dayKey = `ranking:${day}`;
      const currentDayBest = await kv.zscore(dayKey, playerId);
      if (!currentDayBest || score > currentDayBest) {
        await kv.zadd(dayKey, { score, member: playerId });
      }
    }

    // Salvar histórico de partidas (cheat também, para debug)
    const matchKey = `matches:${cleanPhone}`;
    const match = { score, playerId, playedAt: new Date().toISOString(), day, isCheat };
    await kv.lpush(matchKey, JSON.stringify(match));

    return res.status(200).json({ ok: true, score });

  } catch (err) {
    console.error('Score error:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}