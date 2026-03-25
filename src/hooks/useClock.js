import { useState, useEffect } from 'react'

// Returns a live Date object that updates every second
export function useClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  return time
}
