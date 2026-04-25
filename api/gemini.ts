import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.GEMINI_API_KEY ?? ''

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' })
  }

  try {
    const body = req.body
    const prompt = buildPrompt(body)

    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const response = await model.generateContent(prompt)
    const text = response.response.text()

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!parsed.report || !parsed.creatures || !Array.isArray(parsed.creatures)) {
      return res.status(500).json({ error: 'Invalid Gemini response structure' })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Gemini API error:', err)
    return res.status(500).json({ error: 'Gemini generation failed' })
  }
}

interface AnalysisInput {
  repository: string
  packageName: string
  hostProfile: { totalCodeBytes: number; hostRatio: number }
  directDependencyCount: number
  transitiveDependencyCount: number
  dependencyAmplification: number
  infestationSeverity: string
  dependencies: { name: string; group: string; transitiveCount: number }[]
}

function buildPrompt(result: AnalysisInput): string {
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
      "bioLabel": "4-5 sentences in Korean. Write like a detailed field observation entry from a parasitology research journal. Structure: (1) morphological traits and taxonomic position. (2) parasitic mechanism — how it infiltrates and exploits the host, translating the package's real function into biological terms. (3) host dependency — what happens if this species is removed. (4) ecological role — its status in the dependency ecosystem and relationships with other species. Be specific, scholarly, and darkly poetic."
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
- The bioLabel MUST be 4-5 sentences, written like a parasitology journal entry.
- The creatureName must sound like a real binomial nomenclature (Genus Species).
- The speciesName for the colony should reflect the project's dominant ecosystem.`
}
