import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Dependency, CreatureDesign, Parasite } from '../../types'
import { SWARM_ROTATION_SPEED, SWARM_ROTATION_X_AMP, SWARM_ROTATION_Z_AMP } from '../../constants/animation'
import { createParasites } from '../../utils/createParasites'
import HostNucleus from './HostNucleus'
import AnimatedTether from './AnimatedTether'
import CreatureRenderer from './CreatureRenderer'

export default function DependencySwarm({
  deps, hostRatio, naked, creatureDesigns, selectedParasite, onSelectParasite,
}: {
  deps: Dependency[]; hostRatio: number; naked: boolean; creatureDesigns: CreatureDesign[] | undefined
  selectedParasite: Parasite | null; onSelectParasite: (p: Parasite | null) => void
}) {
  const swarmRef = useRef<THREE.Group>(null)
  const parasites = useMemo(() => createParasites(deps, creatureDesigns), [deps, creatureDesigns])
  const inspecting = selectedParasite !== null
  const frozenRot = useRef<{ y: number; x: number; z: number } | null>(null)

  useFrame(({ clock }) => {
    if (!swarmRef.current) return
    const t = clock.elapsedTime

    if (inspecting) {
      if (!frozenRot.current) {
        frozenRot.current = {
          y: swarmRef.current.rotation.y,
          x: swarmRef.current.rotation.x,
          z: swarmRef.current.rotation.z,
        }
      }
      swarmRef.current.rotation.y = frozenRot.current.y
      swarmRef.current.rotation.x = frozenRot.current.x
      swarmRef.current.rotation.z = frozenRot.current.z
    } else {
      frozenRot.current = null
      swarmRef.current.rotation.y = t * SWARM_ROTATION_SPEED
      swarmRef.current.rotation.x = Math.sin(t * 0.23) * SWARM_ROTATION_X_AMP
      swarmRef.current.rotation.z = Math.cos(t * 0.19) * SWARM_ROTATION_Z_AMP
    }
  })

  return (
    <group ref={swarmRef} rotation={[0.1, -0.35, -0.04]}>
      <HostNucleus hostRatio={hostRatio} />
      {!naked && (
        <>
          {parasites.map((p, i) => <AnimatedTether key={`t-${i}`} parasite={p} speedFactor={inspecting ? 0.2 : 1} />)}
          {parasites.map((p, i) => <CreatureRenderer key={`c-${i}`} parasite={p} inspecting={inspecting} isSelected={selectedParasite?.name === p.name} onSelect={onSelectParasite} />)}
        </>
      )}
    </group>
  )
}
