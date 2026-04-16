import { kv } from '@vercel/kv';

const CHEAT_PHONE = '11948911448';

// ═══════════════════════════════════════════════════════════
// CUPONS PRÉ-DEFINIDOS — DIA 1
// A atendente valida o cupom visualmente na tela do jogador
// ═══════════════════════════════════════════════════════════

const CUPONS_NUTELLA = [
  'QVZ9-8JSW-WLH0-QQW6','NN7Z-2L2M-ER6M-S17H','ILKY-NA0P-I5AZ-CTWF',
  'QOAA-LI5X-E6YU-PV3A','CCJG-V2TY-OJAK-QSZP','J3ZH-W3ON-JTHX-ZBZ8',
  'E84C-EO7E-7JN3-M2HQ','GGRW-Z4VH-GOG2-9WYA','9KBP-Y7TZ-28P9-JFRF',
  '7130-YGRK-B6UQ-QWPK','0ARI-IQ5J-XGMM-POD4','7DFL-EQVO-XNQP-MZON',
  'N3T3-J9ZW-IW2Z-RRNU','KPDH-8PEV-PWYV-WNPY','13AM-02MW-OW0G-EYAY',
  'T9TQ-FZPQ-N8BJ-D1JI','OVGO-O3UL-XGU0-2DAJ','IVH8-HSXC-IBQU-1J6H',
  '7TMT-K8I0-IJ2D-9FK2','U1QA-VMKZ-LY4H-195P','0GAZ-TVGO-IPBN-2AXP',
  'SKI9-YKX3-MTKR-Y6ZK','AVCB-E279-JKS7-KG02','SHF7-Q4IG-KUPW-J1PE',
  'GU9P-FUMR-NS9P-GB4W',
];

const CUPONS_PISTACHE = [
  'NM4I-BRX4-M7HQ-GA6J','CO21-JQE8-JXB1-TMW8','DKU6-L80N-Y8DY-829Z',
  'QAHF-8VF2-S0RC-PQBZ','QV4I-U2PJ-QCA6-8OBI','0772-AMIO-O39N-CDME',
  'ZO9E-8EYM-MVBF-8CVU','QHRU-BAPX-9CSH-8UGI','DJ9H-L6X8-8YBA-YSC5',
  'NAT4-FF3K-OUBI-V96K','0G05-O6HW-BGHV-UMC3','ER4Z-PN54-CWZ0-OCYM',
  '9AID-NE1U-X4LZ-2QGP','HGL1-SG2E-5RXV-AHSW','R87A-AQBH-IVYZ-OPIS',
  '416E-BK1M-NI33-DY72','UX64-4QIT-8G7K-9CGO','5ZL6-48Q7-2Y3U-PQHW',
  'YWND-I9WJ-C0JK-EB33','8ZFX-0GZC-HHRJ-17KW','FGF8-DA4I-0GRY-EQ38',
  'POUB-47JQ-SF5F-1US4','TLJE-8GN5-6X03-ZHL6','HRI6-NBOG-3V74-ASEZ',
  'JREK-51E2-Z01F-1WMW',
];

