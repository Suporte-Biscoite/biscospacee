import { kv } from '@vercel/kv';

const CHEAT_PHONE = '11948911448';

const CUPONS_NUTELLA = [
  'G28N-TBTI-1Z82-072S','UQ0X-2VSC-TRFC-1ZEI','DRGG-9WSV-F79S-X90C','3ZF8-1I6Z-12X4-TV21',
  '0TKM-CBWL-DV5P-Q5NT','LM3Y-DB7B-2AS6-J95I','SUED-37FX-BRJM-UNOX','WBTA-3DQ9-SIFN-39AF',
  'LSRK-JKLJ-KSC2-6TZD','T81I-5XSB-H7CT-PDJO','X7T0-2BJD-YLZN-Q97E','CW62-GMVB-GJWW-98XU',
  'V33P-4NW1-B91L-35Q1','EF0F-8F4P-MSRT-PGXI','8W9N-RG8L-IZ0X-GJA6','VMZE-S131-DH74-V7SV',
  'C5TA-8RB5-1PA2-2TAA','S0Z2-TNJ1-JR3S-GVSJ','CQKK-2TDB-EYLW-QIPH','2OQ0-70XL-RZ15-42WQ',
  'Q6WC-ZLZA-JEWP-3OAP','FG2C-FM0L-84G0-I8Z8','139B-SNZV-LTPG-XN7D','G62D-DCWG-3BI9-LISQ',
  '6X5U-ANYF-QNSM-A26O','EB0S-8WJF-GDM8-L8H8','DMBU-1IY3-FYXZ-RFBX','6XC2-7JDV-XE7M-X9TL',
  'Y236-AEBS-TZAC-7ZPN','DHIT-NGU7-YQDF-8L9Z','G9EQ-PFPM-ESQ4-87U1','1J9C-CV5Q-NYAX-JDEY',
  'ML4R-YVHT-C2UH-CGDQ','Y65U-3L8X-HYTH-V1BK','2M8Y-EKXD-I2YQ-L1MC','7VY1-OZ0I-2GH8-WESF',
  '7UCB-IKS9-971Q-L56Z','S6YM-GSGO-SJIR-NO0L','XUZQ-ECFI-ILFU-YHFT','GQ83-EMEX-BLPY-A3BT',
  '4DMJ-4PBO-ZPL0-4I5A','IJ78-GAWN-WJ2A-7R2T','HZAV-0BUH-LWLA-4EB9','UNOU-9ZIH-2V5L-VP3M',
  'B1DC-BJ8Y-7AC2-YVHH','ET6S-IQ94-LL6T-ENB3','MBSB-080P-XTQY-O3U9','YCWG-55QO-GLV0-H0J6',
  '9DH9-ADCZ-9NPE-5M4A','ILS3-HZGQ-X97N-5H9C',
];
const CUPONS_PISTACHE = [
  'ILUN-N0B8-N3N8-91YK','SGM5-WYR0-VOL7-MG1W','EQQ4-RP8Z-PRIR-3C8J','Y88R-ZRH5-38XT-93RL',
  'XORY-6UWO-ZL2D-2AM5','UL2H-1RCE-5ZZ9-5AWI','FD6W-URTI-VV4S-9BB5','C6TQ-3FCP-QZ0M-ZYJC',
  'O1WN-MSC8-4N72-ZF3B','E6VS-OOQG-Y2S4-U0IR','RB1H-NK65-TT92-A6UY','ZJIE-5QHE-ZV3Q-WGFU',
  'C9KB-15YH-PWD1-4WYV','MTBU-WH3M-Z5BO-CQ06','QAK2-TCYT-T07V-NASR','4Y30-TNLA-QEB4-15SE',
  'RXKW-I6RH-P1P1-W0QG','7NLW-60T6-RZTP-O5Z3','I904-T3B5-6KB5-B7PL','7BLG-TU5D-DXQU-YANX',
  'GXWI-TUU5-WQUV-VKMB','1ZOD-A74T-9YJZ-UUZO','FDGM-YX6S-R0AU-OPIN','KLTN-1S3I-JYCQ-7LLY',
  '3P5Q-XIO2-PZME-7XD3','USWP-R4JT-TQH2-HS4Z','4YY7-9RAZ-C2Z1-D2DM','G1MN-47L9-ADVJ-O5WU',
  'MDOD-194P-LZKE-NZ99','03V8-ZY55-4UNP-7OF1','LU02-8NT3-QGSS-DX49','FRX9-VL85-AN9D-ZS0Q',
  'HKML-35XT-XYOG-Z9XU','RUSX-216H-RZ4W-VKPA','XCCO-UZVB-G6Z4-1Z0K','5OZC-4XHT-IG4S-3VX3',
  'SWQ5-98IY-OABA-CC1P','IZ1P-9JDY-Z3RS-57GF','DGH3-9DQV-AFCG-DOO8','GN2B-8NHK-05DQ-S72Q',
  'RA40-PDJD-EESJ-86X7','5L5D-HEBG-BXAF-PMU0','WTDN-DKCU-AYJ0-NVT7','7WO6-HXGW-7EPF-E0R0',
  'C6R9-3R7K-PUOX-KCW9','L4IY-42CT-JH5I-EPXL','TJZO-HULP-3AJ4-04LE','P9XF-U4YI-NV7Z-0GAT',
  'WLS1-ZJDQ-M99N-438L','L8EO-XIC3-7VPI-H9QX',
];
const CUPONS_SACOLA = [
  'M28E-8N23-4X2O-5TTQ','YWAL-2ILP-V4AX-Q4DO','E5HK-CVBJ-1RKX-3C13','8IBV-MQCV-0OR4-SF7A',
  'TL6S-VMHG-VVQ9-HSPB','HSKG-NFSL-IZ7B-T45F','3T1T-NX1T-2DYL-TQG0','0XG0-QCFI-YDV9-PM9J',
  '27QN-63J5-RIYI-SAD8','PYYL-2MUT-E03B-7JOJ','U3NF-5IZV-0AV9-CRRR','Q6JV-VL1V-GLA3-OE72',
  'J5IH-52C3-YB7E-FQBN','IMPY-3SHL-VS37-4MGX','BH74-PX5Q-SMVU-1N2O','56UI-I1TN-A09G-UJLN',
  'JZ84-WDJ4-U9DO-0W0Q','A4AU-7C61-KZDU-0EKM','0LVW-YMIZ-11CZ-W69M','UBAI-BZYJ-FWOG-NI48',
  '2HMB-OWQW-YXS2-S719','7V2M-3P0Q-HPFE-3E1Y','7LJQ-R8KE-MCRJ-FX2M','AYD8-X9QV-MI0D-FG11',
  '6TL2-FZKO-VFVJ-WYCC','WXL3-JT96-RUEZ-LCLN','RD2E-R4UR-4NX1-MPU0','U4YB-W6SG-GCRL-0VGO',
  'WLQP-MPXI-Y2TC-ATQB','0RIO-JP1U-R5VI-YGIT','M8H9-AQJA-OD5T-Q7XU','XKXM-RFBA-6VNJ-16X3',
  '8ENE-P296-Z3S7-N5Y8','PHND-N5UK-VXEV-SCIH','7BCS-0OW5-COU0-S2QL','XTIP-W3OK-FXH0-H92H',
  'M64V-HYVQ-AQNA-Q0U9','MSPN-YO0Q-TF53-69K9','E3US-L804-9OZI-LFIK','2GP0-5448-5VZB-G3KS',
  'AKJT-RDZD-KSHC-OF8O','H7FN-ZNO5-0HVE-LJ94','K8GQ-GGEH-N6JS-AGEN','YXUA-FTOJ-BNCF-3JGR',
  'PFSE-BNXU-8O34-884T','5MAE-68HC-22YV-28LT','X12I-SQ3T-YCR4-ZA53','6RF7-JHLT-1KAZ-9AOQ',
  '4I9Z-1TRO-FGO8-3C1C','NEMY-0HZI-ZX4C-QIAV','AN1J-OGP8-R2MP-2XGO','HXG7-MB1P-HR5R-4K70',
  '1UF9-4GX7-TVNJ-01BP','VBGU-217Q-ITKW-C4UB','94G5-9I12-58RG-TJVK','QNF6-Q60Q-18AO-LDS4',
  '667I-FNEP-T366-EC6R','X2DY-FY4R-OQ0N-RV8H','FKHL-8SMB-HPMK-0L4L','L7RG-18DU-XKVI-OZR6',
  'F9MT-DD7M-QDU1-NO7V','TAT0-2NQ5-HLQJ-DMYS','8ARR-H5N3-9LJQ-RU1Y','81ST-35IB-V4R8-TDLQ',
  'W33Y-3WEV-YDRO-6QMR','GVG6-2U6U-08GI-RHCL','2PSH-VKKK-JCHS-VU3N','NSSP-GQ8K-P7ZF-791F',
  'EN9T-H2MF-C1LW-12XY','711G-FRAT-CO39-LJEU','A46R-752E-1K6N-FZKJ','LTIB-GSX8-PN1R-9JXO',
  '476G-QLET-CBHJ-I91P','HX20-POK2-K3O5-2B23','A51T-LW0H-LY0U-LYEK','C5KE-MNU4-4FEJ-VWYP',
  'F1VB-TC6Z-AGYB-GQJL','A0X7-0KBH-TASF-8WQJ','RIJG-MHN9-39P7-BI5B','5YFL-L27P-3OZN-8LKI',
  '3H25-T8H9-7COF-9RWD','7SKW-TS17-HHL8-CBJB','OA4Z-DGSL-1W9W-NUHL','SCFZ-HM84-3S1B-Q4A8',
  'DI5F-MER5-KEB5-C436','Q39Z-NWTK-3EV5-WSFC','TYIS-5R84-YYO2-HUA9','NYSA-7P82-FCOA-E9G8',
  '09NN-ZA5X-QH0S-WKSI','PXDL-3TTW-OYG9-SFIS','G1XF-8YXP-P4BS-CAAC','7IU3-XRUJ-FWWF-ZZVQ',
  '81JD-R1RU-M2RB-V575','PBV3-VBI8-6E2R-JJRS','OWD5-CN0Q-98US-JJ2B','O6TP-9G1Z-40LE-H3E8',
  'M62S-94OC-8KV9-TXB5','5MV5-08F6-UTC6-5QOY','M0J9-R6YC-PSVP-YSOQ','Q6F8-T5KA-FL1K-6LBD',
  'YPJI-H4HX-Q6ZS-EKHJ','A3OF-WI3T-GK84-XQ0F','SOBK-PQCH-MUQ3-BU8J','BQ8O-12UK-OTUG-KCOA',
  'BYB7-UGTL-TP02-F1LM','EE2G-TZ2V-XJG9-YBI9','Q4TU-ITZ9-PBNV-0ECI','0K0F-DL6I-GZ7Q-RJP1',
  'NZ7N-XQ5P-0R1I-1ERN','DXQV-K02H-2XWJ-EWW1','ZZ6H-NNOG-NOJA-W4LC','2NJX-BYGV-CWST-8ORI',
  'PE6R-6VOM-3PJA-7RIO','3HWN-PXLU-4ETW-JV4G','2I5N-MPM2-895K-JVSY','GG45-7TM2-GMW1-7ZSP',
  '1CB1-LEA6-6NCM-82RW','4FI5-8IIL-6II1-BPAI','S04R-EI0F-HDZ0-50IK','CGSH-2O41-7VRL-VICM',
  'SAZ4-BM0F-AYRB-0DY4','2KTC-7LIW-81U9-Z2QM','EHGD-4UL7-YGJV-86T8','C02E-4HWX-P8Y6-15VT',
  'Z9L6-CH5K-55JY-PUFC','6TDC-9LS7-IZRB-J721','Z1C9-UYMD-O93K-WAUU','TF5T-UXZ1-Z7BH-2R1A',
  '1H90-SWF0-ZM1K-SXII','BIEX-RLP5-TR6H-V8R0','CX6D-MXAN-TG2N-QIBC','G5MK-2N9W-R03E-LAYW',
  'UJ2T-02NM-HVVZ-GJUV','IROA-X46I-Q9L0-3T5I','NTQW-H17L-UMLK-DRKB','7J08-ACX9-JNXN-9KY4',
  'GVB9-WNXE-ETVE-2LEE','Z4KB-0D11-YSWJ-ACJZ','DOEK-7ROT-7ADK-U67J','HZWT-FDKQ-T06F-8K1B',
  'KEFB-ALOP-BJEJ-52TT','4VB9-O1E5-NZPI-7EXE','EGSK-VLLE-UFLK-38ZZ','65YE-9OC2-M6PO-RLCL',
  'Z84V-ZALH-PQ1P-K8DD','A1N4-7652-U8X6-RM6S','YGSA-ZHCP-6T6Q-1Q84','A5FJ-X1RE-ACSD-5UTI',
  'FJFN-ADXH-S1HU-7Z1B','2AFG-OQ4D-4DXY-ZF50','OPOO-SRMO-8RI6-ZH25','GZTQ-5O15-KF1G-UMQJ',
  'BBXY-OQMP-W69Q-CAQJ','Y6EU-220H-2M0O-2UTC','S0IQ-86D2-RTM5-ZWXD','AOZL-RS97-G3Y0-HNFG',
  'QGHR-4UKX-GPMQ-6AGH','BLUJ-GGKC-K1CG-LYEM','E0SN-SV3F-BYVG-HCKW','MVCI-UFVB-AFGQ-ZOX2',
  'RYUC-0DSX-5N23-HDBU','WQ1X-R48I-DWBR-LWXI','RKYD-3H3P-IZ3W-F95Z','92VI-OAU2-04K3-FN87',
  'XHD5-DJHW-K32S-RZPC','UJJS-LQO8-9ZMM-XJXN','GEMP-OA2O-QKLZ-RGA8','AEGH-28KP-A17K-8BGI',
  'JBUZ-ZTNQ-WERE-UY5I','OQIE-5AK7-H5SX-X0PD','CLNT-R7VC-ZPK4-KNXO','7S5I-CMU1-EVSU-9AZY',
  'ZA7F-W6L2-2D1N-82RN','CQQX-SVQW-4JM3-6SF8','DR8C-PS4R-KW9O-449Q','IFVB-9KC3-3MP7-82P9',
  'FZKE-LJWP-GUZE-BU9H','0K5R-OUT9-VOQK-GU6S','6LO4-LA45-GD28-CEAS','85K1-YDCU-5JS7-ZQKX',
  'EBNG-0B8G-62SN-4TTD','3QSU-7EUZ-45UU-NXVN','FHPK-4V3S-KSH4-PQEF','JABV-8HA7-4QZO-YETO',
  '451V-GHBT-2ZWY-WNH8','XWET-WK4R-5HDJ-M54Y','QNDO-63P0-TKSK-5D3F','9VRN-SHJ4-SOYH-E04Y',
  'BYFX-4ZUU-HTN0-7TJU','VV3B-XHMH-B9SB-FRUJ','V9Q1-WC9J-DPLE-D0SW','U7TM-GBEN-FJZV-LDRA',
  'ID1E-W6KY-MILW-5U3Y','M5IC-HC93-2K6M-WP0Q','HRZD-9NHG-41WP-JX0N','C98E-PRZ3-EXLE-8HHL',
  'YF5Z-HS95-FYY8-PETB','AA0J-OTX2-BMUX-OG7G','VTLH-DM0L-6033-QU7D','63DR-DOAI-4V4I-ESJC',
];

