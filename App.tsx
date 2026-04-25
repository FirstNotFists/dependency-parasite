import { useState } from 'react'
import LandingScreen from './components/LandingScreen/LandingScreen'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import ResultScreen from './components/ResultScreen/ResultScreen'
import {
  parseGitHubUrl,
  fetchPackageJson,
  fetchLanguages,
  fetchTransitiveDeps,
  buildAnalysis,
} from './github'
import { generateCreatureDesigns } from './gemini'
import type { AnalysisResult, AppPhase, DependencyGroup, LoadingStep } from './types'
import './App.css'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('landing')
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('fetch-package')
  const [repoLabel, setRepoLabel] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (url: string) => {
    const parsed = parseGitHubUrl(url)
    if (!parsed) {
      setPhase('error')
      setErrorMsg('GitHub 레포지토리 URL 형식이 올바르지 않습니다.')
      return
    }

    const label = `${parsed.owner}/${parsed.repo}`
    setRepoLabel(label)
    setPhase('loading')
    setErrorMsg('')

    try {
      setLoadingStep('fetch-package')
      const pkgJson = await fetchPackageJson(parsed.owner, parsed.repo)

      setLoadingStep('fetch-languages')
      const languages = await fetchLanguages(parsed.owner, parsed.repo)

      setLoadingStep('fetch-registry')
      const groups: DependencyGroup[] = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
      const allDeps: { name: string; versionRange: string; group: DependencyGroup }[] = []
      for (const g of groups) {
        if (pkgJson[g]) {
          for (const [name, ver] of Object.entries(pkgJson[g])) {
            allDeps.push({ name, versionRange: ver as string, group: g })
          }
        }
      }
      const registryData = await fetchTransitiveDeps(allDeps)

      setLoadingStep('analyzing')
      const analysis = buildAnalysis(parsed.owner, parsed.repo, pkgJson, languages, registryData)

      setLoadingStep('generating-creatures')
      const geminiResult = await generateCreatureDesigns(analysis)
      analysis.gemini = geminiResult

      setResult(analysis)
      setPhase('result')
    } catch (err: unknown) {
      setPhase('error')
      setErrorMsg(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.')
    }
  }

  const handleReset = () => {
    setPhase('landing')
    setResult(null)
    setErrorMsg('')
  }

  if (phase === 'loading') {
    return <LoadingScreen step={loadingStep} repository={repoLabel} />
  }

  if (phase === 'result' && result) {
    return <ResultScreen result={result} onReset={handleReset} />
  }

  if (phase === 'error') {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2 className="error-title">분석 실패</h2>
          <p className="error-msg">{errorMsg}</p>
          <button className="error-button" onClick={handleReset}>
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return <LandingScreen onSubmit={handleSubmit} />
}
