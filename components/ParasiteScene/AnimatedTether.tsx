import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Parasite } from '../../types'
import { TETHER_POINT_COUNT, TETHER_PARTICLE_COUNT, TETHER_PARTICLE_SPEED } from '../../constants/animation'

export default function AnimatedTether({ parasite, speedFactor }: { parasite: Parasite; speedFactor: number }) {
  const particleRefs = useRef<THREE.Mesh[]>([])

  const points = useMemo(() => {
    const [x, y, z] = parasite.position
    return Array.from({ length: TETHER_POINT_COUNT }).map((_, i) => {
      const p = i / (TETHER_POINT_COUNT - 1)
      const coil = Math.sin(p * Math.PI * 3 + parasite.seed) * 0.28 * (1 - p)
      return [x * p + Math.cos(parasite.seed) * coil, y * p + Math.sin(p * Math.PI * 2 + parasite.seed) * 0.15, z * p + Math.sin(parasite.seed) * coil] as [number, number, number]
    })
  }, [parasite])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speedFactor
    for (let i = 0; i < particleRefs.current.length; i++) {
      const mesh = particleRefs.current[i]
      if (!mesh) continue
      const progress = ((t * TETHER_PARTICLE_SPEED + i * 0.5 + parasite.seed) % 1)
      const idx = progress * (points.length - 1)
      const lo = Math.floor(idx)
      const hi = Math.min(lo + 1, points.length - 1)
      const frac = idx - lo
      mesh.position.set(
        points[lo][0] + (points[hi][0] - points[lo][0]) * frac,
        points[lo][1] + (points[hi][1] - points[lo][1]) * frac,
        points[lo][2] + (points[hi][2] - points[lo][2]) * frac,
      )
    }
  })

  return (
    <group>
      <Line points={points} color={parasite.color.emissive} lineWidth={1.5} transparent opacity={0.2} />
      {Array.from({ length: TETHER_PARTICLE_COUNT }).map((_, i) => (
        <mesh key={i} ref={(el: THREE.Mesh) => { particleRefs.current[i] = el }}>
          <sphereGeometry args={[0.018, 4, 4]} />
          <meshBasicMaterial color={parasite.color.emissive} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  )
}
