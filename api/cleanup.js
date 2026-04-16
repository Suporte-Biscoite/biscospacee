import { kv } from '@vercel/kv';

/**
 * GET /api/cleanup?secret=biscoite2025
 * 
 * Remove KAME do ranking e limpa dados de teste.
 * Execute UMA VEZ para corrigir os dados antigos.
 */

export default async function handler(req, res) {
  if (req.query.secret !== 'biscoite2025') {
    return res.status(401).json({ error: 'Acesso negado' });
  }

  const CHEAT_PHONE = '11948911448';
  const results = [];

  try {
    // 1. Remover KAME do ranking global
    try {
      await kv.zrem('ranking', 'KAME');
      results.push('Removido KAME do ranking global');
    } catch (e) { results.push('ranking global: ' + e.message); }

    // 2. Remover KAME do ranking do dia
    const today = new Date().toISOString().split('T')[0];
    try {
      await kv.zrem(`ranking:${today}`, 'KAME');
      results.push(`Removido KAME do ranking:${today}`);
    } catch (e) { results.push('ranking dia: ' + e.message); }

    // 3. Limpar prêmios do cheat user
    try {
      await kv.del(`prizes:${CHEAT_PHONE}`);
      results.push('Deletado prizes:11948911448');
    } catch (e) { results.push('prizes: ' + e.message); }

    // 4. Limpar cupons de teste
    let cursor = 0;
    let deletedCoupons = 0;
    do {
      const [nextCursor, keys] = await kv.scan(cursor, { match: 'coupon:TEST-KAME-*', count: 100 });
      cursor = nextCursor;
      for (const key of keys) {
        await kv.del(key);
        deletedCoupons++;
      }
    } while (cursor !== 0);
    results.push(`Deletados ${deletedCoupons} cupons de teste`);

    // 5. Verificar e resetar contadores se vouchers foram gastos pelo cheat
    const nutUsed = (await kv.get('used:nutella')) || 0;
    const pisUsed = (await kv.get('used:pistache')) || 0;
    const sacUsed = (await kv.get('used:sacola')) || 0;
    results.push(`Estoque atual — Nutella: ${25 - nutUsed}/25, Pistache: ${25 - pisUsed}/25, Sacola: ${100 - sacUsed}/100`);

    // 6. Limpar cupons reais que foram consumidos pelo cheat (checar isCheat flag)
    cursor = 0;
    let fixedCoupons = 0;
    do {
      const [nextCursor, keys] = await kv.scan(cursor, { match: 'coupon:*', count: 100 });
      cursor = nextCursor;
      for (const key of keys) {
        const data = await kv.get(key);
        if (data && data.isCheat) {
          await kv.del(key);
          fixedCoupons++;
          // Se era um cupom real (não TEST-KAME), decrementar o contador
          const couponCode = key.replace('coupon:', '');
          if (!couponCode.startsWith('TEST-KAME')) {
            if (data.prize?.includes('NUTELLA')) await kv.decr('used:nutella');
            else if (data.prize?.includes('PISTACHE')) await kv.decr('used:pistache');
            else if (data.prize?.includes('SACOLA')) await kv.decr('used:sacola');
            results.push(`Restaurado voucher: ${couponCode} (${data.prize})`);
          }
        }
      }
    } while (cursor !== 0);
    results.push(`Corrigidos ${fixedCoupons} cupons do cheat`);

    // Estoque final
    const nutFinal = (await kv.get('used:nutella')) || 0;
    const pisFinal = (await kv.get('used:pistache')) || 0;
    const sacFinal = (await kv.get('used:sacola')) || 0;
    results.push(`Estoque FINAL — Nutella: ${25 - nutFinal}/25, Pistache: ${25 - pisFinal}/25, Sacola: ${100 - sacFinal}/100`);

    return res.status(200).json({ ok: true, results });

  } catch (err) {
    return res.status(500).json({ error: err.message, results });
  }
}