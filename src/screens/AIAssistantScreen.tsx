// ===== AI ASSISTANT SCREEN =====
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions?: string[];
}

const GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  text: "Wha gwaan, boss? Mi name Genie. Mi can help yuh track di grow, check nutrients, or tell yuh when fi water. Ask mi anyting!",
  suggestions: [
    "When should I water today?",
    "What nutrients for flowering?",
    "How much light for seedlings?",
    "Check my plant health",
  ],
};

const MOCK_RESPONSES: Record<string, string> = {
  'water': "Check di soil, if di top inch dry, give dem a good drink. Mi see yuh water White Widow 2 days ago — maybe wait one more day fi let di roots breathe. 💧",
  'nutrient': "Flowering time now, so Big Bud & Overdrive a di move. Keep pH round 6.0-6.2. Watch di EC so it nuh burn di leaf. 🧪",
  'light': "Seedling need 18-20 hour light, low intensity. Keep LED about 24 inch away so dem nuh stretch too much. ☀️",
  'health': "Yuh plants lookin' healthy! White Widow Auto day 90 — trichomes should be milky soon. Keep eyes on humidity, drop it under 50% fi prevent mold inna bloom. 🌿",
  'help': "Mi can help yuh wid:\n• Water schedules\n• Nutrient recipes\n• Stage transitions\n• Problem diagnosis\n• Harvest timing\nJust ask!",
};

function uid() {
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function getMockReply(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, reply] of Object.entries(MOCK_RESPONSES)) {
    if (lower.includes(key)) return reply;
  }
  return "Respect, mi nuh fully understand dat one yet. Try ask about water, nutrients, light, or check fi see how yuh plants feelin'. 🇯🇲";
}

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: uid(), role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = getMockReply(text);
      const assistantMsg: Message = { id: uid(), role: 'assistant', text: reply };
      setMessages((prev) => [...prev, assistantMsg]);
      setTyping(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 18,
          background: 'var(--accent-soft)',
          display: 'grid', placeItems: 'center',
          fontSize: 20,
        }}>🧞</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-bright)' }}>Genie AI</div>
          <div style={{ fontSize: 11, color: 'var(--accent)' }}>Online · Jamaican Patois</div>
        </div>
      </header>

      <div ref={scrollRef} className="scroll-area">
        <div style={{ padding: '16px 16px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-raised)',
                color: msg.role === 'user' ? '#000' : 'var(--text)',
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}>
                {msg.text}
              </div>

              {msg.suggestions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {msg.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '8px 14px',
                        borderRadius: 20,
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-bright)',
                        fontSize: 13,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div style={{
              alignSelf: 'flex-start',
              padding: '10px 16px',
              borderRadius: '14px 14px 14px 4px',
              background: 'var(--surface-raised)',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: 3,
                  background: 'var(--text-dim)',
                  animation: `blink 1.4s infinite ${i * 0.2}s`,
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        padding: '10px 16px calc(10px + var(--safe-bottom))',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        gap: 10,
        flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask Genie..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 20,
            border: '1px solid var(--border)',
            background: 'var(--surface-raised)',
            color: 'var(--text-bright)',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          className="btn btn-primary"
          onClick={() => send(input)}
          disabled={!input.trim() || typing}
          style={{
            width: 40, height: 40, borderRadius: 20, padding: 0,
            opacity: !input.trim() || typing ? 0.4 : 1,
          }}
        >➤</button>
      </div>
    </div>
  );
}
