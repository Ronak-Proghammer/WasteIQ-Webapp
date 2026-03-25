import { useClock } from '../hooks/useClock'
import theme from '../styles/theme'

const C = theme

export default function Header() {
  const time = useClock()

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: 52,
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontWeight: 500,
          fontSize: 18,
          letterSpacing: '0.12em',
          color: C.text,
        }}>
          WASTE<span style={{ color: C.accent }}>IQ</span>
        </div>
        <div style={{
          fontSize: 10,
          color: C.text3,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.15em',
          borderLeft: `1px solid ${C.border2}`,
          paddingLeft: 12,
        }}>
          CALGARY METRO OPS
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.text3, fontFamily: "'DM Mono', monospace" }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: C.green,
            boxShadow: `0 0 5px ${C.green}`,
          }} />
          LIVE
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.text2 }}>
          {time.toLocaleTimeString('en-CA', { hour12: false })}
        </div>
      </div>
    </header>
  )
}
