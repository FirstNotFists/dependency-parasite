import { useState } from 'react'
import ParasiteScene from '../ParasiteScene/ParasiteScene'
import SpecimenCard from '../SpecimenCard/SpecimenCard'
import { formatBytes } from '../../utils/format'
import { SEVERITY_COLORS } from '../../constants/parasite'
import type { AnalysisResult, Parasite } from '../../types'
import './ResultScreen.css'

type ResultScreenProps = {
  result: AnalysisResult
  onReset: () => void
}

export default function ResultScreen({ result, onReset }: ResultScreenProps) {
  const [naked, setNaked] = useState(false)
  const [selectedParasite, setSelectedParasite] = useState<Parasite | null>(null)

  const { hostProfile, infestationSeverity } = result
  const hostPercent = (hostProfile.hostRatio * 100).toFixed(
    hostProfile.hostRatio < 0.01 ? 3 : 1,
  )

  const report = result.gemini?.report
  const creatureCount = Math.min(result.dependencies.length, 60)

  return (
    <main className="result">
      <section className="parasite-stage" aria-label="3D parasite renderer">
        <ParasiteScene
          result={result}
          naked={naked}
          selectedParasite={selectedParasite}
          onSelectParasite={setSelectedParasite}
        />
      </section>

      {selectedParasite && (
        <SpecimenCard
          parasite={selectedParasite}
          result={result}
          onClose={() => setSelectedParasite(null)}
        />
      )}

      {naked && (
        <div className="naked-overlay">
          <p className="naked-text">
            {report?.nakedHostComment ?? 'This is all the code you actually wrote.'}
            <br />
            <strong>{hostPercent}% of total</strong>
          </p>
          <button className="naked-close" onClick={() => setNaked(false)}>
            Restore Parasites
          </button>
        </div>
      )}

      <header className="result-header">
        <button className="back-button" onClick={onReset}>&larr;</button>
        <span className="result-repo">{result.repository}</span>
      </header>

      <aside className="scan-panel" aria-label="Analysis summary">
        <div className="scan-row">
          <span className="scan-label">Host Code</span>
          <strong className="scan-value">{formatBytes(hostProfile.totalCodeBytes)}</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">External Deps (est.)</span>
          <strong className="scan-value">{formatBytes(hostProfile.estimatedExternalBytes)}</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">Host Ratio (est.)</span>
          <strong className="scan-value">{hostPercent}%</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">Direct Deps</span>
          <strong className="scan-value">{result.directDependencyCount}</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">Transitive Deps</span>
          <strong className="scan-value">+{result.transitiveDependencyCount} ({result.dependencyAmplification}x)</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">Infestation</span>
          <strong className="scan-value" style={{ color: SEVERITY_COLORS[infestationSeverity] }}>
            {infestationSeverity}
          </strong>
        </div>
      </aside>

      <section className="codex-card">
        <p className="codex-label">Colony Classification</p>
        <h2 className="codex-species">
          {report?.speciesName ?? `Parasitus ${result.packageName}`}
        </h2>
        <p className="codex-body">
          {report
            ? report.bioReport
            : `This project has ${result.directDependencyCount} direct dependencies pulling in ${result.transitiveDependencyCount} transitive species, forming a biomass ${result.dependencyAmplification}x the host's size. The host's viable code ratio is estimated at just ${hostPercent}%.`}
        </p>

        <div className="codex-stats">
          <div className="codex-stat-bar">
            <div className="codex-stat-fill" style={{ width: `${Math.min(creatureCount / 60 * 100, 100)}%` }} />
            <span className="codex-stat-bar-label">{creatureCount} species detected</span>
          </div>
          <div className="codex-stat-row">
            <span>Severity</span>
            <strong style={{ color: SEVERITY_COLORS[infestationSeverity] }}>
              {infestationSeverity}
            </strong>
          </div>
          <div className="codex-stat-row">
            <span>Amplification</span>
            <strong>{result.dependencyAmplification}x</strong>
          </div>
          <div className="codex-stat-row">
            <span>Host Integrity</span>
            <strong>{hostPercent}%</strong>
          </div>
        </div>

        <p className="codex-hint">Click a specimen to inspect</p>
      </section>

      <button className="naked-button" onClick={() => setNaked(!naked)}>
        {naked ? 'Restore Parasites' : 'Reveal Host'}
      </button>

      <div className="viewer-overlay">
        <span className="recording-dot" />
        Rendering containment
      </div>
    </main>
  )
}
