import { useState, useEffect, useRef } from 'react'
import { Card, Label, Badge, Btn, KPICard } from '../components/UI'
import { supabase, getAllPickups, subscribeToPickups, deriveKPIs, generatePickupsCSV } from '../libs/supabase'
import EmailModal from '../components/EmailModal'
import theme from '../styles/theme'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const C = theme

const STATUS_COLOR = {
    pending: C.amber,
    accepted: C.accent,
    completed: C.green,
    expired: C.red,
}

// ── Pickup Map ────────────────────────────────────────────────
function PickupMap({ pickups, onSelect }) {
    const mapRef = useRef(null)
    const mapInstance = useRef(null)
    const markersRef = useRef({})

    useEffect(() => {
        if (mapInstance.current || !mapRef.current) return
        const map = L.map(mapRef.current, { zoomControl: false }).setView([51.045, -114.07], 11)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap, © CartoDB', subdomains: 'abcd',
        }).addTo(map)
        L.control.zoom({ position: 'bottomright' }).addTo(map)
        mapInstance.current = map
    }, [])

    useEffect(() => {
        if (!mapInstance.current) return
        pickups.forEach(p => {
            if (!p.lat || !p.lng) return
            const color = STATUS_COLOR[p.status] ?? C.text3
            const icon = L.divIcon({
                className: '',
                html: `<div style="
          width:14px;height:14px;border-radius:50%;
          background:${color};border:2px solid #fff;
          box-shadow:0 0 8px ${color}88;cursor:pointer;
        "></div>`,
                iconSize: [14, 14], iconAnchor: [7, 7],
            })
            if (markersRef.current[p.id]) {
                markersRef.current[p.id].setIcon(icon)
            } else {
                const marker = L.marker([p.lat, p.lng], { icon })
                    .addTo(mapInstance.current)
                    .on('click', () => onSelect(p))
                markersRef.current[p.id] = marker
            }
        })

        if (!mapInstance.current || !pickups.length) return

        const bounds = []
        pickups.forEach(p => {
            if (p.lat && p.lng) bounds.push([p.lat, p.lng])
        })

        if (bounds.length) {
            mapInstance.current.fitBounds(bounds, { padding: [30, 30] })
        }
    }, [pickups])

    useEffect(() => {
        if (!mapInstance.current) return
        setTimeout(() => {
            mapInstance.current.invalidateSize()
        }, 0)
    }, [])

    return (
        <div style={{ height: '100%', overflow: 'hidden' }}>
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                }}
            />
        </div>
    )
}

// ── Pickup Detail Panel ───────────────────────────────────────
function PickupDetail({ pickup, onClose }) {
    if (!pickup) return (
        <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center', color: C.text3, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                Click a pin on the map<br />to view pickup details
            </div>
        </Card>
    )

    return (
        <Card style={{ overflow: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Label>Pickup Detail</Label>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            <Badge color={STATUS_COLOR[pickup.status] ?? C.text3}>{pickup.status}</Badge>

            {pickup.photo_url && (
                <img src={pickup.photo_url} alt="Garbage"
                    style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, margin: '12px 0' }} />
            )}

            {pickup.driver_photo_url && (
                <>
                    <div style={{ fontSize: 10, color: C.text3, fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Verification Photo
                    </div>
                    <img src={pickup.driver_photo_url} alt="Verified"
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                </>
            )}

            {[
                ['Address', pickup.address || `${pickup.lat?.toFixed(5)}, ${pickup.lng?.toFixed(5)}`],
                ['User', pickup.user_email],
                ['Driver', pickup.driver_email || '—'],
                ['Created', new Date(pickup.created_at).toLocaleString()],
                ['Accepted', pickup.accepted_at ? new Date(pickup.accepted_at).toLocaleString() : '—'],
                ['Completed', pickup.completed_at ? new Date(pickup.completed_at).toLocaleString() : '—'],
            ].map(([k, v]) => (
                <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '7px 0', borderBottom: `1px solid ${C.border}`,
                }}>
                    <span style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Mono', monospace" }}>{k}</span>
                    <span style={{ fontSize: 11, color: C.text2, fontFamily: "'DM Mono', monospace", textAlign: 'right', maxWidth: 200 }}>{v}</span>
                </div>
            ))}
        </Card>
    )
}