const CUPONS_SACOLA = [
  '3P9L-765Z-D5PV-NMU3','CQ9A-22AV-Q1TV-TOA1','FRMF-J8W3-1M9G-NZ4V',
  'JL4H-HEY3-IE59-8TKN','6WN5-RTQJ-9CYP-425Y','XXFM-1DBI-3IOB-KB8B',
  'FTWL-UGDO-UQDJ-TWV1','TYAJ-V1UE-0QXU-3386','TMIB-PRTJ-IPZJ-QIUQ',
  '74BG-9ONE-0N0R-ZXBN','PF5U-32GC-F7CV-Q5B6','G7DJ-GB2X-UZIH-6PB9',
  'WACX-YX1P-IN8D-6INY','OPHW-ULHY-7GSO-TDKY','NBZ3-VQGW-2GJ0-MI27',
  'PDO6-B5YY-7ZP7-1VJD','FWJ5-DYY6-T7E5-VPO3','GPIJ-POOS-QJ1N-FNXN',
  'SE7R-T2Q4-9OE5-MVHD','CE0W-ISHU-D9SC-I9U3','N2SX-DZI1-LN6M-NU4H',
  '1D92-NRFK-O8ST-LONO','WODX-IN3P-MOKM-BJVE','SQ2C-RLBU-7YLL-VJWF',
  '00A2-7TO3-RRZU-4IQ1','W5IE-MO1H-ULR6-S8MJ','SKVW-QYGI-LP1W-86XF',
  'GXSU-709N-6ZIE-AIR2','5CM7-4UYV-WTI5-KE07','3FKH-FKM0-5ZAA-A2BC',
  'PQSK-SIUA-ACF1-VXDA','TQS9-X8EL-VMQ0-GNWX','L2D4-10FL-CG6P-8PZ9',
  '1M11-T6F0-NZHJ-MUI1','JASO-W4S1-8IQS-RY9I','4TPU-BX22-3W2T-ERX4',
  'ELU7-4T5H-SYFE-06P6','EYKM-ZN2L-JTDH-XYX8','6G1O-Y0IF-1KPE-NFS0',
  '66W3-BEML-ZPPV-12RT','TXE2-T0YX-BCC7-4W0H','V0QZ-9I4I-PT6P-MZC4',
  'GZ5S-2XAJ-VVXF-BYED','IASN-Z4ZT-8141-TGBJ','JRCG-FB65-2J3L-MQIJ',
  'KOXE-UC8F-X2B0-8KT7','ITOG-Q71X-BFI0-S7LT','24B5-WUTO-0LT4-XHJ2',
  'GULF-9L7Q-LI6N-TY99','Q40X-EWNX-ER4J-XPJV','RJZ8-313U-IPW8-1HG7',
  'UOL8-ME8W-F7G9-AG6W','VLNE-2H9R-A4GE-AT7T','HUFC-GJT1-9HGS-UKWD',
  '16ST-63IU-T7XD-YGI6','1UET-IS64-13BE-LBU4','VYXP-SSXI-90XK-VB1Z',
  'EH97-M6G1-RRPW-7EXY','SQLU-QPEZ-2KB8-10W6','8BCO-B3F1-Y8S6-YHT8',
  '7I3C-FQ5B-JPY3-HBGD','FSOF-HQ99-LUQG-OP1W','XUS9-8E4N-GK88-VY6U',
  'BKO1-UPJX-CRNU-LNR3','LAG6-LMY5-1936-CO8Q','UTVB-J2XP-UWQX-24O8',
  'RGF4-QR0F-131R-2N1S','W8IA-2OGQ-I2IF-J8G2','X56T-VSJU-FSWE-EJN6',
  'SYGA-EH6Z-EMDA-KX92','WZ5L-4AXK-K7WF-J9K1','UIN2-M7BC-FTZ1-8AQ4',
  'INBE-XJVC-KDZG-BNZS','YGRM-5BKK-ZE86-O6SC','UFGO-8KE9-QD4E-HRGM',
  'NFIN-O2TU-J1DR-HBD4','UCT7-4Z99-KZZX-1QOE','T3RP-0GZY-JRPO-FW7Z',
  'YCOY-JJ52-3Y82-FAL4','34EQ-E9SJ-S68F-0OR2','646K-X1DO-15PC-ZX0S',
  'OPRI-0WM1-QBKK-0J93','E474-OTLX-VNG7-JP4V','XL22-04IL-DPXD-O1QV',
  'YF36-1XGU-M7JA-5X5A','BDT0-0V2P-0AT3-33JT','3V4J-Q4N2-ANIY-SGDZ',
  'LWMQ-9PPC-FVGD-6TVQ','KRU4-9B4X-Q828-AFK4','KVN1-D18T-SGJI-N8EJ',
  'L03B-PVC8-FSZS-2XBM','IZJM-95TM-56PD-M25Y','GPZV-QMHF-76EZ-Z5ZC',
  '1KQD-ZHMX-JK7A-YURQ','BOQW-JSTC-RE8I-EFWN','D522-P058-KS6B-HZTA',
  '8S3S-R47E-06DO-U82Z','DZ5S-BKXQ-ULZN-214O','B8L7-IMKL-B355-H3E2',
  '5UHN-6WE7-3S2I-TLN2',
];

