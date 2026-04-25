import type { LoadingStep } from '../../types'
import './LoadingScreen.css'

const STEP_LABELS: Record<LoadingStep, string> = {
  'fetch-package': 'Fetching package.json from GitHub...',
  'fetch-languages': 'Analyzing repository language stats...',
  'fetch-registry': 'Querying npm registry for transitive deps...',
  analyzing: 'Calculating infestation severity...',
  'generating-creatures': 'Generating creature designs with Gemini AI...',
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