// ── AI Insight Panel ──────────────────────────────────────────
function AIInsightPanel({ pickups }) {
    const [insight, setInsight] = useState('')
    const [loading, setLoading] = useState(false)
    const [ran, setRan] = useState(false)

    const analyze = async () => {
        setLoading(true)
        setInsight('')
        const kpis = deriveKPIs(pickups)
        const csv = generatePickupsCSV(pickups.slice(0, 50))

        const prompt = `You are an AI operations advisor for ScrapIQ, a Calgary on-demand garbage pickup platform.

Here is today's operational data:
- Total pickups: ${kpis.total}
- Pending (unaccepted): ${kpis.pending}
- In Progress: ${kpis.accepted}
- Completed: ${kpis.completed}
- Expired (no driver accepted in time): ${kpis.expired}
- Today's new requests: ${kpis.todayCount}
- Average resolution time: ${kpis.avgResolutionMins ?? 'N/A'} minutes
- Date & time of generation: ${new Date().getDate()}, ${new Date().getTime()}

Recent pickup data (CSV):
\`\`\`
${csv}
\`\`\`

Give a concise ops briefing for the admin covering:
1. CURRENT STATUS — one sentence on overall health
2. KEY CONCERNS — 2-3 specific issues that need attention today
3. RECOMMENDED ACTIONS — concrete steps the admin should take right now
4. TREND — any patterns you notice in the data

Be direct, specific, and actionable. Use actual numbers.`

        try {
            const res = await fetch('http://localhost:3001/api/ai-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error.message)
            setInsight(data.text)
            setRan(true)
        } catch (err) {
            setInsight('Error: ' + err.message)
        }
        setLoading(false)
    }

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
                    <Label>AI Ops Advisor</Label>
                </div>
                <Btn variant="solid" onClick={analyze} disabled={loading || !pickups.length} style={{ fontSize: 11, padding: '6px 14px' }}>
                    {loading ? '⟳ Analyzing...' : ran ? '↺ Re-analyze' : '⚡ Analyze Now'}
                </Btn>
            </div>

            {!insight && !loading && (
                <div style={{ color: C.text3, fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '16px 0' }}>
                    Click Analyze to get AI insights on today's pickup data
                </div>
            )}

            {loading && (
                <div style={{ color: C.text3, fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '8px 0' }}>
                    Claude is analyzing your data...
                </div>
            )}

            {insight && (
                <div style={{
                    whiteSpace: 'pre-wrap', fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13, lineHeight: 1.7, color: C.text,
                    borderLeft: `2px solid ${C.accent}`, paddingLeft: 16,
                }}>
                    {insight}
                </div>
            )}
        </Card>
    )
}

