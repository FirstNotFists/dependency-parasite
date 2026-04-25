import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { HOST_PULSE_SPEED, HOST_PULSE_AMP } from '../../constants/animation'

export default function HostNucleus({ hostRatio }: { hostRatio: number }) {
  const hostRef = useRef<THREE.Mesh>(null)
  const radius = 0.08 + hostRatio * 0.6

  useFrame(({ clock }) => {
    if (hostRef.current) {
      hostRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * HOST_PULSE_SPEED) * HOST_PULSE_AMP)
    }
  })

  return (
    <group>
      <Sphere ref={hostRef} args={[radius, 24, 24]}>
        <meshStandardMaterial color="#ffd86b" emissive="#ffb000" emissiveIntensity={2.7} metalness={0.18} roughness={0.12} />
      </Sphere>
      <Sphere args={[radius * 1.8, 16, 16]}>
        <meshBasicMaterial color="#ffcf4a" transparent opacity={0.08} />
      </Sphere>
      <pointLight color="#ffd86b" intensity={65} distance={4.4} />
    </group>
  )
}
