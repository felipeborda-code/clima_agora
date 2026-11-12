import { useEffect, useState } from 'react'
import { Search, MapPin, Wind, Droplets, Thermometer, Sunrise, Sunset, CloudRain, RefreshCw, CloudSun, Sun, Cloud, CloudFog, CloudDrizzle, CloudLightning, Snowflake } from 'lucide-react'
import './App.css'

const weatherInfo = (code) => {
  if (code === 0) return { label: 'Céu limpo', Icon: Sun }
  if ([1, 2].includes(code)) return { label: 'Parcialmente nublado', Icon: CloudSun }
  if (code === 3) return { label: 'Nublado', Icon: Cloud }
  if ([45, 48].includes(code)) return { label: 'Neblina', Icon: CloudFog }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Garoa', Icon: CloudDrizzle }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Chuva', Icon: CloudRain }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Neve', Icon: Snowflake }
  if ([95, 96, 99].includes(code)) return { label: 'Tempestade', Icon: CloudLightning }
  return { label: 'Condição variável', Icon: CloudSun }
}
const dayName = (date, today = false) => today ? 'Hoje' : new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '')
const hour = (value) => value ? value.slice(11, 16) : '--:--'

export default function App() {
  const [city, setCity] = useState('São Paulo')
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState(null)
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function searchCity(name = city) {
    if (!name.trim()) return
    setLoading(true); setError('')
    try {
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=pt&format=json`)
      if (!geoResponse.ok) throw new Error('Não foi possível buscar a cidade.')
      const geo = await geoResponse.json()
      if (!geo.results?.length) throw new Error('Cidade não encontrada. Verifique o nome e tente novamente.')
      const p = geo.results[0]
      const params = new URLSearchParams({ latitude: p.latitude, longitude: p.longitude, current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m', daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max', timezone: 'auto', forecast_days: '6' })
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      if (!response.ok) throw new Error('Não foi possível carregar a previsão do tempo.')
      setWeather(await response.json()); setPlace(p); setCity(p.name); setQuery('')
    } catch (e) { setError(e.message || 'Ocorreu um erro ao consultar o clima.') }
    finally { setLoading(false) }
  }
  useEffect(() => { searchCity('São Paulo') }, [])

  const current = weather?.current
  const condition = current ? weatherInfo(current.weather_code) : weatherInfo(0)
  const MainIcon = condition.Icon
  const daily = weather?.daily

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#inicio"><span className="brand-icon"><CloudSun size={23}/></span><span>Clima<span className="brand-light">Agora</span></span></a><div className="top-label"><span className="live-dot"/> PREVISÃO DO TEMPO EM TEMPO REAL</div></header>
    <main id="inicio" className="main-content">
      <section className="intro"><div className="eyebrow">SEU TEMPO, DE UM JEITO SIMPLES</div><h1>Acompanhe o clima<br/><span>em qualquer lugar.</span></h1><p>Consulte as condições atuais e confira a previsão dos próximos dias.</p>
        <form className="search-form" onSubmit={e => { e.preventDefault(); searchCity(query) }}><MapPin size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Digite o nome de uma cidade..."/><button type="submit" disabled={loading || !query.trim()}><Search size={18}/><span>Buscar</span></button></form>
        {error && <div className="error-message">{error}</div>}
      </section>
      {loading && !weather ? <div className="loading-card">Carregando informações do clima...</div> : current && <>
        <section className="weather-card">
          <div className="weather-main"><div className="location"><MapPin size={17}/><span>{place?.name}{place?.admin1 ? `, ${place.admin1}` : ''}{place?.country ? `, ${place.country}` : ''}</span></div><div className="current-weather"><div className="big-weather-icon"><MainIcon size={76} strokeWidth={1.35}/></div><div><div className="temperature">{Math.round(current.temperature_2m)}<span>°C</span></div><div className="condition">{condition.label}</div></div></div><div className="feels-like">Sensação térmica de <strong>{Math.round(current.apparent_temperature)}°C</strong></div></div>
          <div className="weather-side"><div className="side-heading">CONDIÇÕES ATUAIS</div><div className="metric-grid"><Metric icon={<Droplets/>} label="Umidade" value={`${current.relative_humidity_2m}%`}/><Metric icon={<Wind/>} label="Vento" value={`${Math.round(current.wind_speed_10m)} km/h`}/><Metric icon={<CloudRain/>} label="Precipitação" value={`${current.precipitation} mm`}/><Metric icon={<Thermometer/>} label="Temperatura" value={`${Math.round(current.temperature_2m)}°C`}/></div><div className="updated"><span/> Dados meteorológicos atualizados</div></div>
        </section>
        <section className="forecast-section"><div className="section-heading"><div><div className="eyebrow">FIQUE PREPARADO</div><h2>Previsão para os próximos dias</h2></div><button className="refresh-btn" onClick={() => searchCity(city)} disabled={loading}><RefreshCw size={16} className={loading ? 'spin' : ''}/> Atualizar</button></div>
          <div className="forecast-grid">{daily.time.map((date, i) => { const info = weatherInfo(daily.weather_code[i]); const Icon = info.Icon; return <article className={`day-card ${i === 0 ? 'today' : ''}`} key={date}><div className="day-name">{dayName(date, i === 0)}</div><div className="day-date">{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`))}</div><Icon className="forecast-icon" size={34} strokeWidth={1.5}/><div className="day-condition">{info.label}</div><div className="day-temperatures"><strong>{Math.round(daily.temperature_2m_max[i])}°</strong><span>{Math.round(daily.temperature_2m_min[i])}°</span></div><div className="rain-chance"><Droplets size={13}/>{daily.precipitation_probability_max[i] ?? 0}%</div></article> })}</div>
        </section>
        <section className="sun-section"><div className="sun-info"><div className="sun-icon sunrise"><Sunrise size={24}/></div><div><span>Nascer do sol</span><strong>{hour(daily.sunrise[0])}</strong></div></div><div className="sun-track"><div className="sun-track-line"/><Sun size={19}/><span>LUZ DO DIA</span></div><div className="sun-info"><div className="sun-icon sunset"><Sunset size={24}/></div><div><span>Pôr do sol</span><strong>{hour(daily.sunset[0])}</strong></div></div></section>
      </>}
      <footer>Informações fornecidas por <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · Projeto desenvolvido com Vite + React</footer>
    </main>
  </div>
}
function Metric({ icon, label, value }) { return <div className="metric"><div className="metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div> }
