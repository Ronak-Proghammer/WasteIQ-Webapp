import { Card, Label, Badge, Btn, ProgressBar } from './UI'
import theme from '../styles/theme'

const C = theme

function RouteDetail({ route, onBack }) {
  return (
    <Card style={{ flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.text }}>
            {route.id} — {route.name}
          </div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>
            {route.driver} · {route.truck}
          </div>
        </div>
        <Badge color={route.status === 'delayed' ? C.red : route.status === 'complete' ? C.text3 : C.green}>
          {route.status}
        </Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {[
          ['Stops',    `${route.completed}/${route.stops}`],
          ['Tonnes',   `${route.tonnes}T`],
          ['Zone',     route.zone],
          ['Progress', `${route.progress}%`],
        ].map(([k, v]) => (
          <div key={k} style={{ background: C.bg, borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: C.text3, fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {k}
            </div>
            <div style={{ fontSize: 14, color: C.text, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      <ProgressBar value={route.progress} color={route.color} height={5} />
      <Btn variant="ghost" onClick={onBack} style={{ marginTop: 10, fontSize: 10 }}>
        ← Back to all routes
      </Btn>
    </Card>
  )
}

function RouteListItem({ route, onSelect }) {
  return (
    <div
      onClick={() => onSelect(route.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 0',
        borderBottom: `1px solid ${C.border}20`,
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: route.color,
        boxShadow: `0 0 5px ${route.color}88`,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: C.text, fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>
          {route.id} {route.name}
        </div>
        <ProgressBar value={route.progress} color={route.color} height={3} />
      </div>
      <span style={{ fontSize: 10, color: C.text3, fontFamily: "'DM Mono', monospace" }}>
        {route.progress}%
      </span>
    </div>
  )
}

export default function RouteList({ routes, selectedRouteId, onSelectRoute }) {
  const active = routes.find(r => r.id === selectedRouteId)

  if (active) {
    return <RouteDetail route={active} onBack={() => onSelectRoute(null)} />
  }

  return (
    <Card style={{ flexShrink: 0 }}>
      <Label>Routes — click map to select</Label>
      {routes.map(r => (
        <RouteListItem key={r.id} route={r} onSelect={onSelectRoute} />
      ))}
    </Card>
  )
}
