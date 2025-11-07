const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export async function fetchWeatherSeries(city: string, fromISO: string, toISO: string) {
    const url = new URL(`${API_BASE}/weather/series`)
    url.searchParams.set('city', city)
    url.searchParams.set('from', fromISO)
    url.searchParams.set('to', toISO)

    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
    }

    const data = (await res.json()) as import('./types').WeatherSeriesResponse
    const points = (data?.points ?? [])
        .filter((p) => typeof p.ts === 'number' && typeof p.tempC === 'number')
        .sort((a, b) => a.ts - b.ts)
    
    return {
        ...data,
        points
    }
}