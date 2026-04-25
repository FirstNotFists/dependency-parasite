import type { AnalysisResult, GeminiResult, CreatureDesign, GeminiReport } from './types'
import { MAX_FALLBACK_CREATURES } from './constants/parasite'
import { FALLBACK_PALETTES } from './constants/colors'
import { fallbackShape, fallbackMotion, buildFallbackBioLabel, buildFallbackCreatureName, hashString } from './utils/creatureFallback'

function buildFallbackCreatures(result: AnalysisResult): CreatureDesign[] {
  return result.dependencies.slice(0, MAX_FALLBACK_CREATURES).map((dep, i) => {
    const h = hashString(dep.name)
    const palette = FALLBACK_PALETTES[(h + i) % FALLBACK_PALETTES.length]

    return {
      name: dep.name,
      creatureName: buildFallbackCreatureName(dep.name, dep.group),
      shape: fallbackShape(dep.name, i),
      color: { ...palette },
      motion: fallbackMotion(dep.name, i),
      bioLabel: buildFallbackBioLabel(dep.name, dep.group, dep.transitiveCount),
    }
  })
}

function buildFallbackReport(result: AnalysisResult): GeminiReport {
  const hostPercent = (result.hostProfile.hostRatio * 100).toFixed(
    result.hostProfile.hostRatio < 0.01 ? 3 : 1,
  )
  return {
    speciesName: `Parasitus ${result.packageName.replace(/[^a-zA-Z]/g, '')}ensis`,
    dangerLevel: result.infestationSeverity,
    hostIntegrity: `${hostPercent}% / The host glimmers faintly`,
    bioReport: `This colony comprises ${result.directDependencyCount} direct parasitic species accompanied by ${result.transitiveDependencyCount} transitive species, forming a biomass ${result.dependencyAmplification}x the host's size. The host code's viable ratio is estimated at ${hostPercent}%. Immediate functional collapse is expected upon cessation of external protein supply.`,
    nakedHostComment: `This is all the code you actually wrote. The rest was never yours.`,
  }
}

export async function generateCreatureDesigns(result: AnalysisResult): Promise<GeminiResult> {
  try {
    const depsByGroup: Record<string, string[]> = {}
    for (const dep of result.dependencies) {
      const list = depsByGroup[dep.group] ?? []
      list.push(dep.name)
      depsByGroup[dep.group] = list
    }

    const payload = {
      repository: result.repository,
      packageName: result.packageName,
      hostProfile: {
        totalCodeBytes: result.hostProfile.totalCodeBytes,
        hostRatio: result.hostProfile.hostRatio,
      },
      directDependencyCount: result.directDependencyCount,
      transitiveDependencyCount: result.transitiveDependencyCount,
      dependencyAmplification: result.dependencyAmplification,
      infestationSeverity: result.infestationSeverity,
      dependencies: result.dependencies.slice(0, MAX_FALLBACK_CREATURES).map(d => ({
        name: d.name,
        group: d.group,
        transitiveCount: d.transitiveCount,
      })),
    }

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error(`API returned ${res.status}`)

    const data = await res.json() as GeminiResult
    if (!data.report || !data.creatures || !Array.isArray(data.creatures)) {
      throw new Error('Invalid response structure')
    }

    return data
  } catch (err) {
    console.warn('Gemini API failed, using fallback:', err)
    return {
      report: buildFallbackReport(result),
      creatures: buildFallbackCreatures(result),
    }
  }
}
