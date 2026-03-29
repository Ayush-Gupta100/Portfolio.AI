import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

export default function AiChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', text: '⚡ Phi-3 Edge Model is online. Your portfolio (Reliance, Tata Motors, CAMS MF) has been indexed. Ask me anything about your holdings or the Indian market.', info: null }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return
    const q = input.trim()
    setMessages(p => [...p, { role: 'user', text: q }])
    setInput('')
    setIsTyping(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, portfolio_context: {}, market_context: {} })
      })
      if (!res.ok) throw new Error()
      const d = await res.json()
      setMessages(p => [...p, { role: 'ai', text: d.advice, info: `CONFIDENCE ${(d.confidence_score*100).toFixed(0)}% · ${d.latency_ms}ms · ${d.source}` }])
    } catch {
      setMessages(p => [...p, { role: 'ai', text: '⚠️ Backend offline. Start the FastAPI server on port 8000.', isError: true }])
    } finally { setIsTyping(false) }
  }

  return (
    <div className="glass" style={{
      display: 'flex', flexDirection: 'column',
      height: '780px', position: 'sticky', top: '32px',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Top gradient bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #10b981, #06b6d4, #818cf8)', flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            boxShadow: '0 0 20px rgba(16,185,129,0.15)',
          }}>🧠</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '17px', color: '#fff' }}>Edge AI Advisor</p>
            <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>
              Phi-3 Local · Zero-Trust
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '6px 14px' }}>
          <div className="pulse-dot" style={{ width: '7px', height: '7px' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', letterSpacing: '0.1em' }}>LIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#334155', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
          🔒 End-to-End Encrypted · Private Inference
        </div>

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div className={m.role === 'user' ? 'msg-user' : m.isError ? 'msg-error' : 'msg-ai'}>
              {m.text}
            </div>
            {m.info && <p style={{ fontSize: '10px', color: '#10b981', marginTop: '6px', paddingLeft: '4px', fontWeight: 600, letterSpacing: '0.05em', opacity: 0.8 }}>◈ {m.info}</p>}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div className="msg-ai" style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '14px 18px' }}>
              {[0, 150, 300].map(d => <div key={d} className="typing-dot" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested query chips */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
        {['Analyze my tech portfolio against today\'s market', 'RELIANCE outlook?', 'Risk score?'].map(q => (
          <button key={q} onClick={() => { setInput(q) }} style={{
            background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '20px', padding: '5px 14px', color: '#10b981', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
          }}>
            {q.length > 30 ? q.slice(0, 28) + '…' : q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask your Edge AI..."
          />
          <button className="neon-btn" onClick={handleSend} disabled={!input.trim()} style={{ padding: '14px 18px', flexShrink: 0, borderRadius: '14px' }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
