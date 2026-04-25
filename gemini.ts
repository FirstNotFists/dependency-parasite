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
    "speciesName": "a creative Latin-style species name for this project's parasite colony",
    "dangerLevel": "${result.infestationSeverity}",
    "hostIntegrity": "X% / a witty Korean comment about the host's state",
    "bioReport": "2-3 sentences in Korean. A darkly humorous biological specimen report about this project. Reference specific dependency names and the host ratio. Written like an Ig Nobel Prize paper.",
    "nakedHostComment": "1 sentence in Korean. What to display when all parasites are removed and only the tiny host remains. Should be emotionally impactful."
  },
  "creatures": [
    ${depsForCreatures
      .map(
        (d) => `{
      "name": "${d.name}",
      "creatureName": "Creative Latin-style creature name",
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
      "bioLabel": "1 sentence in Korean describing this parasite's behavior"
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
- The bioLabel should reference what the package actually does, but described as parasitic behavior in Korean`
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
      creatureName: `Parasitus ${dep.name.charAt(0).toUpperCase()}${dep.name.slice(1, 4)}ensis`,
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
      bioLabel: `${dep.name}에 의존하는 기생체. ${dep.transitiveCount}개의 하위 종을 거느린다.`,
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
