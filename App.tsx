import { useState } from 'react'
import LandingScreen from './components/LandingScreen/LandingScreen'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import ResultScreen from './components/ResultScreen/ResultScreen'
import ErrorScreen from './components/ErrorScreen/ErrorScreen'
import {
  parseGitHubUrl,
  fetchPackageJson,
  fetchLanguages,
  fetchTransitiveDeps,
  buildAnalysis,
} from './github'
import { generateCreatureDesigns } from './gemini'
import type { AnalysisResult, AppPhase, DependencyGroup, LoadingStep } from './types'
import { DEPENDENCY_GROUPS } from './constants/parasite'

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
      setErrorMsg('Invalid GitHub repository URL format.')
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
      const allDeps: { name: string; versionRange: string; group: DependencyGroup }[] = []
      for (const g of DEPENDENCY_GROUPS) {
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
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred during analysis.')
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
    return <ErrorScreen message={errorMsg} onRetry={handleReset} />
  }

  return <LandingScreen onSubmit={handleSubmit} />
}
