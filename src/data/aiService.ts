// ===== AI SERVICE (frontend) =====
// Calls /api/chat with the user's message + grow context

import { getGrow } from './storage';
import type { ChatMessage } from '../types';

const API_URL = '/api/chat';

export interface GrowContext {
  plants: Array<{
    name: string;
    strain: string;
    stage: string;
    day: number;
    week: number;
    environment: string;
    notes: string;
  }>;
  recentLogs: Array<{
    type: string;
    date: string;
    products: string[];
    ph?: number;
    ec?: number;
    waterAmount?: number;
    note: string;
  }>;
}

function buildGrowContext(): GrowContext {
  const grow = getGrow();
  const plants = grow.plants.filter((p) => !p.archived).map((p) => {
    const env = grow.environments.find((e) => e.id === p.environmentId);
    return {
      name: p.name,
      strain: p.strain,
      stage: p.stage,
      day: p.day,
      week: p.week,
      environment: env?.name || 'Unknown',
      notes: p.notes,
    };
  });

  const recentLogs = [...grow.logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((l) => ({
      type: l.type,
      date: l.date,
      products: l.products.map((p) => `${p.product} (${p.amount}${p.unit}${p.perGallon ? '/gal' : ''})`),
      ph: l.ph,
      ec: l.ec,
      waterAmount: l.waterAmount,
      note: l.note,
    }));

  return { plants, recentLogs };
}

export async function sendChatMessage(
  messages: ChatMessage[],
  includeContext = true
): Promise<{ reply: string; error?: string }> {
  try {
    const body: {
      messages: ChatMessage[];
      growContext?: GrowContext;
    } = { messages };

    if (includeContext) {
      body.growContext = buildGrowContext();
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        reply: '',
        error: err.error || `Server error (${res.status})`,
      };
    }

    const data = await res.json();
    return { reply: data.reply };
  } catch (err: any) {
    return {
      reply: '',
      error: err.message || 'Network error',
    };
  }
}
