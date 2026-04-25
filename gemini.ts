import type { AnalysisResult, GeminiResult, CreatureDesign, GeminiReport } from './types'

function buildFallbackCreatures(result: AnalysisResult): CreatureDesign[] {
  const bodies: Array<'tapered' | 'hooked' | 'ellipsoid' | 'capsule' | 'torus' | 'sphere'> = ['tapered', 'hooked', 'ellipsoid', 'capsule', 'torus', 'sphere']
  const motions: Array<'writhe' | 'lurch' | 'pulse' | 'drift' | 'orbit' | 'flicker' | 'breathe'> = [
    'writhe', 'lurch', 'pulse', 'drift', 'orbit', 'flicker', 'breathe',
  ]
  const palettes = [
    { primary: '#1a3a2a', secondary: '#0d1f15', emissive: '#00ff88' },
    { primary: '#2a1a3a', secondary: '#150d1f', emissive: '#bf00ff' },
    { primary: '#3a1a1a', secondary: '#1f0d0d', emissive: '#ff4400' },
    { primary: '#1a2a3a', secondary: '#0d151f', emissive: '#00ccff' },
    { primary: '#2a2a1a', secondary: '#1f1f0d', emissive: '#ccff00' },
    { primary: '#1a3a3a', secondary: '#0d1f1f', emissive: '#00ffcc' },
    { primary: '#3a1a2a', secondary: '#1f0d15', emissive: '#ff0088' },
    { primary: '#2a3a1a', secondary: '#151f0d', emissive: '#88ff00' },
  ]

  const appendageTypes: Array<'tendril' | 'fang' | 'cone' | 'ring' | 'sphere' | 'torus'> = ['tendril', 'fang', 'cone', 'ring', 'sphere', 'torus']

  return result.dependencies.slice(0, 30).map((dep, i) => {
    const hash = dep.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const palette = palettes[(hash + i) % palettes.length]

    return {
      name: dep.name,
      creatureName: `${dep.name.charAt(0).toUpperCase()}${dep.name.slice(1, 5)}osaurus ${dep.group === 'dependencies' ? 'Parasiticus' : 'Instrumentalis'}`,
      shape: {
        body: bodies[(hash + i) % bodies.length],
        segments: 1 + (hash % 6),
        appendages: [{
          type: appendageTypes[(hash * 3) % appendageTypes.length],
          count: 2 + (hash % 8),
          sizeRatio: 0.15 + (hash % 30) / 100,
          spread: (['radial', 'linear', 'random'] as const)[(hash * 7) % 3],
        }],
        aspectRatio: [
          0.7 + (hash % 8) / 10,
          0.7 + ((hash * 3) % 10) / 10,
          0.7 + ((hash * 5) % 8) / 10,
        ] as [number, number, number],
      },
      color: { ...palette, emissiveIntensity: 0.3 + (hash % 5) / 10 },
      motion: {
        primary: motions[(hash + i) % motions.length],
        secondary: motions[(hash + i + 3) % motions.length],
        speedMultiplier: 0.5 + (hash % 8) / 10,
        amplitude: 0.4 + (hash % 5) / 10,
      },
      bioLabel: `문(門) ${dep.group === 'dependencies' ? 'Runtimea' : 'Instrumentalia'}, 강(綱) Modularis에 속하는 ${dep.transitiveCount > 5 ? '대형' : dep.transitiveCount > 0 ? '중형' : '소형'} 기생종. 숙주의 ${dep.group === 'dependencies' ? '핵심 실행 환경' : '개발 도구 체계'}에 깊이 침투하여 ${dep.name} 효소를 분비하며 숙주의 대사 경로를 자체 생존에 유리하도록 재편한다. ${dep.transitiveCount > 0 ? `${dep.transitiveCount}개의 하위 공생체를 거느리며 독자적인 미생물 군락을 형성하고 있어, 단일 종 제거 시 연쇄적 생태계 붕괴가 예상된다.` : '독립적으로 기생하며 다른 종과의 의존 관계 없이 숙주에 직접 기생하는 단독 생활형으로 관찰된다.'} 본 종의 완전한 적출 시 숙주의 해당 기능 영역에 즉각적인 기능 저하가 발생할 것으로 판단된다.`,
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
    hostIntegrity: `${hostPercent}% / 숙주는 희미하게 빛나고 있다`,
    bioReport: `본 군락은 ${result.directDependencyCount}개의 직접 기생종이 ${result.transitiveDependencyCount}개의 전이 종을 수반하여 숙주의 ${result.dependencyAmplification}배에 달하는 바이오매스를 형성한 것으로 관측되었다. 숙주 코드의 생존 가능 비율은 추정 ${hostPercent}%이며, 외부 단백질 공급이 중단될 경우 즉각적인 기능 상실이 예상된다.`,
    nakedHostComment: `이것이 당신이 직접 작성한 코드의 전부입니다. 나머지는 당신의 것이 아닙니다.`,
  }
}

export async function generateCreatureDesigns(result: AnalysisResult): Promise<GeminiResult> {
  try {
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
      dependencies: result.dependencies.slice(0, 30).map(d => ({
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

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`)
    }

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