// ═══════════════════════════════════════════════════════════

const PRIZE_CONFIG = {
  soft_cookie: {
    name: 'SOFT COOKIE', minScore: 10_000, emoji: '🍪',
    pools: [
      { name: 'SOFT COOKIE NUTELLA',  coupons: CUPONS_NUTELLA,  stockKey: 'used:nutella' },
      { name: 'SOFT COOKIE PISTACHE', coupons: CUPONS_PISTACHE, stockKey: 'used:pistache' },
    ],
  },
  sacola: {
    name: 'SACOLA SURPRESA', minScore: 20_000, emoji: '🎁',
    pools: [
      { name: 'SACOLA SURPRESA', coupons: CUPONS_SACOLA, stockKey: 'used:sacola' },
    ],
  },
};

export default async function handler(req, res) {
  // GET — verificar prêmios do jogador
  if (req.method === 'GET') {
    const phone = (req.query.phone || '').replace(/\D/g, '');
    if (!phone) return res.status(400).json({ error: 'phone obrigatório' });
    try {
      const claimed = await kv.get(`prizes:${phone}`) || [];
      return res.status(200).json({ ok: true, prizes: claimed });
    } catch (err) {
      return res.status(200).json({ ok: true, prizes: [] });
    }
  }

  // POST — resgatar prêmio
  if (req.method === 'POST') {
    const { phone, playerId, prizeType, score } = req.body;
    if (!phone || !playerId || !prizeType) return res.status(400).json({ error: 'Dados incompletos' });

    const cleanPhone = phone.replace(/\D/g, '');
    const config = PRIZE_CONFIG[prizeType];
    if (!config) return res.status(400).json({ error: 'Tipo de prêmio inválido' });
    if (score < config.minScore) return res.status(400).json({ error: 'Score insuficiente' });

    const isCheat = cleanPhone === CHEAT_PHONE;

    try {
      const prizesKey = `prizes:${cleanPhone}`;
      const claimed = await kv.get(prizesKey) || [];

      // Já resgatou este tipo? (1 por tipo por telefone, lifetime)
      if (claimed.find(c => c.type === prizeType) && !isCheat) {
        return res.status(200).json({
          ok: false, alreadyClaimed: true,
          message: `Você já resgatou ${config.name}!`,
          prizes: claimed,
        });
      }

      // Procurar cupom disponível no pool
      let chosenPool = null;
      let chosenCoupon = null;

      for (const pool of config.pools) {
        // Buscar quantos já foram usados deste pool
        const usedCount = (await kv.get(pool.stockKey)) || 0;
        if (usedCount < pool.coupons.length) {
          chosenPool = pool;
          chosenCoupon = pool.coupons[usedCount]; // Pega o próximo da lista
          break;
        }
      }

      if (!chosenCoupon && !isCheat) {
        return res.status(200).json({
          ok: false, outOfStock: true,
          message: `${config.name} esgotado! 😢`,
        });
      }

      // Cheat: usa cupom fake se acabou o estoque
      if (!chosenCoupon && isCheat) {
        chosenPool = config.pools[0];
        chosenCoupon = 'TEST-KAME-' + Math.random().toString(36).substring(2,6).toUpperCase() + '-0000';
      }

      const rec = {
        type: prizeType,
        name: chosenPool.name,
        emoji: config.emoji,
        coupon: chosenCoupon,
        score, playerId,
        claimedAt: new Date().toISOString(),
      };

      // Salvar prêmio no jogador
      claimed.push(rec);
      await kv.set(prizesKey, claimed);

      // Incrementar contador de usados (CHEAT NÃO CONSOME)
      if (!isCheat) {
        await kv.incr(chosenPool.stockKey);
      }

      // Log global do cupom
      await kv.set(`coupon:${chosenCoupon}`, {
        phone: cleanPhone, playerId, prize: chosenPool.name,
        claimedAt: rec.claimedAt, isCheat,
      });

      return res.status(200).json({
        ok: true,
        prize: rec,
        message: `🎉 Resgate seu ${chosenPool.name} com a atendente!`,
      });

    } catch (err) {
      console.error('Prize error:', err);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}