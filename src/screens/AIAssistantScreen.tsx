// ===== AI ASSISTANT SCREEN =====
import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../data/aiService';
import type { ChatMessage } from '../types';

interface LocalMessage extends ChatMessage {
  id: string;
  suggestions?: string[];
}

const GREETING: ChatMessage = {
  role: 'assistant',
  content: "Wha gwaan, boss? Mi name Genie. Mi can help yuh track di grow, check nutrients, or tell yuh when fi water. Ask mi anyting!",
};

const SUGGESTIONS = [
  "When should I water today?",
  "What nutrients for flowering?",
  "How much light for seedlings?",
  "Check my plant health",
];

function uid() {
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<LocalMessage[]>([
    { id: 'greeting', ...GREETING, suggestions: SUGGESTIONS },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, error]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;

    const userMsg: ChatMessage & { id: string } = { id: uid(), role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setError(null);

    // Build message history for API (last 10 messages, no IDs)
    const history: ChatMessage[] = messages
      .slice(-10)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    history.push({ role: 'user', content: text.trim() });

    const result = await sendChatMessage(history, true);

    setTyping(false);

    if (result.error) {
      setError(result.error);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: `Mi sorry, boss — mi cyan reach di server right now. (${result.error})`,
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'assistant', content: result.reply },
    ]);
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
                {msg.content}
              </div>

              {msg.suggestions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {msg.suggestions.map((s: string) => (
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
