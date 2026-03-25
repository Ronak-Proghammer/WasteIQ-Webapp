import { useState } from 'react'
import { Btn } from './UI'
import theme from '../styles/theme'

const C = theme

const inputStyle = {
  width: '100%',
  background: C.bg,
  border: `1px solid ${C.border2}`,
  borderRadius: 6,
  padding: '9px 12px',
  color: C.text,
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  outline: 'none',
}

export default function EmailModal({ onClose, onSend, sending }) {
  const [to,      setTo]      = useState('')
  const [subject, setSubject] = useState('WasteIQ Route Intelligence Report')
  const [notes,   setNotes]   = useState('')

  const handleSend = () => {
    if (!to.trim()) return
    onSend({ to, subject, notes })
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 10,
          padding: 28,
          width: 480,
          maxWidth: '95vw',
        }}
      >
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: C.text, marginBottom: 4 }}>
          Send Report
        </div>
        <div style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
          via Gmail MCP
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 9, color: C.text3, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 5 }}>
            To
          </label>
          <input type="email" value={to} onChange={e => setTo(e.target.value)}
            placeholder="ops@collectivewaste.ca" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 9, color: C.text3, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 5 }}>
            Subject
          </label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 9, color: C.text3, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 5 }}>
            Notes (optional)
          </label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Optional context for recipient..."
            style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" disabled={!to.trim() || sending} onClick={handleSend}>
            {sending ? 'Sending...' : '✉ Send Now'}
          </Btn>
        </div>
      </div>
    </div>
  )
}
