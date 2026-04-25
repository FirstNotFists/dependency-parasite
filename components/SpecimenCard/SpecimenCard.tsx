import { formatBytes } from '../../utils/format'
import type { Parasite, AnalysisResult } from '../../types'
import './SpecimenCard.css'

type SpecimenCardProps = {
  parasite: Parasite
  result: AnalysisResult
  onClose: () => void
}

export default function SpecimenCard({ parasite, result, onClose }: SpecimenCardProps) {
  const dep = result.dependencies.find(d => d.name === parasite.name)
  const totalExternal = result.hostProfile.estimatedExternalBytes
  const percentage = dep?.unpackedSize && totalExternal > 0
    ? ((dep.unpackedSize / totalExternal) * 100).toFixed(1)
    : '—'

  return (
    <div className="specimen-backdrop" onClick={onClose}>
      <div className="specimen-card" onClick={e => e.stopPropagation()}>
        <button className="specimen-close" onClick={onClose}>
          &times;
        </button>

        <p className="specimen-label">SPECIMEN</p>

        <h2
          className="specimen-name"
          style={{ color: parasite.color.emissive }}
        >
          {parasite.creatureName}
        </h2>
        <p className="specimen-package">
          {parasite.name}
          {dep?.versionRange ? ` · ${dep.versionRange}` : ''}
        </p>

        <div className="specimen-stats">
          <div className="specimen-stat">
            <span className="stat-label">SIZE</span>
            <span className="stat-value">
              {dep?.unpackedSize ? formatBytes(dep.unpackedSize) : '—'}
            </span>
          </div>
          <div className="specimen-stat">
            <span className="stat-label">TRANSITIVE</span>
            <span className="stat-value">+{parasite.transitiveCount}</span>
          </div>
          <div className="specimen-stat">
            <span className="stat-label">% TOTAL</span>
            <span className="stat-value">{percentage}%</span>
          </div>
          <div className="specimen-stat">
            <span className="stat-label">GROUP</span>
            <span className="stat-value">{parasite.group.replace('Dependencies', '')}</span>
          </div>
        </div>

        <div className="specimen-bio">
          <p className="specimen-bio-label">BIO</p>
          <p className="specimen-bio-text">{parasite.bioLabel}</p>
        </div>
      </div>
    </div>
  )
}
