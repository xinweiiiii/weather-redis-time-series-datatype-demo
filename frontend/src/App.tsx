import React, { useEffect, useMemo, useRef, useState } from 'react'
import { fetchWeatherSeries } from './lib/api'
import { getSocket } from './lib/socket'
import type { WeatherPoint } from './lib/types'
import { WeatherChart } from './components/WeatherChart'
import './styles.css'

const ranges = [
  { label: '1h', ms: 60 * 60 * 1000 },
  { label: '6h', ms: 6 * 60 * 60 * 1000 },
  { label: '24h', ms: 24 * 60 * 60 * 1000 },
] as const

const now = () => Date.now()
const toISO = (ms: number) => new Date(ms).toISOString()

export default function App() {
  const [city, setCity] = useState('Singapore')
  const [rangeMs, setRangeMs] = useState(ranges[1].ms)
  const [series, setSeries] = useState<WeatherPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadHistory = async (c: string, r: number) => {
    try {
      setLoading(true)
      setError(null)
      const to = now()
      const from = to - r
      const data = await fetchWeatherSeries(c, toISO(from), toISO(to))
      setSeries(data.points)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load series')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const socket = getSocket()
    const poll = () => {
      socket.timeout(3000).emit('getWeather', { city }, (res: any) => {
        if (res && typeof res.tempC === 'number') {
          setSeries((prev) => [...prev, { ts: now(), tempC: res.tempC }].slice(-10000))
        }
        timerRef.current = setTimeout(poll, 60000)
      })
    }
    poll()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [city])

  useEffect(() => {
    loadHistory(city, rangeMs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, rangeMs])

  const windowed = useMemo(() => {
    const cutoff = now() - rangeMs
    return series.filter((p) => p.ts >= cutoff)
  }, [series, rangeMs])

  return (
    <div className="container">
      <header className="toolbar">
        <div>
          <h1>Weather Time Series</h1>
          <p>RedisTimeSeries via NestJS</p>
        </div>
        <div className="controls">
          <label>City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Singapore"
          />
          <label>Range</label>
          <div className="range">
            {ranges.map((r) => (
              <button
                key={r.label}
                onClick={() => setRangeMs(r.ms)}
                className={rangeMs === r.ms ? 'active' : ''}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => loadHistory(city, rangeMs)} className="primary">
            Refresh
          </button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <main style={{ padding: '1rem' }}>
        {loading && <p>Loading...</p>}
        {!loading && windowed.length === 0 && <p>No data available. Waiting for data...</p>}
        {windowed.length > 0 && <WeatherChart data={windowed} />}
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          {windowed.length} data points in selected range
        </div>
      </main>
    </div>
  )
}