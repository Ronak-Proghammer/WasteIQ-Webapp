import { useEffect, useRef } from 'react'
import L from 'leaflet'
import theme from '../styles/theme'
import 'leaflet/dist/leaflet.css'

const C = theme

export default function RouteMap({ routes, selectedRouteId, onSelectRoute }) {
  const mapRef      = useRef(null)  // DOM node
  const mapInstance = useRef(null)  // Leaflet map instance
  const polylinesRef      = useRef({}) // { routeId: L.Polyline }
  const truckMarkersRef   = useRef({}) // { routeId: L.Marker }

  // Initialise map once on mount
  useEffect(() => {
    if (mapInstance.current) return

    const map = L.map(mapRef.current, { zoomControl: false }).setView([51.055, -114.07], 11)

    // Dark tile layer (CartoDB Dark Matter — no API key required)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CartoDB',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapInstance.current = map

    // Draw each route
    routes.forEach((route) => {
      // Route polyline
      const poly = L.polyline(route.waypoints, {
        color: route.color,
        weight: 3,
        opacity: 0.7,
        dashArray: route.status === 'complete' ? '4 6' : null,
      }).addTo(map)

      // Small stop-dot markers along the route
      route.waypoints.forEach((wp) =>
        L.circleMarker(wp, {
          radius: 4,
          fillColor: route.color,
          color: route.color,
          weight: 1,
          opacity: 0.6,
          fillOpacity: 0.4,
        }).addTo(map)
      )

      // Truck marker
      const pulseStyle = route.status === 'delayed'
        ? 'animation:pulse-truck 1s ease-in-out infinite alternate;'
        : ''

      const truckIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:24px;height:24px;
          background:${route.color};
          border:2px solid #fff;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;
          box-shadow:0 0 10px ${route.color}88;
          ${pulseStyle}
        ">🚛</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const truckMarker = L.marker(route.truckPos, { icon: truckIcon })
        .addTo(map)
        .bindPopup(`
          <b style="color:${route.color}">${route.id} — ${route.name}</b><br>
          Driver: ${route.driver}<br>
          Progress: ${route.progress}% (${route.completed}/${route.stops} stops)<br>
          Status: <b>${route.status.toUpperCase()}</b>
        `)

      // Store refs for later highlighting
      polylinesRef.current[route.id]    = poly
      truckMarkersRef.current[route.id] = truckMarker

      // Click handlers
      poly.on('click', () => onSelectRoute(route.id))
      truckMarker.on('click', () => onSelectRoute(route.id))
    })

    // Inject delayed-truck pulse keyframe once
    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse-truck {
        from { box-shadow: 0 0 6px #ef444488; }
        to   { box-shadow: 0 0 16px #ef4444cc; }
      }
    `
    document.head.appendChild(style)
  }, [])

  // Highlight / fly-to selected route whenever it changes
  useEffect(() => {
    if (!mapInstance.current) return

    Object.entries(polylinesRef.current).forEach(([id, poly]) => {
      poly.setStyle({
        weight:  id === selectedRouteId ? 5 : 3,
        opacity: id === selectedRouteId ? 1 : 0.5,
      })
    })

    if (selectedRouteId) {
      truckMarkersRef.current[selectedRouteId]?.openPopup()
      const route = routes.find(r => r.id === selectedRouteId)
      if (route) mapInstance.current.setView(route.truckPos, 13, { animate: true })
    }
  }, [selectedRouteId])

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '440px',
        minHeight: 480,
        borderRadius: 8,
        border: `1px solid ${C.border}`,
      }}
    />
  )
}
