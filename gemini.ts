import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AnalysisResult, GeminiResult, CreatureDesign, GeminiReport } from './types'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string

function buildPrompt(result: AnalysisResult): string {
  const depsByGroup: Record<string, string[]> = {}
  for (const dep of result.dependencies) {
    const list = depsByGroup[dep.group] ?? []
    list.push(dep.name)
    depsByGroup[dep.group] = list
  }

  const topHeaviest = [...result.dependencies]
    .sort((a, b) => b.transitiveCount - a.transitiveCount)
    .slice(0, 5)
    .map((d) => ({ name: d.name, transitive_count: d.transitiveCount }))

  const depsForCreatures = result.dependencies.slice(0, 30).map((d) => ({
    name: d.name,
    group: d.group,
    transitiveCount: d.transitiveCount,
  }))

  return `You are a creative biologist designing PARASITIC organisms for a 3D visualization project called "Dependency Parasite".
Each npm dependency is a parasitic creature feeding on a host (the developer's code). They should look PARASITIC, not cute or cell-like.

VISUAL STYLE — flat design with parasitic character:
- Body types: sphere, ellipsoid, torus, capsule, tapered (fat end + narrow tail), hooked (body with sharp curved extension)
- Appendage types: cone, ring, sphere, torus, tendril (segmented tentacle chain), fang (long sharp spike)
- PREFER tapered, hooked, capsule, ellipsoid bodies. Avoid plain sphere for more than 20% of creatures.
- PREFER tendril and fang appendages for at least 40% of creatures. These create the parasitic silhouette.
- Body colors should be DARK: deep greens (#1a3a2a), dark purples (#2a1a3a), near-blacks (#1a1a2a), dark teals (#1a2a3a). NOT bright pastels.
- Emissive/glow colors should be VIVID and TOXIC: acidic greens (#00ff88), electric cyans (#00ccff), warning oranges (#ff4400), venomous magentas (#ff0088), acid purples (#bf00ff).
- The contrast of "dark body + toxic glow" creates the parasitic look.
- NO realistic horror (no blood, veins, gore). Unsettling beauty through strange asymmetric shapes and aggressive movements.
- Each creature must look DIFFERENT from the others.

PROJECT ANALYSIS:
- Repository: ${result.repository}
- Package: ${result.packageName}
- Host code: ${result.hostProfile.totalCodeBytes} bytes
- Host ratio: ${(result.hostProfile.hostRatio * 100).toFixed(3)}%
- Direct dependencies: ${result.directDependencyCount}
- Transitive dependencies: ${result.transitiveDependencyCount}
- Amplification: ${result.dependencyAmplification}x
- Severity: ${result.infestationSeverity}
- Top heaviest: ${JSON.stringify(topHeaviest)}
- Groups: ${JSON.stringify(depsByGroup)}

RESPOND WITH VALID JSON ONLY (no markdown, no code blocks). The JSON must have this exact structure:

{
  "report": {
    "speciesName": "A deeply creative, academic Latin-style binomial nomenclature name for this project's parasite colony (e.g., 'Modularis Parasiticus Reactiformis'). Should sound like a real biological classification with genus and species, reflecting the project's dominant dependencies and ecosystem.",
    "dangerLevel": "${result.infestationSeverity}",
    "hostIntegrity": "X% / a witty Korean comment about the host's state",
    "bioReport": "3-4 sentences in Korean. Written like an academic biological research paper abstract. Describe: the colony's feeding mechanism, dominant species within the colony, the host's survival prognosis, and the ecological significance of this infestation. Reference specific dependency names and the host ratio. Tone: scholarly, darkly poetic, with dry humor. Example style: '본 군락은 React 속(屬)을 중심으로 한 렌더링 기생 체계를 형성하였으며, 숙주 코드의 생존 가능 비율은 0.6%로 관측되었다. Three.js 아종의 3차원 시각 피질 장악이 특히 두드러지며...'",
    "nakedHostComment": "1 sentence in Korean. What to display when all parasites are removed and only the tiny host remains. Should be emotionally impactful."
  },
  "creatures": [
    ${depsForCreatures
      .map(
        (d) => `{
      "name": "${d.name}",
      "creatureName": "Academic Latin binomial name reflecting this package's role (e.g., 'Fibrosus Rendericulum' for react-dom, 'Validatrix Schemensis' for zod). Must sound like a real biological species name.",
      "shape": {
        "body": "sphere|ellipsoid|torus|capsule|tapered|hooked",
        "segments": 1-8,
        "appendages": [{"type": "cone|ring|sphere|torus|tendril|fang", "count": 1-12, "sizeRatio": 0.1-0.6, "spread": "radial|linear|random"}],
        "aspectRatio": [x, y, z between 0.5 and 2.0]
      },
      "color": {
        "primary": "#hex (body color, bioluminescent tone)",
        "secondary": "#hex (appendage color)",
        "emissive": "#hex (glow color)",
        "emissiveIntensity": 0.2-0.9
      },
      "motion": {
        "primary": "pulse|drift|writhe|bloom|orbit|breathe|flicker|lurch",
        "secondary": "pulse|drift|writhe|bloom|orbit|breathe|flicker|lurch",
        "speedMultiplier": 0.3-1.5,
        "amplitude": 0.3-1.0
      },
      "bioLabel": "4-5 sentences in Korean. Write like a detailed field observation entry from a parasitology research journal. Structure: (1) 형태적 특징과 분류학적 위치 — 이 종이 어떤 계통에 속하며 어떤 형태적 특성을 가지는지. (2) 기생 메커니즘 — 숙주에 어떻게 침투하고 어떤 자원을 착취하는지. 패키지의 실제 기능을 생물학 용어로 번역. (3) 숙주 의존성 — 이 종이 제거되면 숙주에 어떤 영향이 생기는지. (4) 생태학적 역할 — 전체 의존성 생태계에서의 지위와 다른 종과의 관계. Example for 'react': '문(門) Renderia, 강(綱) Componentae에 속하는 대형 기생종. 가상 DOM이라는 독자적 효소 체계를 통해 숙주의 UI 렌더링 세포를 완전히 장악하며, 숙주는 이 종의 생명 주기(lifecycle) 없이는 단일 화면조차 구성할 수 없는 절대적 의존 관계를 형성한다. 전이 의존성으로 react-dom, scheduler 등 5종 이상의 하위 공생체를 거느리며, npm 생태계에서 가장 광범위한 숙주 감염률을 기록하는 지배종이다. 본 종의 제거 시 숙주의 즉각적이고 완전한 기능 상실이 예상된다.'"
    }`,
      )
      .join(',\n    ')}
  ]
}

IMPORTANT RULES:
- Each creature MUST have a unique body type and appendage combination. Vary them!
- Use ALL body types across the creatures. Prefer tapered/hooked/capsule over plain sphere.
- At least 40% of creatures should have tendril or fang appendages — these give the parasitic look.
- Segment counts should vary: some 1 (single body), some 3-8 (multi-segment worm/centipede)
- Body colors must be DARK (#1a-#2a range hex). Emissive colors must be VIVID/TOXIC.
- Prefer writhe and lurch motion types for aggressive creatures. Use breathe/drift for lurking ones.
- Motion combinations must differ per creature
- Framework/UI deps (react, vue, angular) → hooked/tapered body, many fangs, lurch motion
- Dev tools (eslint, prettier) → smaller capsule/torus, fewer appendages
- Heavy deps (webpack, babel) → multi-segment, tendrils, writhe motion
- Utility libs (lodash, date-fns) → ellipsoid with rings, drift motion
- The bioLabel MUST be 2-3 sentences in Korean, written like a marine biologist's detailed field observation. Describe: (1) how this parasite feeds on the host, (2) what dependency it creates, (3) its ecological role. Reference the package's real functionality through biological metaphor. Be specific, scholarly, and darkly poetic — not generic.
- The creatureName must sound like a real binomial nomenclature (Genus Species). Derive it from the package's actual function, not just its name. Example: typescript → 'Typosaurus Verificans', eslint → 'Lintococcus Purificans'.
- The speciesName for the colony should reflect the project's dominant ecosystem and overall character.`
}

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

  return result.dependencies.slice(0, 30).map((dep, i) => {
    const hash = dep.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const bodyIdx = (hash + i) % bodies.length
    const segments = 1 + (hash % 6)
    const appendageCount = 2 + (hash % 8)
    const appendageTypes: Array<'tendril' | 'fang' | 'cone' | 'ring' | 'sphere' | 'torus'> = ['tendril', 'fang', 'cone', 'ring', 'sphere', 'torus']
    const palette = palettes[(hash + i) % palettes.length]

    return {
      name: dep.name,
      creatureName: `${dep.name.charAt(0).toUpperCase()}${dep.name.slice(1, 5)}osaurus ${dep.group === 'dependencies' ? 'Parasiticus' : 'Instrumentalis'}`,
      shape: {
        body: bodies[bodyIdx],
        segments,
        appendages: [
          {
            type: appendageTypes[(hash * 3) % appendageTypes.length],
            count: appendageCount,
            sizeRatio: 0.15 + (hash % 30) / 100,
            spread: (['radial', 'linear', 'random'] as const)[(hash * 7) % 3],
          },
        ],
        aspectRatio: [
          0.7 + (hash % 8) / 10,
          0.7 + ((hash * 3) % 10) / 10,
          0.7 + ((hash * 5) % 8) / 10,
        ] as [number, number, number],
      },
      color: {
        ...palette,
        emissiveIntensity: 0.3 + (hash % 5) / 10,
      },
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
    bioReport: `이 프로젝트는 ${result.directDependencyCount}개의 직접 의존성이 ${result.transitiveDependencyCount}개의 전이 종을 끌고 와 숙주의 ${result.dependencyAmplification}배에 달하는 바이오매스를 형성했습니다. 직접 작성한 코드는 전체의 ${hostPercent}%에 불과합니다.`,
    nakedHostComment: `이것이 당신이 직접 작성한 코드의 전부입니다. 나머지는 당신의 것이 아닙니다.`,
  }
}

export async function generateCreatureDesigns(result: AnalysisResult): Promise<GeminiResult> {
  if (!API_KEY) {
    console.warn('Gemini API key not found, using fallback designs')
    return {
      report: buildFallbackReport(result),
      creatures: buildFallbackCreatures(result),
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = buildPrompt(result)
    const response = await model.generateContent(prompt)
    const text = response.response.text()

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as GeminiResult

    if (!parsed.report || !parsed.creatures || !Array.isArray(parsed.creatures)) {
      throw new Error('Invalid Gemini response structure')
    }

    return parsed
  } catch (err) {
    console.warn('Gemini API failed, using fallback:', err)
    return {
      report: buildFallbackReport(result),
      creatures: buildFallbackCreatures(result),
    }
  }
}
