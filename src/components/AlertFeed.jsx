import { Card, Label } from './UI'
import theme from '../styles/theme'

const C = theme

const SEV_COLOR = {
  high:   C.red,
  medium: C.amber,
  low:    C.text3,
}

export default function AlertFeed({ alerts }) {
  const criticalCount = alerts.filter(a => a.sev === 'high').length

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Label>Live Alerts</Label>
        <span style={{ fontSize: 10, color: C.red, fontFamily: "'DM Mono', monospace" }}>
          {criticalCount} critical
        </span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {alerts.map(alert => (
          <div
            key={alert.id}
            style={{
              padding: '7px 10px',
              marginBottom: 6,
              borderRadius: 4,
              fontSize: 11,
              background: C.bg,
              borderLeft: `2px solid ${SEV_COLOR[alert.sev]}`,
              color: C.text2,
            }}
          >
            <span style={{ color: C.text3, fontFamily: "'DM Mono', monospace", fontSize: 9, marginRight: 8 }}>
              {alert.time}
            </span>
            {alert.msg}
          </div>
        ))}
      </div>
    </Card>
  )
}
