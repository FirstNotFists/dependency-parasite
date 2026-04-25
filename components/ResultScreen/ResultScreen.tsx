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
            {report?.nakedHostComment ?? '이것이 당신이 직접 작성한 코드의 전부입니다.'}
            <br />
            <strong>전체의 {hostPercent}%</strong>
          </p>
          <button className="naked-close" onClick={() => setNaked(false)}>
            기생체 복원
          </button>
        </div>
      )}

      <header className="result-header">
        <button className="back-button" onClick={onReset}>
          &larr;
        </button>
        <span className="result-repo">{result.repository}</span>
      </header>

      <aside className="scan-panel" aria-label="분석 요약">
        <div className="scan-row">
          <span className="scan-label">숙주 코드</span>
          <strong className="scan-value">{formatBytes(hostProfile.totalCodeBytes)}</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">외부 의존성</span>
          <strong className="scan-value">
            {formatBytes(hostProfile.estimatedExternalBytes)}
          </strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">당신의 비율</span>
          <strong className="scan-value">{hostPercent}%</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">직접 의존성</span>
          <strong className="scan-value">{result.directDependencyCount}개</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">전이 의존성</span>
          <strong className="scan-value">
            +{result.transitiveDependencyCount}개 ({result.dependencyAmplification}x 증폭)
          </strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">기생 심각도</span>
          <strong
            className="scan-value"
            style={{ color: SEVERITY_COLORS[infestationSeverity] }}
          >
            {infestationSeverity}
          </strong>
        </div>
      </aside>

      <section className="codex-card">
        <p className="codex-label">COLONY CLASSIFICATION</p>
        <h2 className="codex-species">
          {report?.speciesName ?? `Parasitus ${result.packageName}`}
        </h2>
        <p className="codex-body">
          {report
            ? report.bioReport
            : `이 프로젝트는 ${result.directDependencyCount}개의 직접 의존성이 ${result.transitiveDependencyCount}개의 전이 종을 끌고 와 숙주의 ${result.dependencyAmplification}배에 달하는 바이오매스를 형성했습니다.`}
        </p>

        <div className="codex-stats">
          <div className="codex-stat-bar">
            <div
              className="codex-stat-fill"
              style={{ width: `${Math.min(creatureCount / 60 * 100, 100)}%` }}
            />
            <span className="codex-stat-bar-label">{creatureCount} creatures</span>
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

        <p className="codex-hint">표본을 클릭하여 관찰하세요</p>
      </section>

      <button className="naked-button" onClick={() => setNaked(!naked)}>
        {naked ? '기생체 복원' : '숙주만 보기'}
      </button>

      <div className="viewer-overlay">
        <span className="recording-dot" />
        격리실 렌더링 중
      </div>
    </main>
  )
}
