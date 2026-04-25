import type { DependencyGroup } from '../types'

export const DEPENDENCY_GROUPS: DependencyGroup[] = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
export const PARASITE_FIELD_RADIUS = 3.8
export const WORM_SEGMENT_COUNT = 10
export const MAX_DISPLAY_DEPS = 60
export const PARTICLE_COUNT = 24
export const MAX_FALLBACK_CREATURES = 30
export const GITHUB_API_VERSION = '2022-11-28'

export const GROUP_COLORS: Record<string, string[]> = {
  dependencies: ['#00e5ff', '#39ff88', '#61dafb'],
  devDependencies: ['#ff4df3', '#ff7a18', '#f6ff00'],
  peerDependencies: ['#a7ff12', '#76ff20'],
  optionalDependencies: ['#ffd86b', '#ffb000'],
}

export const SEVERITY_COLORS: Record<string, string> = {
  Symbiotic: '#39ff88',
  Colonized: '#f6ff00',
  Consumed: '#ff7a18',
  'Hollow Shell': '#ff4d4d',
}
