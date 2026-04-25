import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'
import type { Parasite } from '../../types'
import { INSPECT_SPEED_FACTOR, SELECTED_SPEED_FACTOR, HIGHLIGHT_RING_PULSE_SPEED, HIGHLIGHT_RING_PULSE_AMP, HIGHLIGHT_LIGHT_INTENSITY, HIGHLIGHT_LIGHT_DISTANCE } from '../../constants/animation'
import { useCreatureMotion } from '../../hooks/useCreatureMotion'
import { useDragClick } from '../../hooks/useDragClick'
import BodyGeometry from './BodyGeometry'
import Appendages from './Appendages'

export default function CreatureRenderer({
  parasite, inspecting, isSelected, onSelect,
}: {
  parasite: Parasite; inspecting: boolean; isSelected: boolean; onSelect: (p: Parasite) => void
}) {
  const { shape, color, seed, size } = parasite
  const speedFactor = isSelected ? SELECTED_SPEED_FACTOR : inspecting ? INSPECT_SPEED_FACTOR : 1
  const groupRef = useCreatureMotion(parasite, speedFactor)
  const dragClick = useDragClick(onSelect, parasite)

  // Selection highlight animation
  const highlightRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (highlightRef.current && isSelected) {
      highlightRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * HIGHLIGHT_RING_PULSE_SPEED) * HIGHLIGHT_RING_PULSE_AMP)
      highlightRef.current.rotation.y = clock.elapsedTime * 0.5
    }
  })

  const selectionHighlight = isSelected ? (
    <group ref={highlightRef}>
      <Sphere args={[size * 3.5, 12, 12]}>
        <meshBasicMaterial color={color.emissive} transparent opacity={0.08} depthWrite={false} />
      </Sphere>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[size * 3, 0.03, 8, 32]} /><meshBasicMaterial color={color.emissive} transparent opacity={0.7} /></mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}><torusGeometry args={[size * 3.4, 0.02, 8, 32]} /><meshBasicMaterial color={color.emissive} transparent opacity={0.35} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[size * 2.8, 0.015, 8, 32]} /><meshBasicMaterial color={color.emissive} transparent opacity={0.25} /></mesh>
      <pointLight color={color.emissive} intensity={HIGHLIGHT_LIGHT_INTENSITY} distance={HIGHLIGHT_LIGHT_DISTANCE} />
    </group>
  ) : null

  const hitArea = (
    <mesh {...dragClick}>
      <sphereGeometry args={[size * 2.5, 8, 8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )

  if (shape.segments > 1) {
    const segCount = Math.min(shape.segments, 8)
    return (
      <group ref={groupRef} position={parasite.position}>
        {hitArea}
        {selectionHighlight}
        {Array.from({ length: segCount }).map((_, i) => {
          const off = i - segCount / 2
          return <group key={i} position={[off * size * 0.55 * shape.aspectRatio[0], Math.sin(i * 0.8 + seed) * size * 0.2, Math.cos(i * 0.65 + seed) * size * 0.15]}><BodyGeometry shape={shape} size={size * (1 - Math.abs(off) / segCount * 0.4)} color={color} /></group>
        })}
        <Appendages shape={shape} size={size} color={color} />
      </group>
    )
  }

  return (
    <group ref={groupRef} position={parasite.position}>
      {hitArea}
      {selectionHighlight}
      <BodyGeometry shape={shape} size={size * 1.2} color={color} />
      <Appendages shape={shape} size={size} color={color} />
    </group>
  )
}
