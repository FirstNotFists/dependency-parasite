import { formatBytes, calculatePercentage } from '../../utils/format'
import type { Parasite, AnalysisResult } from '../../types'
import './SpecimenCard.css'

const GROUP_LABELS: Record<string, string> = {
  dependencies: 'Runtime',
  devDependencies: 'Dev Tool',
  peerDependencies: 'Peer',
  optionalDependencies: 'Optional',
}

type SpecimenCardProps = {
  parasite: Parasite
  result: AnalysisResult
  onClose: () => void
}

export default function SpecimenCard({ parasite, result, onClose }: SpecimenCardProps) {
  const dep = result.dependencies.find(d => d.name === parasite.name)
  const percentage = calculatePercentage(dep?.unpackedSize ?? null, result.hostProfile.estimatedExternalBytes)

  return (
    <div className="specimen-panel">
      <button className="specimen-close" onClick={onClose}>&times;</button>

      <p className="specimen-label">Specimen Record</p>

      <h2 className="specimen-name" style={{ color: parasite.color.emissive }}>
        {parasite.creatureName}
      </h2>
      <p className="specimen-package">
        {parasite.name}
        {dep?.versionRange ? ` · ${dep.versionRange}` : ''}
      </p>

      <div className="specimen-stats">
        <div className="specimen-stat">
          <span className="stat-label">Size</span>
          <span className="stat-value">{dep?.unpackedSize ? formatBytes(dep.unpackedSize) : '—'}</span>
        </div>
        <div className="specimen-stat">
          <span className="stat-label">Transitive</span>
          <span className="stat-value">+{parasite.transitiveCount}</span>
        </div>
        <div className="specimen-stat">
          <span className="stat-label">% Total</span>
          <span className="stat-value">{percentage}%</span>
        </div>
        <div className="specimen-stat">
          <span className="stat-label">Group</span>
          <span className="stat-value">{GROUP_LABELS[parasite.group] ?? parasite.group}</span>
        </div>
      </div>

      <div className="specimen-bio">
        <p className="specimen-bio-label">Observation</p>
        <p className="specimen-bio-text">{parasite.bioLabel}</p>
      </div>
    </div>
  )
}
