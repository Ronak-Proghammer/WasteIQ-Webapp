import { useState } from 'react'
import { ROUTES } from '../data/routes'
import { useLiveAlerts } from '../hooks/useLiveAlerts'
import { KPICard } from '../components/UI'
import RouteMap  from '../components/RouteMap'
import RouteList from '../components/RouteList'
import AlertFeed from '../components/AlertFeed'
import theme from '../styles/theme'

const C = theme

export default function OpsPage() {
  const [selectedRoute, setSelectedRoute] = useState(null)
  const alerts = useLiveAlerts()

  const activeCount  = ROUTES.filter(r => r.status === 'active').length
  const doneCount    = ROUTES.filter(r => r.status === 'complete').length
  const delayedCount = ROUTES.filter(r => r.status === 'delayed').length
  const totalTonnes  = ROUTES.reduce((sum, r) => sum + r.tonnes, 0).toFixed(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KPICard label="Active Trucks"    value={activeCount}  sub={`${ROUTES.length} total fleet`} color={C.green} />
        <KPICard label="Routes Complete"  value={doneCount}    sub={`of ${ROUTES.length} today`} />
        <KPICard label="Delayed Routes"   value={delayedCount} sub="requires attention" color={delayedCount > 0 ? C.red : C.green} />
        <KPICard label="Tonnes Collected" value={totalTonnes}  sub="target: 65T today" />
      </div>

      {/* Map + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16}}>

        <RouteMap
          routes={ROUTES}
          selectedRouteId={selectedRoute}
          onSelectRoute={setSelectedRoute}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <RouteList
            routes={ROUTES}
            selectedRouteId={selectedRoute}
            onSelectRoute={setSelectedRoute}
          />
          <AlertFeed alerts={alerts} />
        </div>

      </div>
    </div>
  )
}
