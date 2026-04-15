import { kv } from '@vercel/kv';

/**
 * POST /api/prize — Resgatar prêmio
 * GET  /api/prize?phone=xxx — Verificar prêmios já resgatados
 * 
 * Regras:
 * - Soft Cookie: >= 10.000 pts
 * - Sacola Surpresa: >= 20.000 pts
 * - Cada prêmio só pode ser resgatado 1x por telefone por dia
 * - Se já resgatou no dia, não resgata de novo
 */

function generateCoupon() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  return `${seg()}-${seg()}-${seg()}-${seg()}`;
}

const PRIZES = {
  soft_cookie: { name: 'SOFT COOKIE', minScore: 10_000, emoji: '🍪' },
  sacola: { name: 'SACOLA SURPRESA', minScore: 20_000, emoji: '🎁' },
};

export default async function handler(req, res) {
  const day = new Date().toISOString().split('T')[0];

  // GET — verificar prêmios do jogador
  if (req.method === 'GET') {
    const phone = (req.query.phone || '').replace(/\D/g, '');
    if (!phone) return res.status(400).json({ error: 'phone obrigatório' });

    try {
      const prizesKey = `prizes:${phone}:${day}`;
      const claimed = await kv.get(prizesKey) || [];
      return res.status(200).json({ ok: true, prizes: claimed, day });
    } catch (err) {
      return res.status(200).json({ ok: true, prizes: [], day });
    }
  }

  // POST — resgatar prêmio
  if (req.method === 'POST') {
    const { phone, playerId, prizeType, score } = req.body;
    if (!phone || !playerId || !prizeType) return res.status(400).json({ error: 'Dados incompletos' });

    const cleanPhone = phone.replace(/\D/g, '');
    const prize = PRIZES[prizeType];
    if (!prize) return res.status(400).json({ error: 'Tipo de prêmio inválido' });
    if (score < prize.minScore) return res.status(400).json({ error: `Score insuficiente para ${prize.name}` });

    try {
      const prizesKey = `prizes:${cleanPhone}:${day}`;
      const claimed = await kv.get(prizesKey) || [];

      // Verificar se já resgatou este tipo hoje
      if (claimed.find(c => c.type === prizeType)) {
        return res.status(200).json({ 
          ok: false, 
          alreadyClaimed: true,
          message: `Você já resgatou ${prize.name} hoje!`,
          prizes: claimed,
        });
      }

      // Gerar cupom e salvar
      const coupon = generateCoupon();
      const prizeRecord = {
        type: prizeType,
        name: prize.name,
        emoji: prize.emoji,
        coupon,
        score,
        playerId,
        claimedAt: new Date().toISOString(),
      };

      claimed.push(prizeRecord);
      await kv.set(prizesKey, claimed);

      // Salvar também em registro global de cupons
      await kv.set(`coupon:${coupon}`, {
        phone: cleanPhone,
        playerId,
        prizeType,
        day,
        claimedAt: prizeRecord.claimedAt,
      });

      return res.status(200).json({
        ok: true,
        prize: prizeRecord,
        message: `🎉 Parabéns! Resgate seu ${prize.name} com a atendente!`,
      });

    } catch (err) {
      console.error('Prize error:', err);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}