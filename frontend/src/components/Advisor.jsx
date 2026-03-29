import React from 'react'
import AiChat from './AiChat'
import { Brain, Shield, Zap } from 'lucide-react'

export default function Advisor({ token }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>AI Advisor</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Personalized advice powered by Groq + Local Phi-3</p>
      </div>

      {/* Feature chips */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {[
          { icon: <Brain size={14} />, label: 'Groq LLaMA 3.1', color: '#8b5cf6' },
          { icon: <Shield size={14} />, label: 'Private Inference', color: '#10b981' },
          { icon: <Zap size={14} />, label: 'Real-time Market Data', color: '#0ea5e9' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${f.color}15`, border: `1px solid ${f.color}40`, borderRadius: '20px', padding: '8px 16px', color: f.color, fontSize: '13px', fontWeight: 600 }}>
            {f.icon} {f.label}
          </div>
        ))}
      </div>

      {/* Suggested questions */}
      <div className="glass" style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: '12px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Try asking</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            'Analyze my tech portfolio against today\'s market',
            'Should I rebalance my portfolio this month?',
            'What is my overall risk exposure?',
            'NIFTY 50 outlook for next week?',
            'Compare Reliance vs HDFC Bank',
            'Best large cap stocks to add now?'
          ].map(q => (
            <div key={q} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '7px 14px', fontSize: '13px', color: '#94a3b8', cursor: 'pointer' }}>
              {q}
            </div>
          ))}
        </div>
      </div>

      {/* The main chat */}
      <AiChat />
    </div>
  )
}