// ── Main ScrapIQ Page ─────────────────────────────────────────
export default function ScrapIQPage() {
    const [pickups, setPickups] = useState([])
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [emailOpen, setEmailOpen] = useState(false)
    const [sending, setSending] = useState(false)
    const [reportText, setReportText] = useState('')
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        load()
        const channel = subscribeToPickups(({ eventType, new: updated }) => {
            setPickups(prev => {
                if (eventType === 'INSERT') return [updated, ...prev]
                if (eventType === 'UPDATE') return prev.map(p => p.id === updated.id ? updated : p)
                return prev
            })
        })
        return () => { supabase?.removeChannel?.(channel) }
    }, [])

    const load = async () => {
        setLoading(true)
        try {
            const data = await getAllPickups()
            setPickups(data)
        } catch (err) {
            setError('Could not load pickups. Check your Supabase env vars.')
        }
        setLoading(false)
    }

    const generateReport = async () => {
        setGenerating(true)
        const kpis = deriveKPIs(pickups)
        const csv = generatePickupsCSV(pickups)

        const prompt = `You are a senior waste operations analyst for ScrapIQ, a Calgary on-demand garbage pickup platform.

Generate an executive intelligence report from this live operational data:

KPIs:
- Total pickups: ${kpis.total}
- Pending: ${kpis.pending}
- In Progress: ${kpis.accepted}  
- Completed: ${kpis.completed}
- Expired: ${kpis.expired}
- Today's requests: ${kpis.todayCount}
- Avg resolution time: ${kpis.avgResolutionMins ?? 'N/A'} min

Full pickup data (CSV):
\`\`\`
${csv}
\`\`\`

Write a professional executive report with:
1. EXECUTIVE SUMMARY
2. KEY METRICS & WHAT THEY MEAN
3. OPERATIONAL INSIGHTS (use actual data values)
4. RISK FLAGS
5. RECOMMENDED ACTIONS

Write for a Calgary waste ops manager who needs to act on this today.`

        try {
            const res = await fetch('http://localhost:3001/api/ai-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })
            const data = await res.json()
            console.log
            if (data.error) throw new Error(data.error.message)
            setReportText(data.htmlReport)
        } catch (err) {
            setError(err.message)
        }
        setGenerating(false)
    }

    const handleSendEmail = async (emailData) => {
        setSending(true)
        setError(null)

        try {
            // Call your backend endpoint
            const res = await fetch('http://localhost:3001/api/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...emailData,
                    reportText,
                    pickups,
                    csvAttachment: generatePickupsCSV(pickups)
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to send report')

            // Success
            console.log('Report sent!', data)
            setEmailOpen(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setSending(false)
        }
    }

    const kpis = deriveKPIs(pickups)

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: C.text3, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
            Loading live ScrapIQ data...
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {error && (
                <div style={{ padding: '10px 14px', borderRadius: 6, fontSize: 12, background: C.red + '12', border: `1px solid ${C.red}30`, color: C.red, fontFamily: "'DM Mono', monospace" }}>
                    {error}
                </div>
            )}

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                <KPICard label="Total Pickups" value={kpis.total} sub="all time" />
                <KPICard label="Pending" value={kpis.pending} sub="awaiting driver" color={C.amber} />
                <KPICard label="In Progress" value={kpis.accepted} sub="driver assigned" color={C.accent} />
                <KPICard label="Completed" value={kpis.completed} sub="successfully done" color={C.green} />
                <KPICard label="Expired" value={kpis.expired} sub="no driver in time" color={C.red} />
            </div>

            {/* Map + detail */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, height: 420 }}>
                <PickupMap pickups={pickups} onSelect={setSelected} />
                <PickupDetail pickup={selected} onClose={() => setSelected(null)} />
            </div>

            {/* AI Insight */}
            <AIInsightPanel pickups={pickups} />

            {/* Report Engine */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Label>Report Engine — Live Data</Label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Btn variant="solid" onClick={generateReport} disabled={generating || !pickups.length}>
                            {generating ? '⟳ Generating...' : '⚡ Generate Report'}
                        </Btn>
                        <Btn variant="outline" onClick={() => setEmailOpen(true)} disabled={!reportText}>
                            ✉ Email Report
                        </Btn>
                    </div>
                </div>

                {reportText ? (
                    <div
                        style={{
                            whiteSpace: 'normal',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: C.text,
                            borderLeft: `2px solid ${C.accent}`,
                            paddingLeft: 16,
                            maxHeight: 400,
                            overflowY: 'auto',
                        }}
                        dangerouslySetInnerHTML={{ __html: reportText }}
                    />
                ) : (
                    <div style={{ color: C.text3, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                        Click Generate Report to create an AI executive summary from live ScrapIQ pickup data
                    </div>
                )}
            </Card>

            {/* Live pickups table */}
            <Card style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}` }}>
                    <Label>All Pickups — Live</Label>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                        <thead>
                            <tr>
                                {['Status', 'Address', 'User', 'Driver', 'Created', ''].map(h => (
                                    <th key={h} style={{
                                        padding: '9px 14px', textAlign: 'left',
                                        color: C.text3, fontSize: 9, letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        borderBottom: `1px solid ${C.border}`,
                                        background: C.bg, whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pickups.map(p => (
                                <tr key={p.id} onClick={() => setSelected(p)}
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.background = C.surface}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}20` }}>
                                        <Badge color={STATUS_COLOR[p.status] ?? C.text3}>{p.status}</Badge>
                                    </td>
                                    <td style={{ padding: '9px 14px', color: C.text2, borderBottom: `1px solid ${C.border}20`, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {p.address || `${p.lat?.toFixed(4)}, ${p.lng?.toFixed(4)}`}
                                    </td>
                                    <td style={{ padding: '9px 14px', color: C.text2, borderBottom: `1px solid ${C.border}20` }}>{p.user_email}</td>
                                    <td style={{ padding: '9px 14px', color: C.text2, borderBottom: `1px solid ${C.border}20` }}>{p.driver_email || '—'}</td>
                                    <td style={{ padding: '9px 14px', color: C.text3, borderBottom: `1px solid ${C.border}20`, whiteSpace: 'nowrap' }}>
                                        {new Date(p.created_at).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}20` }}>
                                        <span style={{ color: C.accent, fontSize: 11 }}>View →</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {emailOpen && (
                <EmailModal
                    onClose={() => setEmailOpen(false)}
                    onSend={handleSendEmail}
                    sending={sending}
                />
            )}
        </div>
    )
}