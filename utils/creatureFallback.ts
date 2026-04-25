import type { CreatureShape, CreatureColor, CreatureMotion, BodyType, AppendageType, MotionType } from '../types'
import { FALLBACK_PALETTES } from '../constants/colors'

export function hashString(str: string): number {
  return str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

const BODY_TYPES: BodyType[] = ['tapered', 'hooked', 'ellipsoid', 'capsule', 'torus', 'sphere']
const APPENDAGE_TYPES: AppendageType[] = ['tendril', 'fang', 'cone', 'ring', 'sphere', 'torus']
const SPREAD_TYPES = ['radial', 'linear', 'random'] as const
const MOTION_TYPES: MotionType[] = ['writhe', 'lurch', 'pulse', 'drift', 'orbit', 'flicker', 'breathe']

export function fallbackShape(name: string, index: number): CreatureShape {
  const h = hashString(name)
  return {
    body: BODY_TYPES[(h + index) % BODY_TYPES.length],
    segments: 1 + (h % 5),
    appendages: [{
      type: APPENDAGE_TYPES[(h * 3 + index) % APPENDAGE_TYPES.length],
      count: 2 + (h % 6),
      sizeRatio: 0.15 + (h % 25) / 100,
      spread: SPREAD_TYPES[(h * 7 + index) % SPREAD_TYPES.length],
    }],
    aspectRatio: [
      0.6 + (h % 10) / 10,
      0.7 + ((h * 3) % 12) / 10,
      0.6 + ((h * 5) % 8) / 10,
    ],
  }
}

export function fallbackColor(name: string, index: number): CreatureColor {
  const h = hashString(name)
  return FALLBACK_PALETTES[(h + index) % FALLBACK_PALETTES.length]
}

export function fallbackMotion(name: string, index: number): CreatureMotion {
  const h = hashString(name)
  return {
    primary: MOTION_TYPES[(h + index) % MOTION_TYPES.length],
    secondary: MOTION_TYPES[(h + index + 3) % MOTION_TYPES.length],
    speedMultiplier: 0.5 + (h % 8) / 10,
    amplitude: 0.4 + (h % 5) / 10,
  }
}

export function buildFallbackBioLabel(name: string, group: string, transitiveCount: number): string {
  const sizeClass = transitiveCount > 5 ? 'large' : transitiveCount > 0 ? 'medium' : 'small'
  const phylum = group === 'dependencies' ? 'Runtimea' : 'Instrumentalia'
  const domain = group === 'dependencies' ? 'core runtime' : 'dev toolchain'
  const transitive = transitiveCount > 0
    ? `Harbors ${transitiveCount} symbiotic sub-species forming an autonomous colony.`
    : 'A solitary life-form parasitizing the host directly.'

  return `Phylum ${phylum}, Class Modularis. A ${sizeClass} parasitic species embedded in the host's ${domain}. Secretes ${name} enzymes to restructure host metabolism. ${transitive} Extraction risks immediate functional degradation.`
}

export function buildFallbackCreatureName(name: string, group: string): string {
  return `${name.charAt(0).toUpperCase()}${name.slice(1, 5)}osaurus ${group === 'dependencies' ? 'Parasiticus' : 'Instrumentalis'}`
}
