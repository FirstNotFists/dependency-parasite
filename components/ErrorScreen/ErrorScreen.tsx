import './ErrorScreen.css'

type ErrorScreenProps = {
  message: string
  onRetry: () => void
}

export default function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <div className="error-screen">
      <div className="error-content">
        <h2 className="error-title">Analysis Failed</h2>
        <p className="error-msg">{message}</p>
        <button className="error-button" onClick={onRetry}>
          Try Again
        </button>
      </div>
    </div>
  )
}
