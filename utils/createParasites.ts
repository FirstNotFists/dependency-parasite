import type { Parasite, Dependency, CreatureDesign } from '../types'
import { GOLDEN_ANGLE, PARASITE_FIELD_RADIUS } from '../constants/parasite'
import { fallbackShape, fallbackColor, fallbackMotion, buildFallbackBioLabel, buildFallbackCreatureName } from './creatureFallback'

export function createParasites(
  deps: Dependency[],
  creatureDesigns: CreatureDesign[] | undefined,
): Parasite[] {
  if (deps.length === 0) return []

  const designMap = new Map<string, CreatureDesign>()
  if (creatureDesigns) {
    for (const c of creatureDesigns) designMap.set(c.name, c)
  }

  return deps.map((dep, index) => {
    const count = deps.length
    const normalizedY = count > 1 ? 1 - (index / (count - 1)) * 2 : 0
    const orbitRadius = count > 1 ? Math.sqrt(1 - normalizedY * normalizedY) : 1
    const theta = GOLDEN_ANGLE * index
    const ringNoise = 0.74 + (index % 7) * 0.06
    const size = Math.min(0.14 + Math.min(dep.transitiveCount, 30) * 0.012, 0.55)
    const design = designMap.get(dep.name)

    return {
      name: dep.name,
      creatureName: design?.creatureName ?? buildFallbackCreatureName(dep.name, dep.group),
      seed: index * 0.71 + dep.name.length * 0.13,
      size,
      position: [
        Math.cos(theta) * orbitRadius * PARASITE_FIELD_RADIUS * ringNoise,
        normalizedY * PARASITE_FIELD_RADIUS * 0.9,
        Math.sin(theta) * orbitRadius * PARASITE_FIELD_RADIUS * ringNoise,
      ] as [number, number, number],
      transitiveCount: dep.transitiveCount,
      group: dep.group,
      shape: design?.shape ?? fallbackShape(dep.name, index),
      color: design?.color ?? fallbackColor(dep.name, index),
      motion: design?.motion ?? fallbackMotion(dep.name, index),
      bioLabel: design?.bioLabel ?? buildFallbackBioLabel(dep.name, dep.group, dep.transitiveCount),
    }
  })
}
