// api/chat.ts — Vercel Edge Function (GPT-4o-mini with grow context)
// Uses standard Web API Request/Response (no @vercel/node needed)

const SYSTEM_PROMPT = `You are Genie, a friendly and knowledgeable cannabis grow assistant who speaks in Jamaican Patois.

RULES:
- ALWAYS respond in Jamaican Patois — this is non-negotiable
- Keep responses concise (2-3 sentences max for simple questions, a short paragraph for complex ones)
- Be warm, encouraging, and direct
- Never judge or shame the grower
- If you don't know something, say "Mi nuh sure bout dat one, boss" rather than making things up
- Use emojis sparingly but naturally

GROW KNOWLEDGE:
- Germination: 3-10 days, keep warm (70-85°F), moist but not soaked
- Seedling: 2-3 weeks, 18-24hr light, gentle watering, avoid strong nutrients
- Vegetative: 3-16 weeks, 18-24hr light, nitrogen-heavy feeding, top/train for shape
- Flowering: 8-11 weeks, 12/12 light, switch to phosphorus/potassium nutrients, drop humidity under 50%
- Harvest: when trichomes are milky (60-70%) with some amber, flush 1-2 weeks before

COMMON PRODUCTS YOU KNOW:
- Advanced Nutrients: Big Bud (bloom booster), Overdrive (late bloom), pH Perfect line
- General Hydroponics: FloraGro, FloraMicro, FloraBloom, CaliMagic
- Fox Farm: Tiger Bloom, Big Bloom, Grow Big
- Botanicare: Pure Blend Pro, Cal-Mag Plus`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrowContext {
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

export default async function handler(request: Request): Promise<Response> {
  // CORS
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  });

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), { status: 500, headers });
  }

  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages || [];
    const growContext: GrowContext | undefined = body.growContext;

    // Build system prompt with grow context
    let systemContent = SYSTEM_PROMPT;
    if (growContext && growContext.plants.length > 0) {
      systemContent += `\n\nGROWER'S CURRENT PLANTS:\n`;
      growContext.plants.forEach((p) => {
        systemContent += `- ${p.name} (${p.strain}): ${p.stage}, Day ${p.day}, Week ${p.week}, in ${p.environment}. Notes: ${p.notes || 'none'}\n`;
      });

      if (growContext.recentLogs.length > 0) {
        systemContent += `\nRECENT ACTIVITY:\n`;
        growContext.recentLogs.slice(0, 5).forEach((l) => {
          systemContent += `- ${l.date}: ${l.type}${l.products.length ? ' with ' + l.products.join(', ') : ''}${l.ph ? ', pH ' + l.ph : ''}${l.ec ? ', EC ' + l.ec : ''}${l.waterAmount ? ', ' + l.waterAmount + 'ml water' : ''}. ${l.note || ''}\n`;
        });
      }
    }

    const openAiMessages: ChatMessage[] = [
      { role: 'system', content: systemContent },
      ...messages,
    ];

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAiMessages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!openAiRes.ok) {
      const error = await openAiRes.text();
      console.error('OpenAI error:', error);
      return new Response(
        JSON.stringify({ error: 'OpenAI API error', details: error }),
        { status: 502, headers }
      );
    }

    const data = await openAiRes.json();
    const reply = data.choices?.[0]?.message?.content || 'Mi sorry, mi brain freeze up. Try again, boss.';

    return new Response(JSON.stringify({ reply }), { status: 200, headers });
  } catch (err: any) {
    console.error('Chat handler error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal error' }),
      { status: 500, headers }
    );
  }
}

export const config = {
  runtime: 'edge',
};
