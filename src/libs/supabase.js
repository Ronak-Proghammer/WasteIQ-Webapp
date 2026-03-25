import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.warn('Missing Supabase env vars — ScrapIQ live data will not load.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Pickups ───────────────────────────────────────────────────

export async function getAllPickups() {
  const { data, error } = await supabase
    .from('pickups')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function subscribeToPickups(callback) {
  return supabase
    .channel('admin-all-pickups')
    .on('postgres_changes', {
      event:  '*',
      schema: 'public',
      table:  'pickups',
    }, callback)
    .subscribe()
}

// ── CSV generator from live pickup data ───────────────────────

export function generatePickupsCSV(pickups) {
  const headers = [
    'id', 'status', 'address', 'lat', 'lng',
    'user_email', 'driver_email',
    'created_at', 'accepted_at', 'completed_at',
  ]
  const rows = pickups.map(p =>
    headers.map(h => {
      const val = p[h] ?? ''
      // wrap in quotes if it contains a comma
      return String(val).includes(',') ? `"${val}"` : val
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

// ── KPI helpers ───────────────────────────────────────────────

export function deriveKPIs(pickups) {
  const total     = pickups.length
  const pending   = pickups.filter(p => p.status === 'pending').length
  const accepted  = pickups.filter(p => p.status === 'accepted').length
  const completed = pickups.filter(p => p.status === 'completed').length
  const expired   = pickups.filter(p => p.status === 'expired').length

  // Average resolution time in minutes (accepted → completed)
  const resolved = pickups.filter(p => p.accepted_at && p.completed_at)
  const avgResolutionMins = resolved.length
    ? Math.round(
        resolved.reduce((sum, p) => {
          const diff = new Date(p.completed_at) - new Date(p.accepted_at)
          return sum + diff / 60000
        }, 0) / resolved.length
      )
    : null

  // Today's pickups
  const today = new Date().toDateString()
  const todayCount = pickups.filter(p =>
    new Date(p.created_at).toDateString() === today
  ).length

  return { total, pending, accepted, completed, expired, avgResolutionMins, todayCount }
}