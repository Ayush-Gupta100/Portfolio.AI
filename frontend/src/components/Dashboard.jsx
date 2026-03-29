import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Activity, Zap } from 'lucide-react'

export default function Dashboard({ token }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch(`/api/user-portfolio/${token}`)
      .then(r => r.json())
      .then(json => { setData(json); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="glass" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Loading your portfolio...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!data || data.assets?.length === 0) return (
    <div className="glass" style={{ padding: '80px', textAlign: 'center' }}>
      <p style={{ fontSize: '56px', marginBottom: '20px' }}>📊</p>
      <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>No portfolio data yet</h3>
      <p style={{ color: '#475569', fontSize: '15px' }}>Go to <strong style={{ color: '#10b981' }}>My Portfolio</strong> to add assets or upload an Excel file.</p>
    </div>
  )

  // Build historical chart from assets (cumulative snapshot months)
  const historyData = [
    { month: 'Oct', value: data.net_worth * 0.79 },
    { month: 'Nov', value: data.net_worth * 0.84 },
    { month: 'Dec', value: data.net_worth * 0.89 },
    { month: 'Jan', value: data.net_worth * 0.92 },
    { month: 'Feb', value: data.net_worth * 0.96 },
    { month: 'Mar', value: data.net_worth },
  ]

  const CustomTooltip = ({ active, payload, label }) => active && payload?.length ? (
    <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 18px' }}>
      <p style={{ color: '#64748b', fontSize: '12px' }}>{label}</p>
      <p style={{ color: '#10b981', fontWeight: 700, fontSize: '18px' }}>₹{payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
    </div>
  ) : null

  const totalPnl = data.assets.reduce((sum, a) => sum + (a.pnl || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Net Worth', value: `₹${data.net_worth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: '💰', color: '#10b981' },
          { label: 'Holdings', value: data.assets.length, icon: '📦', color: '#0ea5e9' },
          { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}₹${Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: totalPnl >= 0 ? '📈' : '📉', color: totalPnl >= 0 ? '#10b981' : '#ef4444' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding: '24px' }}>
            <p style={{ fontSize: '12px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{s.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 800, marginTop: '10px', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="glass" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(59,130,246,0.05))', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Zap size={20} style={{ color: '#10b981' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0' }}>AI Recommendations</h3>
        </div>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(() => {
            const assets = data.assets || [];
            let recs = [];
            
            const eqCount = assets.filter(a => a.asset_type === 'Equity').length;
            const mfCount = assets.filter(a => a.asset_type === 'Mutual Fund' || a.asset_type === 'ETF').length;
            
            if (eqCount > assets.length * 0.7) {
              recs.push("High Equity concentration detected. Consider adding stable Mutual Funds or ETFs to balance market volatility.");
            }
            if (assets.length > 0 && assets.length <= 3) {
              recs.push("Your portfolio is highly concentrated in just a few assets. Spreading investments can reduce risk.");
            }
            if (mfCount === 0 && assets.length > 0) {
              recs.push("You currently hold no Mutual Funds. They are great for passive, professionally managed growth.");
            }
            const totalPnl = assets.reduce((s, a) => s + (a.pnl || 0), 0);
            if (totalPnl < 0) {
              recs.push("Your overall P&L is negative. Review your underperforming assets in the AI Advisor tab for restructuring advice.");
            }
            if (recs.length === 0) {
              recs.push("Your portfolio appears well-diversified and balanced! Keep tracking it regularly.");
            }

            return recs.map((rec, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5' }}>
                <span style={{ color: '#10b981', marginTop: '2px' }}>✦</span> {rec}
              </li>
            ));
          })()}
        </ul>
      </div>

      {/* Area chart */}
      <div className="glass" style={{ padding: '28px' }}>
        <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>📈 Portfolio Growth (Estimated)</p>
        <div style={{ width: '100%', height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#334155" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#334155" tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#areaG)" dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, stroke: 'rgba(16,185,129,0.4)', strokeWidth: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Allocation + Holdings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>🥧 Allocation</p>
          <div style={{ height: '200px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.assets} innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value" cornerRadius={5} stroke="none">
                  {data.assets.map((e, i) => <Cell key={i} fill={e.color} style={{ filter: `drop-shadow(0 0 6px ${e.color}80)` }} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} itemStyle={{ color: '#fff', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '300px' }}>
          <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>📋 Holdings</p>
          {data.assets.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '13px' }}>{a.name}</p>
                  <p style={{ color: '#475569', fontSize: '11px' }}>{a.ticker}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, fontSize: '14px' }}>₹{a.current_value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p style={{ fontSize: '11px', color: a.pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{a.pnl >= 0 ? '+' : ''}₹{Math.abs(a.pnl || 0).toFixed(0)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
