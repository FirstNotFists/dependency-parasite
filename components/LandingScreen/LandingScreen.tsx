import { useState, useMemo } from 'react'
import { seedRandom } from '../../utils/format'
import { PARTICLE_COUNT } from '../../constants/parasite'
import './LandingScreen.css'

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
    left: `${seedRandom(i * 4) * 100}%`,
    top: `${seedRandom(i * 4 + 1) * 100}%`,
    animationDelay: `${seedRandom(i * 4 + 2) * 8}s`,
    animationDuration: `${6 + seedRandom(i * 4 + 3) * 6}s`,
  }))
}

type LandingScreenProps = {
  onSubmit: (url: string) => void
}

export default function LandingScreen({ onSubmit }: LandingScreenProps) {
  const [url, setUrl] = useState('')
  const particles = useMemo(() => generateParticles(), [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) onSubmit(url.trim())
  }

  return (
    <div className="landing">
      <div className="landing-content">
        <p className="landing-eyebrow">specimen observatory</p>
        <h1 className="landing-title">
          Dependency<br />Parasite
        </h1>
        <p className="landing-sub">
          Your code is just a host.
        </p>

        <form className="landing-form" onSubmit={handleSubmit}>
          <input
            className="landing-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            autoFocus
          />
          <button
            className="landing-button"
            type="submit"
            disabled={!url.trim()}
          >
            Scan
          </button>
        </form>

        <p className="landing-hint">
          Enter a GitHub repository URL to analyze its dependency parasites.
        </p>
      </div>

      <div className="landing-particles" aria-hidden="true">
        {particles.map((style, i) => (
          <span key={i} className="particle" style={style} />
        ))}
      </div>
    </div>
  )
}
