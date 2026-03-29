import React, { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react'

const COLORS = ['#10b981','#0ea5e9','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#f97316','#ec4899']

export default function PortfolioManager({ token }) {
  const [assets, setAssets] = useState([])
  const [netWorth, setNetWorth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ticker: '', name: '', units: '', buy_price: '', asset_type: 'Equity' })
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState('')
  const [priceLookup, setPriceLookup] = useState({ loading: false, found: false, error: '' })

  // Excel upload state
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/user-portfolio/${token}`)
      const data = await res.json()
      setAssets(data.assets || [])
      setNetWorth(data.net_worth || 0)
    } catch {}
    setLoading(false)
  }

  // Live fetching disabled as requested
  const handleTickerBlur = async () => {
    const ticker = form.ticker.trim().toUpperCase()
    if (!ticker) return
    setForm(p => ({ ...p, ticker }))
    // Fetching removed: User will enter price manually
  }

  useEffect(() => { load() }, [token])

  const handleAdd = async (e) => {
    e.preventDefault(); setAdding(true); setFormError('')
    try {
      const res = await fetch(`/api/user-portfolio/${token}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, units: parseFloat(form.units), buy_price: parseFloat(form.buy_price) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      setShowForm(false)
      setForm({ ticker: '', name: '', units: '', buy_price: '', asset_type: 'Equity' })
      await load()
    } catch (err) { setFormError(err.message || 'Failed to add asset') }
    setAdding(false)
  }

  const handleRemove = async (id) => {
    await fetch(`/api/user-portfolio/${token}/remove/${id}`, { method: 'DELETE' })
    await load()
  }

  const handleExcelUpload = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setUploadMsg({ type: 'error', text: 'Only .xlsx, .xls, or .csv files supported.' })
      return
    }
    setUploading(true)
    setUploadMsg(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/user-portfolio/${token}/upload-excel`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      setUploadMsg({ type: 'success', text: data.message })
      await load()
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.message || 'Upload failed' })
    }
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleExcelUpload(file)
  }

  const chartData = assets.map((a, i) => ({ ...a, value: a.allocation_percentage || 0, color: COLORS[i % COLORS.length] }))
  const totalPnl = assets.reduce((s, a) => s + (a.pnl || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800 }}>My Portfolio</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>All data sourced from MongoDB Atlas</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', color: '#60a5fa', cursor: 'pointer', fontSize: '14px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            <Upload size={14} /> Upload Excel
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => handleExcelUpload(e.target.files[0])} />
          <button onClick={() => setShowForm(true)} className="neon-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '14px', borderRadius: '12px' }}>
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </div>

      {/* Excel drag & drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '16px', padding: '28px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.01)',
          transition: 'all 0.2s',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#10b981' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontWeight: 600 }}>Importing Excel file and fetching live prices...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            <FileSpreadsheet size={32} style={{ color: '#475569', marginBottom: '10px' }} />
            <p style={{ fontWeight: 600, color: '#94a3b8', fontSize: '15px' }}>Drag & drop your Excel file here</p>
            <p style={{ color: '#334155', fontSize: '13px', marginTop: '6px' }}>Supports .xlsx / .xls / .csv · Columns: Name, Ticker, Units, Buy Price, Type</p>
          </>
        )}
      </div>

      {/* Upload result message */}
      {uploadMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderRadius: '14px',
          background: uploadMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${uploadMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: uploadMsg.type === 'success' ? '#10b981' : '#f87171',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {uploadMsg.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{uploadMsg.text}</span>
          </div>
          <button onClick={() => setUploadMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={16} /></button>
        </div>
      )}

      {/* Net Worth */}
      <div className="glass" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(6,182,212,0.04))' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Total Value</p>
            <p style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-1.5px', marginTop: '6px' }}>₹{netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Total P&L</p>
            <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: totalPnl >= 0 ? '#10b981' : '#ef4444' }}>
              {totalPnl >= 0 ? '+' : ''}₹{Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Holdings</p>
            <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: '#0ea5e9' }}>{assets.length}</p>
          </div>
        </div>
      </div>

      {/* Manual Add Form */}
      {showForm && (
        <div className="glass" style={{ padding: '28px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>➕ Add Asset Manually</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Ticker — with live price fetch on blur */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ticker Symbol</label>
              <input
                value={form.ticker}
                onChange={e => { setForm(p => ({...p, ticker: e.target.value})) }}
                onBlur={handleTickerBlur}
                type="text" placeholder="e.g. RELIANCE.NS or HDFCBANK.NS" required
                className="chat-input" style={{ width: '100%', borderRadius: '10px', padding: '11px 14px' }}
              />
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Name</label>
              <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} type="text" placeholder="Reliance Industries" required className="chat-input" style={{ width: '100%', borderRadius: '10px', padding: '11px 14px' }} />
            </div>

            {/* Units */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Units / Quantity</label>
              <input value={form.units} onChange={e => setForm(p => ({...p, units: e.target.value}))} type="number" placeholder="10" required className="chat-input" style={{ width: '100%', borderRadius: '10px', padding: '11px 14px' }} />
            </div>

            {/* Buy / Current Price */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Buy Price (₹)
              </label>
              <input value={form.buy_price} onChange={e => setForm(p => ({...p, buy_price: e.target.value}))} type="number" placeholder="2800" required className="chat-input" style={{ width: '100%', borderRadius: '10px', padding: '11px 14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Type</label>
              <select value={form.asset_type} onChange={e => setForm(p => ({...p, asset_type: e.target.value}))} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '14px', padding: '11px 14px', outline: 'none' }}>
                <option value="Equity">Equity (Stock)</option>
                <option value="Mutual Fund">Mutual Fund</option>
                <option value="ETF">ETF</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={adding} className="neon-btn" style={{ padding: '12px 24px', borderRadius: '12px', flex: 1 }}>
                {adding ? '⏳ Adding...' : '✅ Add to Portfolio'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 20px', color: '#94a3b8', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '14px' }}>Cancel</button>
            </div>
            {formError && <p style={{ gridColumn: '1/-1', color: '#f87171', fontSize: '14px', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '10px' }}>⚠️ {formError}</p>}
          </form>
        </div>
      )}

      {/* Holdings list + Donut */}
      {loading ? (
        <div className="glass" style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>Loading from database...</div>
      ) : assets.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📂</p>
          <p style={{ color: '#64748b', fontSize: '17px', fontWeight: 500 }}>No holdings yet</p>
          <p style={{ color: '#334155', fontSize: '14px', marginTop: '8px' }}>Add assets manually or upload an Excel file above</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assets.map((a, i) => (
              <div key={a.id} className="asset-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length], boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}` }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '15px' }}>{a.name}</p>
                    <p style={{ color: '#475569', fontSize: '12px' }}>{a.ticker} · {a.units} units · {a.asset_type}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '16px' }}>₹{a.current_value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p style={{ fontSize: '12px', color: a.pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {a.pnl >= 0 ? <TrendingUp size={10} style={{ display: 'inline', marginRight: '3px' }} /> : <TrendingDown size={10} style={{ display: 'inline', marginRight: '3px' }} />}
                      {a.pnl >= 0 ? '+' : ''}₹{Math.abs(a.pnl || 0).toFixed(0)} ({a.pnl_pct}%)
                    </p>
                  </div>
                  <button onClick={() => handleRemove(a.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass" style={{ padding: '20px' }}>
            <p style={{ fontWeight: 700, marginBottom: '12px', fontSize: '15px' }}>Allocation</p>
            <div style={{ height: '200px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={55} outerRadius={80} paddingAngle={6} dataKey="value" cornerRadius={5} stroke="none">
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} style={{ filter: `drop-shadow(0 0 6px ${e.color}80)` }} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} itemStyle={{ color: '#fff', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {chartData.slice(0, 5).map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: a.color }} />
                  <span style={{ color: '#94a3b8' }}>{a.name.length > 18 ? a.name.slice(0, 18) + '…' : a.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: a.color }}>{a.allocation_percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
