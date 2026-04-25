import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Parasite } from '../types'

export function useCreatureMotion(
  parasite: Parasite,
  speedFactor: number,
) {
  const groupRef = useRef<THREE.Group>(null)
  const { motion, seed, position: pos } = parasite

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const spd = motion.speedMultiplier * speedFactor
    const amp = motion.amplitude * speedFactor
    const [x, y, z] = pos

    // Position
    const bite = 0.82 + Math.sin(t * 1.8 * spd + seed) * 0.09
    let px = x * bite + Math.sin(t * 2.5 * spd + seed) * 0.06 * amp
    let py = y * bite + Math.cos(t * 2.2 * spd + seed) * 0.05 * amp
    let pz = z * bite + Math.sin(t * 2.9 * spd + seed) * 0.06 * amp

    // Lurch
    if (motion.primary === 'lurch' || motion.secondary === 'lurch') {
      const cycle = (t * spd + seed) % (Math.PI * 2)
      const lunge = cycle < 1.0 ? Math.sin(cycle * Math.PI) * 0.18 * amp : 0
      const len = Math.sqrt(x * x + y * y + z * z) || 1
      px -= (x / len) * lunge
      py -= (y / len) * lunge
      pz -= (z / len) * lunge
    }
    groupRef.current.position.set(px, py, pz)

    // Rotation
    groupRef.current.rotation.y = (motion.primary === 'orbit' || motion.secondary === 'orbit')
      ? t * 0.5 * spd + seed
      : t * 0.2 * spd + seed

    if (motion.primary === 'writhe' || motion.secondary === 'writhe') {
      const jerk = Math.sin(t * 4.5 * spd + seed) > 0.7 ? 0.25 * amp : 0
      groupRef.current.rotation.x = Math.sin(t * 1.2 * spd + seed) * 0.8 * amp + jerk
      groupRef.current.rotation.z = Math.cos(t * 0.9 * spd + seed) * 0.6 * amp + jerk * 0.4
    } else {
      groupRef.current.rotation.x = Math.sin(t * 0.5 * spd + seed) * 0.3 * amp
      groupRef.current.rotation.z = Math.cos(t * 0.4 * spd + seed) * 0.2 * amp
    }

    // Scale
    if (motion.primary === 'pulse' || motion.secondary === 'pulse') {
      groupRef.current.scale.setScalar(1 + Math.sin(t * 3 * spd + seed) * 0.12 * amp)
    } else if (motion.primary === 'breathe' || motion.secondary === 'breathe') {
      groupRef.current.scale.setScalar(1 + Math.sin(t * 1.2 * spd + seed) * 0.06 * amp)
    }
  })

  return groupRef
}
