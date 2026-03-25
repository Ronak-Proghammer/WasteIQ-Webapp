import theme from '../styles/theme'

const C = theme

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '16px 18px',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Label({ children }) {
  return (
    <div style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      letterSpacing: '0.15em',
      color: C.text3,
      textTransform: 'uppercase',
      marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

export function Badge({ children, color = C.accent }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      background: color + '18',
      color,
      border: `1px solid ${color}40`,
      borderRadius: 4,
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  )
}

export function Btn({ children, onClick, disabled, variant = 'outline', style = {} }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.08em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.15s',
    border: 'none',
    ...style,
  }

  const variants = {
    solid:   { background: C.accent, color: '#fff' },
    outline: { background: 'transparent', color: C.accent, border: `1px solid ${C.accent}50` },
    ghost:   { background: 'transparent', color: C.text2, border: `1px solid ${C.border2}` },
    danger:  { background: 'transparent', color: C.red, border: `1px solid ${C.red}50` },
  }

  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  )
}

export function ProgressBar({ value, color = C.accent, height = 4 }) {
  return (
    <div style={{ height, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        background: color,
        borderRadius: 99,
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

export function KPICard({ label, value, sub, color }) {
  return (
    <Card>
      <Label>{label}</Label>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 30,
        fontWeight: 500,
        color: color || C.text,
        lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: C.text3, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
          {sub}
        </div>
      )}
    </Card>
  )
}
