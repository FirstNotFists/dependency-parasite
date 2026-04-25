import { useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import type { AnalysisResult, Parasite } from '../../types'
import { MAX_DISPLAY_DEPS } from '../../constants/parasite'
import { SCENE_BG_COLOR, FOG_NEAR, FOG_FAR, CAMERA_DEFAULT_POS, CAMERA_FOV, AMBIENT_LIGHT_INTENSITY, DIR_LIGHT_INTENSITY, DIR_LIGHT_COLOR, DIR_LIGHT_POS, POINT_LIGHT_A_COLOR, POINT_LIGHT_A_INTENSITY, POINT_LIGHT_A_DISTANCE, POINT_LIGHT_A_POS, POINT_LIGHT_B_COLOR, POINT_LIGHT_B_INTENSITY, POINT_LIGHT_B_DISTANCE, POINT_LIGHT_B_POS, STAR_COUNT } from '../../constants/scene'
import { ORBIT_AUTO_ROTATE_SPEED, ORBIT_ROTATE_SPEED, ORBIT_DAMPING } from '../../constants/animation'
import DependencySwarm from './DependencySwarm'
import CameraController from './CameraController'

type ParasiteSceneProps = {
  result: AnalysisResult
  naked: boolean
  selectedParasite: Parasite | null
  onSelectParasite: (p: Parasite | null) => void
}

export default function ParasiteScene({ result, naked, selectedParasite, onSelectParasite }: ParasiteSceneProps) {
  const displayDeps = result.dependencies.slice(0, MAX_DISPLAY_DEPS)
  const orbitRef = useRef(null)

  const handleMissClick = useCallback(() => {
    if (selectedParasite) {
      document.body.style.cursor = 'auto'
      onSelectParasite(null)
    }
  }, [selectedParasite, onSelectParasite])

  return (
    <Canvas camera={{ position: CAMERA_DEFAULT_POS, fov: CAMERA_FOV }} dpr={[1, 2]} onPointerMissed={handleMissClick}>
      <color attach="background" args={[SCENE_BG_COLOR]} />
      <fog attach="fog" args={[SCENE_BG_COLOR, FOG_NEAR, FOG_FAR]} />
      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
      <directionalLight position={DIR_LIGHT_POS} intensity={DIR_LIGHT_INTENSITY} color={DIR_LIGHT_COLOR} />
      <pointLight position={POINT_LIGHT_A_POS} color={POINT_LIGHT_A_COLOR} intensity={POINT_LIGHT_A_INTENSITY} distance={POINT_LIGHT_A_DISTANCE} />
      <pointLight position={POINT_LIGHT_B_POS} color={POINT_LIGHT_B_COLOR} intensity={POINT_LIGHT_B_INTENSITY} distance={POINT_LIGHT_B_DISTANCE} />
      <Stars radius={70} depth={45} count={STAR_COUNT} factor={2} saturation={0.2} fade speed={0.4} />
      <DependencySwarm deps={displayDeps} hostRatio={result.hostProfile.hostRatio} naked={naked} creatureDesigns={result.gemini?.creatures} selectedParasite={selectedParasite} onSelectParasite={onSelectParasite} />
      <CameraController target={selectedParasite} orbitRef={orbitRef} />
      <OrbitControls ref={orbitRef} enablePan={false} enableDamping dampingFactor={ORBIT_DAMPING} minDistance={3} maxDistance={12} autoRotate={!selectedParasite} autoRotateSpeed={ORBIT_AUTO_ROTATE_SPEED} rotateSpeed={ORBIT_ROTATE_SPEED} />
    </Canvas>
  )
}
