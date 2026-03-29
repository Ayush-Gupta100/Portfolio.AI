import React, { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import PortfolioManager from './components/PortfolioManager'
import Advisor from './components/Advisor'
import { LayoutDashboard, Briefcase, Brain, LogOut, Menu, X } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'portfolio', label: 'My Portfolio', icon: <Briefcase size={18} /> },
  { id: 'advisor', label: 'AI Advisor', icon: <Brain size={18} /> },
]

function AppShell({ user, token, onLogout }) {
  const [page, setPage] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Top navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(20px)', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', flexShrink: 0 }}>
            Portfolio<span style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.AI</span>
          </h1>
          <div style={{ display: 'flex', gap: '4px' }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
                background: page === n.id ? 'rgba(16,185,129,0.12)' : 'transparent',
                color: page === n.id ? '#10b981' : '#64748b',
                borderBottom: page === n.id ? '2px solid #10b981' : '2px solid transparent',
              }}>
                {n.icon} {n.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user.picture && <img src={user.picture} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.4)' }} />}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{user.name}</p>
            <p style={{ fontSize: '11px', color: '#475569' }}>{user.email}</p>
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '8px 12px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
            <LogOut size={14} /> Out
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, padding: '36px 28px', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {page === 'dashboard' && <Dashboard token={token} />}
        {page === 'portfolio' && <PortfolioManager token={token} />}
        {page === 'advisor' && <Advisor token={token} />}
      </main>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('login') // login | register | app
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const handleLogin = (u, t) => { setUser(u); setToken(t); setScreen('app') }
  const handleLogout = () => { setUser(null); setToken(null); setScreen('login') }

  if (screen === 'login') return <Login onLogin={handleLogin} onGoRegister={() => setScreen('register')} />
  if (screen === 'register') return <Register onLogin={handleLogin} onGoLogin={() => setScreen('login')} />
  return <AppShell user={user} token={token} onLogout={handleLogout} />
}
