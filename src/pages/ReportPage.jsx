import { useState, useRef } from 'react'
import { ROUTES } from '../data/routes'
import { parseFile } from '../utils/fileParser'
import { generateWasteReport } from '../utils/api'
import { Card, Label, Btn, Badge } from '../components/UI'
import EmailModal from '../components/EmailModal'
import theme from '../styles/theme'

const C = theme

function DataPreview({ data }) {
  if (!data?.length) return null
  const headers = Object.keys(data[0])

  return (
    <Card>
      <Label>Data Preview</Label>
      <div style={{ overflowX: 'auto', maxHeight: 160, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h} style={{
                  padding: '6px 10px', textAlign: 'left',
                  color: C.text3, fontSize: 9, letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${C.border}`,
                  whiteSpace: 'nowrap', background: C.bg,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 6).map((row, i) => (
              <tr key={i}>
                {headers.map(h => (
                  <td key={h} style={{
                    padding: '6px 10px', color: C.text2,
                    borderBottom: `1px solid ${C.border}20`,
                    whiteSpace: 'nowrap',
                  }}>
                    {String(row[h]).slice(0, 24)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AIReport({ report, loading }) {
  if (!report && !loading) return null

  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
        <Label>Claude Analysis</Label>
      </div>
      {loading ? (
        <div style={{ color: C.text3, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
          Analyzing data...
        </div>
      ) : (
        <div style={{
          whiteSpace: 'pre-wrap',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, lineHeight: 1.7, color: C.text,
          borderLeft: `2px solid ${C.accent}`,
          paddingLeft: 16,
        }}>
          {report}
        </div>
      )}
    </Card>
  )
}

function RouteLegend() {
  return (
    <Card>
      <Label>Active Routes</Label>
      {ROUTES.map(r => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: r.color, flexShrink: 0,
            boxShadow: `0 0 6px ${r.color}88`,
          }} />
          <span style={{ fontSize: 11, color: C.text2, fontFamily: "'DM Mono', monospace", flex: 1 }}>
            {r.id} {r.name}
          </span>
          <Badge color={r.status === 'delayed' ? C.red : r.status === 'complete' ? C.text3 : C.green}>
            {r.status}
          </Badge>
        </div>
      ))}
    </Card>
  )
}

export default function ReportPage() {
  const [data,       setData]       = useState(null)
  const [fileName,   setFileName]   = useState('')
  const [report,     setReport]     = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [emailOpen,  setEmailOpen]  = useState(false)
  const [sending,    setSending]    = useState(false)
  const [dragOver,   setDragOver]   = useState(false)
  const fileRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    try {
      const parsed = await parseFile(file)
      setData(parsed)
      setFileName(file.name)
      setReport('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGenerate = async () => {
    if (!data) return
    setLoading(true)
    setError('')
    try {
      const result = await generateWasteReport(data)
      setReport(result)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleSendEmail = async (emailData) => {
    setSending(true)
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
    }
    setSending(false)
  }

  const handleClear = () => {
    setData(null)
    setFileName('')
    setReport('')
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

      {/* ── Left: Controls ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Upload */}
        <Card>
          <Label>01 — Upload Data</Label>
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              handleFile(e.dataTransfer.files[0])
            }}
            style={{
              border: `1px dashed ${dragOver ? C.accent : C.border2}`,
              borderRadius: 6,
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? C.accent + '0a' : C.bg,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
            <div style={{ fontSize: 12, color: C.text2, fontFamily: "'DM Mono', monospace" }}>
              {fileName || 'Drop CSV / Excel'}
            </div>
            {data && (
              <div style={{ fontSize: 10, color: C.text3, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                {data.length} rows · {Object.keys(data[0]).length} columns
              </div>
            )}
          </div>
          <input
            ref={fileRef} type="file" accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
          {data && (
            <Btn variant="ghost" onClick={handleClear} style={{ marginTop: 8, fontSize: 10, width: '100%', justifyContent: 'center' }}>
              ✕ Clear file
            </Btn>
          )}
        </Card>

        {/* Generate */}
        <Card>
          <Label>02 — Generate Report</Label>
          <Btn
            variant="solid"
            disabled={!data || loading}
            onClick={handleGenerate}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? '⟳ Analyzing...' : '⚡ Generate AI Report'}
          </Btn>
        </Card>

        {/* Email */}
        <Card>
          <Label>03 — Email Report</Label>
          <Btn
            variant="outline"
            disabled={!report}
            onClick={() => setEmailOpen(true)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            ✉ Send via Gmail
          </Btn>
        </Card>

        <RouteLegend />
      </div>

      {/* ── Right: Output ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 6, fontSize: 12,
            background: C.red + '12', border: `1px solid ${C.red}30`,
            color: C.red, fontFamily: "'DM Mono', monospace",
          }}>
            {error}
          </div>
        )}

        <DataPreview data={data} />
        <AIReport report={report} loading={loading} />

        {!data && !report && (
          <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <div style={{ color: C.text3, fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em' }}>
              UPLOAD A FILE TO BEGIN ANALYSIS
            </div>
            <div style={{ color: C.text3, fontSize: 10, marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
              supports waste routes, tonnage, pickups, schedules
            </div>
          </Card>
        )}
      </div>

      {/* Email modal */}
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
