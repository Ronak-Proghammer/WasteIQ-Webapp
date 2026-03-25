import { useState, useEffect } from 'react'
import { INITIAL_ALERTS, INCOMING_ALERTS } from '../data/routes'

// Manages the live alert feed, drip-feeding new alerts every 5 seconds
export function useLiveAlerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)

  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      if (i >= INCOMING_ALERTS.length) { clearInterval(iv); return }
      const alert = {
        ...INCOMING_ALERTS[i],
        time: new Date().toLocaleTimeString('en-CA', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      }
      setAlerts(prev => [alert, ...prev].slice(0, 12))
      i++
    }, 5000)
    return () => clearInterval(iv)
  }, [])

  return alerts
}
