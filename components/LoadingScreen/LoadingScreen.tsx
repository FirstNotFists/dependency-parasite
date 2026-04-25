import type { LoadingStep } from '../../types'
import './LoadingScreen.css'

const STEP_LABELS: Record<LoadingStep, string> = {
  'fetch-package': 'GitHub에서 package.json 수집 중...',
  'fetch-languages': '레포지토리 언어 통계 분석 중...',
  'fetch-registry': 'npm registry에서 전이 의존성 조회 중...',
  analyzing: '기생 심각도 산출 중...',
  'generating-creatures': 'Gemini AI로 기생체 디자인 생성 중...',
}

const STEP_ORDER: LoadingStep[] = [
  'fetch-package',
  'fetch-languages',
  'fetch-registry',
  'analyzing',
  'generating-creatures',
]

type LoadingScreenProps = {
  step: LoadingStep
  repository: string
}

export default function LoadingScreen({ step, repository }: LoadingScreenProps) {
  const currentIndex = STEP_ORDER.indexOf(step)

  return (
    <div className="loading">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring" />
          <div className="spinner-core" />
        </div>

        <p className="loading-repo">{repository}</p>

        <div className="loading-steps">
          {STEP_ORDER.map((s, i) => (
            <p
              key={s}
              className={`loading-step ${
                i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending'
              }`}
            >
              <span className="step-dot" />
              {STEP_LABELS[s]}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
