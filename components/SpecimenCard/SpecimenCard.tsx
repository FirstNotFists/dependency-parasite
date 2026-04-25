import { formatBytes } from '../../utils/format'
import type { Parasite, AnalysisResult } from '../../types'
import './SpecimenCard.css'

const GROUP_KR: Record<string, string> = {
  dependencies: '런타임',
  devDependencies: '개발 도구',
  peerDependencies: '공생 요구',
  optionalDependencies: '선택적',
}

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
    <div className="specimen-panel">
      <button className="specimen-close" onClick={onClose}>&times;</button>

      <p className="specimen-label">표본 관찰 기록</p>

      <h2 className="specimen-name" style={{ color: parasite.color.emissive }}>
        {parasite.creatureName}
      </h2>
      <p className="specimen-package">
        {parasite.name}
        {dep?.versionRange ? ` · ${dep.versionRange}` : ''}
      </p>

      <div className="specimen-stats">
        <div className="specimen-stat">
          <span className="stat-label">크기</span>
          <span className="stat-value">{dep?.unpackedSize ? formatBytes(dep.unpackedSize) : '—'}</span>
        </div>
        <div className="specimen-stat">
          <span className="stat-label">전이 종</span>
          <span className="stat-value">+{parasite.transitiveCount}</span>
        </div>
        <div className="specimen-stat">
          <span className="stat-label">점유율</span>
          <span className="stat-value">{percentage}%</span>
        </div>
        <div className="specimen-stat">
          <span className="stat-label">분류</span>
          <span className="stat-value">{GROUP_KR[parasite.group] ?? parasite.group}</span>
        </div>
      </div>

      <div className="specimen-bio">
        <p className="specimen-bio-label">관찰 소견</p>
        <p className="specimen-bio-text">{parasite.bioLabel}</p>
      </div>
    </div>
  )
}
