import { useState } from 'react'
import Header     from './components/Header'
import TabNav     from './components/TabNav'
import OpsPage    from './pages/OpsPage'
import ScrapIQPage from './pages/ScrapIQPage'
import ReportPage from './pages/ReportPage'
import theme from './styles/theme'

const C = theme

export default function App() {
  const [tab, setTab] = useState('ops')

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      <Header />
      <TabNav activeTab={tab} onTabChange={setTab} />
      <main style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>
        {tab === 'ops'     && <OpsPage />}
        {tab === 'scrapiq' && <ScrapIQPage />}
        {tab === 'report'  && <ReportPage />}
      </main>
    </div>
  )
}