export type DependencyGroup =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies'

export type Dependency = {
  name: string
  versionRange: string
  group: DependencyGroup
  transitiveCount: number
  unpackedSize: number | null
}

export type InfestationSeverity = 'Symbiotic' | 'Colonized' | 'Consumed' | 'Hollow Shell'

export type HostProfile = {
  languages: Record<string, number>
  totalCodeBytes: number
  estimatedExternalBytes: number
  hostRatio: number
}

export type AnalysisResult = {
  repository: string
  packageName: string
  dependencies: Dependency[]
  directDependencyCount: number
  transitiveDependencyCount: number
  totalParasiteCount: number
  dependencyAmplification: number
  hostProfile: HostProfile
  infestationSeverity: InfestationSeverity
  gemini?: GeminiResult
}

// Gemini가 생성하는 기생체 형태 파라미터
export type BodyType = 'sphere' | 'ellipsoid' | 'torus' | 'capsule' | 'tapered' | 'hooked'
export type AppendageType = 'cone' | 'ring' | 'sphere' | 'torus' | 'tendril' | 'fang'
export type SpreadType = 'radial' | 'linear' | 'random'
export type MotionType = 'pulse' | 'drift' | 'writhe' | 'bloom' | 'orbit' | 'breathe' | 'flicker' | 'lurch'

export type CreatureShape = {
  body: BodyType
  segments: number
  appendages: {
    type: AppendageType
    count: number
    sizeRatio: number
    spread: SpreadType
  }[]
  aspectRatio: [number, number, number]
}

export type CreatureColor = {
  primary: string
  secondary: string
  emissive: string
  emissiveIntensity: number
}

export type CreatureMotion = {
  primary: MotionType
  secondary: MotionType
  tertiary?: MotionType
  speedMultiplier: number
  amplitude: number
}

export type CreatureDesign = {
  name: string
  creatureName: string
  shape: CreatureShape
  color: CreatureColor
  motion: CreatureMotion
  bioLabel: string
}

export type GeminiReport = {
  speciesName: string
  dangerLevel: string
  hostIntegrity: string
  bioReport: string
  nakedHostComment: string
}

export type GeminiResult = {
  report: GeminiReport
  creatures: CreatureDesign[]
}

export type Parasite = {
  name: string
  creatureName: string
  seed: number
  size: number
  position: [number, number, number]
  transitiveCount: number
  group: DependencyGroup
  shape: CreatureShape
  color: CreatureColor
  motion: CreatureMotion
  bioLabel: string
}

export type AppPhase = 'landing' | 'loading' | 'result' | 'error'

export type LoadingStep =
  | 'fetch-package'
  | 'fetch-languages'
  | 'fetch-registry'
  | 'generating-creatures'
  | 'analyzing'
