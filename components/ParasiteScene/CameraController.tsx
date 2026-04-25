import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Parasite } from '../../types'
import { CAMERA_DEFAULT_POS, CAMERA_LERP_SPEED, CAMERA_ARRIVE_THRESHOLD, CAMERA_TARGET_DISTANCE } from '../../constants/scene'

export default function CameraController({
  target,
  orbitRef,
}: {
  target: Parasite | null
  orbitRef: React.RefObject<THREE.Object3D | null>
}) {
  const { camera } = useThree()
  const defaultPos = useMemo(() => new THREE.Vector3(...CAMERA_DEFAULT_POS), [])
  const goalPos = useRef(new THREE.Vector3())
  const goalLookAt = useRef(new THREE.Vector3())
  const active = useRef(false)

  useFrame(() => {
    const orbit = orbitRef.current as unknown as { enabled: boolean; target: THREE.Vector3; update: () => void } | null

    if (target) {
      const [x, y, z] = target.position
      const creaturePos = new THREE.Vector3(x, y, z)
      const dir = creaturePos.clone().normalize()
      goalPos.current.copy(creaturePos).add(dir.multiplyScalar(CAMERA_TARGET_DISTANCE)).add(new THREE.Vector3(0, 0.1, 0))
      goalLookAt.current.set(x, y, z)

      const dist = camera.position.distanceTo(goalPos.current)
      if (dist > CAMERA_ARRIVE_THRESHOLD) {
        camera.position.lerp(goalPos.current, CAMERA_LERP_SPEED)
        const currentLookAt = new THREE.Vector3()
        camera.getWorldDirection(currentLookAt)
        const targetDir = goalLookAt.current.clone().sub(camera.position).normalize()
        currentLookAt.lerp(targetDir, CAMERA_LERP_SPEED)
        camera.lookAt(camera.position.clone().add(currentLookAt))
      } else {
        camera.position.copy(goalPos.current)
        camera.lookAt(goalLookAt.current)
      }

      if (orbit) orbit.enabled = false
      active.current = true
    } else if (active.current) {
      camera.position.lerp(defaultPos, 0.05)
      camera.lookAt(0, 0, 0)

      if (camera.position.distanceTo(defaultPos) < 0.3) {
        active.current = false
        if (orbit) {
          orbit.enabled = true
          orbit.target.set(0, 0, 0)
          orbit.update()
        }
      }
    }
  })

  return null
}
