/**
 * api/register.js — Vercel Serverless Function
 * Registrar jogador: telefone + ID único
 * 
 * Usa Vercel KV (Upstash Redis) - configurar no dashboard da Vercel:
 * 1. Ir em Storage > Create > KV
 * 2. Conectar ao projeto
 * 3. As env vars KV_REST_API_URL e KV_REST_API_TOKEN são criadas automaticamente
 * 
 * Schema no KV:
 * - player:{phone} → { phone, playerId, createdAt }
 * - id:{playerId} → phone (para checar unicidade)
 * - scores → sorted set (playerId → score)
 * - prizes:{phone}:{day} → [{ type, coupon, score, claimedAt }]
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, playerId } = req.body;
  if (!phone || !playerId) return res.status(400).json({ error: 'phone e playerId obrigatórios' });

  // Validar formato
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return res.status(400).json({ error: 'Telefone inválido' });
  
  const cleanId = playerId === '__CHECK__' ? null : playerId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  
  // Se é só verificação de telefone existente
  if (!cleanId) {
    try {
      const existingPlayer = await kv.get(`player:${cleanPhone}`);
      if (existingPlayer) {
        return res.status(200).json({ ok: true, player: existingPlayer, message: 'Jogador já registrado. Bem-vindo de volta!' });
      }
      return res.status(200).json({ ok: false, message: 'Telefone não cadastrado' });
    } catch (err) {
      return res.status(200).json({ ok: false, message: 'Telefone não cadastrado' });
    }
  }

  if (cleanId.length < 3) return res.status(400).json({ error: 'ID deve ter 3-4 caracteres alfanuméricos' });

  try {
    // Verificar se ID já existe (de outro telefone)
    const existingPhone = await kv.get(`id:${cleanId}`);
    if (existingPhone && existingPhone !== cleanPhone) {
      return res.status(409).json({ error: 'ID já em uso por outro jogador. Escolha outro.' });
    }

    // Verificar se telefone já tem um registro
    const existingPlayer = await kv.get(`player:${cleanPhone}`);
    if (existingPlayer) {
      // Telefone já registrado — retorna dados existentes
      return res.status(200).json({ 
        ok: true, 
        player: existingPlayer, 
        message: 'Jogador já registrado. Bem-vindo de volta!' 
      });
    }

    // Registrar novo jogador
    const player = { phone: cleanPhone, playerId: cleanId, createdAt: new Date().toISOString() };
    await kv.set(`player:${cleanPhone}`, player);
    await kv.set(`id:${cleanId}`, cleanPhone);

    return res.status(201).json({ ok: true, player, message: 'Jogador registrado com sucesso!' });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}