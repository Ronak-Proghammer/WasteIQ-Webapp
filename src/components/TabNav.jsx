import theme from '../styles/theme'

const C = theme

const TABS = [
  { id: 'ops',     label: '🗺 Fleet & Routes'  },
  { id: 'scrapiq', label: '🗑 ScrapIQ Pickups' },
  { id: 'report',  label: '📊 Report Engine'   },
]

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <nav style={{
      display: 'flex',
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      padding: '0 24px',
    }}>
      {TABS.map(({ id, label }) => (
        <div
          key={id}
          onClick={() => onTabChange(id)}
          style={{
            padding: '12px 20px',
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.08em',
            cursor: 'pointer',
            color: activeTab === id ? C.accent : C.text3,
            borderBottom: activeTab === id ? `2px solid ${C.accent}` : '2px solid transparent',
            transition: 'all 0.15s',
          }}
        >
          {label}
        </div>
      ))}
    </nav>
  )
}