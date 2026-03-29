import React, { useState } from 'react'

export default function Register({ onLogin, onGoLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      onLogin(data.user, data.token)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="glass" style={{ width: '100%', maxWidth: '440px', padding: '48px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '8px' }}>
            Join Portfolio<span style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.AI</span>
          </h1>
          <p style={{ color: '#64748b', fontWeight: 500 }}>Create your free account</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Full Name', value: name, set: setName, type: 'text', placeholder: 'Ayush Gupta' },
            { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{f.label}</label>
              <input value={f.value} onChange={e => f.set(e.target.value)} type={f.type} placeholder={f.placeholder} required className="chat-input" style={{ width: '100%', borderRadius: '12px' }} />
            </div>
          ))}

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: '#fca5a5', fontSize: '14px' }}>⚠️ {error}</div>}

          <button type="submit" disabled={loading} className="neon-btn" style={{ padding: '15px', fontSize: '16px', borderRadius: '14px', width: '100%', marginTop: '8px' }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#475569', fontSize: '14px' }}>
          Already have an account?{' '}
          <button onClick={onGoLogin} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'Outfit, sans-serif' }}>
            Sign in →
          </button>
        </p>
      </div>
    </div>
  )
}
