/**
 * api.js — Client-side API helper
 * Comunicação com Vercel Serverless Functions
 * 
 * Endpoints:
 * POST /api/register  — Registrar jogador (telefone + ID)
 * POST /api/score     — Salvar score
 * GET  /api/ranking   — Top 5 ranking
 * POST /api/prize     — Gerar cupom de prêmio
 * GET  /api/prizes?phone=xxx — Verificar prêmios do jogador
 */

const API_BASE = ''; // Same origin

export async function registerPlayer(phone, playerId) {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, playerId }),
  });
  return res.json();
}

export async function saveScore(phone, playerId, score) {
  const res = await fetch(`${API_BASE}/api/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, playerId, score }),
  });
  return res.json();
}

export async function getRanking() {
  const res = await fetch(`${API_BASE}/api/ranking`);
  return res.json();
}

export async function claimPrize(phone, playerId, prizeType, score) {
  const res = await fetch(`${API_BASE}/api/prize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, playerId, prizeType, score }),
  });
  return res.json();
}

export async function getPlayerPrizes(phone) {
  const res = await fetch(`${API_BASE}/api/prizes?phone=${encodeURIComponent(phone)}`);
  return res.json();
}

/**
 * Gera cupom aleatório formato XXXX-XXXX-XXXX-XXXX
 */
export function generateCoupon() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  return `${seg()}-${seg()}-${seg()}-${seg()}`;
}