const PRIZE_CONFIG = {
  soft_cookie: {
    name: 'SOFT COOKIE', minScore: 10_000, emoji: '🍪',
    pools: [
      { name: 'SOFT COOKIE NUTELLA',  coupons: CUPONS_NUTELLA,  stockKey: 'used:d2:nutella' },
      { name: 'SOFT COOKIE PISTACHE', coupons: CUPONS_PISTACHE, stockKey: 'used:d2:pistache' },
    ],
  },
  sacola: {
    name: 'SACOLA SURPRESA', minScore: 20_000, emoji: '🎁',
    pools: [
      { name: 'SACOLA SURPRESA', coupons: CUPONS_SACOLA, stockKey: 'used:d2:sacola' },
    ],
  },
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const phone = (req.query.phone || '').replace(/\D/g, '');
    if (!phone) return res.status(400).json({ error: 'phone obrigatório' });
    try {
      const claimed = await kv.get('prizes:' + phone) || [];
      return res.status(200).json({ ok: true, prizes: claimed });
    } catch (err) {
      return res.status(200).json({ ok: true, prizes: [] });
    }
  }

  if (req.method === 'POST') {
    const { phone, playerId, prizeType, score } = req.body;
    if (!phone || !playerId || !prizeType) return res.status(400).json({ error: 'Dados incompletos' });
    const cleanPhone = phone.replace(/\D/g, '');
    const config = PRIZE_CONFIG[prizeType];
    if (!config) return res.status(400).json({ error: 'Tipo de prêmio inválido' });
    if (score < config.minScore) return res.status(400).json({ error: 'Score insuficiente' });
    const isCheat = cleanPhone === CHEAT_PHONE;

    try {
      const day = new Date().toISOString().split('T')[0];
      const prizesKey = 'prizes:' + cleanPhone;
      const claimed = await kv.get(prizesKey) || [];

      // 1 por tipo POR DIA — quem ganhou ontem pode ganhar hoje
      const todayClaimed = claimed.filter(c => c.day === day);
      if (todayClaimed.find(c => c.type === prizeType) && !isCheat) {
        return res.status(200).json({
          ok: false, alreadyClaimed: true,
          message: 'Você já resgatou ' + config.name + ' hoje!',
          prizes: claimed,
        });
      }

      // CHEAT: retorna fake sem gravar
      if (isCheat) {
        const fakeCoupon = 'TEST-KAME-' + Math.random().toString(36).substring(2,6).toUpperCase() + '-0000';
        return res.status(200).json({
          ok: true,
          prize: { type: prizeType, name: config.pools[0].name, emoji: config.emoji, coupon: fakeCoupon, score, playerId, day, claimedAt: new Date().toISOString() },
          message: 'TESTE',
        });
      }

      // Procurar cupom disponível
      let chosenPool = null, chosenCoupon = null;
      for (const pool of config.pools) {
        const usedCount = (await kv.get(pool.stockKey)) || 0;
        if (usedCount < pool.coupons.length) {
          chosenPool = pool;
          chosenCoupon = pool.coupons[usedCount];
          break;
        }
      }
      if (!chosenCoupon) {
        return res.status(200).json({ ok: false, outOfStock: true, message: config.name + ' esgotado!' });
      }

      const rec = { type: prizeType, name: chosenPool.name, emoji: config.emoji, coupon: chosenCoupon, score, playerId, day, claimedAt: new Date().toISOString() };
      claimed.push(rec);
      await kv.set(prizesKey, claimed);
      await kv.incr(chosenPool.stockKey);
      await kv.set('coupon:' + chosenCoupon, { phone: cleanPhone, playerId, prize: chosenPool.name, day, claimedAt: rec.claimedAt });

      return res.status(200).json({ ok: true, prize: rec, message: 'Resgate seu ' + chosenPool.name + ' com a atendente!' });
    } catch (err) {
      console.error('Prize error:', err);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}