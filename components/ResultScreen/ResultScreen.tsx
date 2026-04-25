import { useState } from 'react'
import ParasiteScene from '../ParasiteScene/ParasiteScene'
import SpecimenCard from '../SpecimenCard/SpecimenCard'
import { formatBytes } from '../../utils/format'
import { SEVERITY_COLORS } from '../../constants/parasite'
import type { AnalysisResult, Parasite } from '../../types'
import './ResultScreen.css'

const SEVERITY_KR: Record<string, string> = {
  Symbiotic: '공생 단계',
  Colonized: '군락 형성',
  Consumed: '잠식 완료',
  'Hollow Shell': '숙주 소멸',
}

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
        <button className="back-button" onClick={onReset}>&larr;</button>
        <span className="result-repo">{result.repository}</span>
      </header>

      <aside className="scan-panel" aria-label="분석 요약">
        <div className="scan-row">
          <span className="scan-label">숙주 코드</span>
          <strong className="scan-value">{formatBytes(hostProfile.totalCodeBytes)}</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">외부 의존성 (추정)</span>
          <strong className="scan-value">{formatBytes(hostProfile.estimatedExternalBytes)}</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">숙주 코드 비율 (추정)</span>
          <strong className="scan-value">{hostPercent}%</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">직접 의존성</span>
          <strong className="scan-value">{result.directDependencyCount}개</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">전이 의존성</span>
          <strong className="scan-value">+{result.transitiveDependencyCount}개 ({result.dependencyAmplification}x 증폭)</strong>
        </div>
        <div className="scan-row">
          <span className="scan-label">기생 심각도</span>
          <strong className="scan-value" style={{ color: SEVERITY_COLORS[infestationSeverity] }}>
            {SEVERITY_KR[infestationSeverity] ?? infestationSeverity}
          </strong>
        </div>
      </aside>

      <section className="codex-card">
        <p className="codex-label">군락 분류</p>
        <h2 className="codex-species">
          {report?.speciesName ?? `Parasitus ${result.packageName}`}
        </h2>
        <p className="codex-body">
          {report
            ? report.bioReport
            : `이 프로젝트는 ${result.directDependencyCount}개의 직접 의존성이 ${result.transitiveDependencyCount}개의 전이 종을 끌고 와 숙주의 ${result.dependencyAmplification}배에 달하는 바이오매스를 형성했습니다. 숙주의 생존 가능 코드 비율은 ${hostPercent}%에 불과하며, 외부 단백질 공급이 중단될 경우 즉각적인 기능 상실이 예상됩니다.`}
        </p>

        <div className="codex-stats">
          <div className="codex-stat-bar">
            <div className="codex-stat-fill" style={{ width: `${Math.min(creatureCount / 60 * 100, 100)}%` }} />
            <span className="codex-stat-bar-label">기생체 {creatureCount}종 검출</span>
          </div>
          <div className="codex-stat-row">
            <span>기생 심각도</span>
            <strong style={{ color: SEVERITY_COLORS[infestationSeverity] }}>
              {SEVERITY_KR[infestationSeverity] ?? infestationSeverity}
            </strong>
          </div>
          <div className="codex-stat-row">
            <span>증폭 배율</span>
            <strong>{result.dependencyAmplification}x</strong>
          </div>
          <div className="codex-stat-row">
            <span>숙주 보존율</span>
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
