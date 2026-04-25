import { useMemo, useRef, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, OrbitControls, Sphere, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { Parasite, Dependency, AnalysisResult, CreatureDesign, CreatureShape, CreatureColor, CreatureMotion } from '../../types'
import {
  GOLDEN_ANGLE,
  PARASITE_FIELD_RADIUS,
  MAX_DISPLAY_DEPS,
} from '../../constants/parasite'

// --- Fallback creature generation ---

function hashString(str: string): number {
  return str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

function fallbackShape(name: string, index: number): CreatureShape {
  const h = hashString(name)
  const bodies = ['tapered', 'hooked', 'ellipsoid', 'capsule', 'torus', 'sphere'] as const
  const appTypes = ['tendril', 'fang', 'cone', 'ring', 'sphere', 'torus'] as const
  const spreads = ['radial', 'linear', 'random'] as const
  return {
    body: bodies[(h + index) % bodies.length],
    segments: 1 + (h % 5),
    appendages: [{ type: appTypes[(h * 3 + index) % appTypes.length], count: 2 + (h % 6), sizeRatio: 0.15 + (h % 25) / 100, spread: spreads[(h * 7 + index) % spreads.length] }],
    aspectRatio: [0.6 + (h % 10) / 10, 0.7 + ((h * 3) % 12) / 10, 0.6 + ((h * 5) % 8) / 10],
  }
}

function fallbackColor(name: string, index: number): CreatureColor {
  const palettes: CreatureColor[] = [
    { primary: '#1a3a2a', secondary: '#0d1f15', emissive: '#00ff88', emissiveIntensity: 0.7 },
    { primary: '#2a1a3a', secondary: '#150d1f', emissive: '#bf00ff', emissiveIntensity: 0.6 },
    { primary: '#3a1a1a', secondary: '#1f0d0d', emissive: '#ff4400', emissiveIntensity: 0.5 },
    { primary: '#1a2a3a', secondary: '#0d151f', emissive: '#00ccff', emissiveIntensity: 0.6 },
    { primary: '#2a2a1a', secondary: '#1f1f0d', emissive: '#ccff00', emissiveIntensity: 0.5 },
    { primary: '#1a3a3a', secondary: '#0d1f1f', emissive: '#00ffcc', emissiveIntensity: 0.6 },
    { primary: '#3a1a2a', secondary: '#1f0d15', emissive: '#ff0088', emissiveIntensity: 0.6 },
    { primary: '#2a3a1a', secondary: '#151f0d', emissive: '#88ff00', emissiveIntensity: 0.5 },
  ]
  return palettes[(hashString(name) + index) % palettes.length]
}

function fallbackMotion(name: string, index: number): CreatureMotion {
  const motions = ['writhe', 'lurch', 'pulse', 'drift', 'orbit', 'flicker', 'breathe'] as const
  const h = hashString(name)
  return { primary: motions[(h + index) % motions.length], secondary: motions[(h + index + 3) % motions.length], speedMultiplier: 0.5 + (h % 8) / 10, amplitude: 0.4 + (h % 5) / 10 }
}

function createParasites(deps: Dependency[], creatureDesigns: CreatureDesign[] | undefined): Parasite[] {
  if (deps.length === 0) return []
  const designMap = new Map<string, CreatureDesign>()
  if (creatureDesigns) for (const c of creatureDesigns) designMap.set(c.name, c)

  return deps.map((dep, index) => {
    const count = deps.length
    const normalizedY = count > 1 ? 1 - (index / (count - 1)) * 2 : 0
    const orbitRadius = count > 1 ? Math.sqrt(1 - normalizedY * normalizedY) : 1
    const theta = GOLDEN_ANGLE * index
    const ringNoise = 0.74 + (index % 7) * 0.06
    const size = Math.min(0.14 + Math.min(dep.transitiveCount, 30) * 0.012, 0.55)
    const design = designMap.get(dep.name)
    return {
      name: dep.name, creatureName: design?.creatureName ?? dep.name,
      seed: index * 0.71 + dep.name.length * 0.13, size,
      position: [Math.cos(theta) * orbitRadius * PARASITE_FIELD_RADIUS * ringNoise, normalizedY * PARASITE_FIELD_RADIUS * 0.9, Math.sin(theta) * orbitRadius * PARASITE_FIELD_RADIUS * ringNoise] as [number, number, number],
      transitiveCount: dep.transitiveCount, group: dep.group,
      shape: design?.shape ?? fallbackShape(dep.name, index),
      color: design?.color ?? fallbackColor(dep.name, index),
      motion: design?.motion ?? fallbackMotion(dep.name, index),
      bioLabel: design?.bioLabel ?? `문(門) ${dep.group === 'dependencies' ? 'Runtimea' : 'Instrumentalia'}에 속하는 ${dep.transitiveCount > 5 ? '대형' : dep.transitiveCount > 0 ? '중형' : '소형'} 기생종. 숙주의 ${dep.group === 'dependencies' ? '핵심 실행 환경' : '개발 도구 체계'}에 침투하여 ${dep.name} 효소를 분비하며 숙주의 대사 경로를 재편한다. ${dep.transitiveCount > 0 ? `${dep.transitiveCount}개의 하위 공생체를 거느리며 독자적 군락을 형성한다.` : '단독 생활형으로 숙주에 직접 기생한다.'} 본 종 적출 시 해당 기능 영역의 즉각적 기능 저하가 예상된다.`,
    }
  })
}

// --- 3D Components ---

const DRAG_THRESHOLD = 6

function HostNucleus({ hostRatio }: { hostRatio: number }) {
  const hostRef = useRef<THREE.Mesh>(null)
  const radius = 0.08 + hostRatio * 0.6
  useFrame(({ clock }) => {
    if (hostRef.current) hostRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 6.4) * 0.11)
  })
  return (
    <group>
      <Sphere ref={hostRef} args={[radius, 24, 24]}>
        <meshStandardMaterial color="#ffd86b" emissive="#ffb000" emissiveIntensity={2.7} metalness={0.18} roughness={0.12} />
      </Sphere>
      <Sphere args={[radius * 1.8, 16, 16]}><meshBasicMaterial color="#ffcf4a" transparent opacity={0.08} /></Sphere>
      <pointLight color="#ffd86b" intensity={65} distance={4.4} />
    </group>
  )
}

function BodyGeometry({ shape, size, color }: { shape: CreatureShape; size: number; color: CreatureColor }) {
  const [ax, ay, az] = shape.aspectRatio
  const mat = <meshStandardMaterial color={color.primary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity} roughness={0.75} />
  if (shape.body === 'tapered') return <group scale={[ax, ay, az]}><mesh><capsuleGeometry args={[size * 0.3, size * 0.9, 4, 8]} />{mat}</mesh><mesh position={[0, size * 0.55, 0]} scale={[1.4, 0.6, 1.4]}><sphereGeometry args={[size * 0.35, 8, 8]} />{mat}</mesh></group>
  if (shape.body === 'hooked') return <group scale={[ax, ay, az]}><Sphere args={[size, 8, 8]} scale={[1, 0.7, 0.8]}>{mat}</Sphere><mesh position={[size * 0.6, size * 0.3, 0]} rotation={[0, 0, -Math.PI * 0.4]}><coneGeometry args={[size * 0.15, size * 0.9, 5]} /><meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 1.3} roughness={0.6} /></mesh></group>
  if (shape.body === 'torus') return <mesh scale={[ax, ay, az]}><torusGeometry args={[size * 0.8, size * 0.3, 8, 16]} />{mat}</mesh>
  if (shape.body === 'capsule') return <mesh scale={[ax * 0.6, ay * 1.4, az * 0.6]}><capsuleGeometry args={[size * 0.4, size * 0.8, 4, 8]} />{mat}</mesh>
  if (shape.body === 'ellipsoid') return <Sphere args={[size, 10, 10]} scale={[ax, ay * 1.3, az * 0.8]}>{mat}</Sphere>
  return <Sphere args={[size, 10, 10]} scale={[ax, ay, az]}>{mat}</Sphere>
}

function Appendages({ shape, size, color }: { shape: CreatureShape; size: number; color: CreatureColor }) {
  return (
    <>
      {shape.appendages.map((app, appIdx) =>
        Array.from({ length: app.count }).map((_, i) => {
          const angle = app.spread === 'radial' ? (i / app.count) * Math.PI * 2 : app.spread === 'linear' ? ((i / (app.count - 1 || 1)) - 0.5) * Math.PI : (i * 2.39996)
          const dist = size * (0.8 + appIdx * 0.2)
          const appSize = size * app.sizeRatio
          const pos: [number, number, number] = [Math.cos(angle) * dist, Math.sin(angle * 1.3 + appIdx) * size * 0.4, Math.sin(angle) * dist]
          if (app.type === 'tendril') return <group key={`${appIdx}-${i}`} position={pos}>{[0, 1, 2].map(seg => <mesh key={seg} position={[seg * appSize * 0.7, seg * appSize * 0.35, seg * appSize * 0.15]} rotation={[0, 0, Math.PI * 0.18 * seg]}><coneGeometry args={[appSize * (0.25 - seg * 0.05), appSize * 0.8, 4]} /><meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * (1.3 - seg * 0.2)} /></mesh>)}</group>
          if (app.type === 'fang') return <mesh key={`${appIdx}-${i}`} position={pos} rotation={[angle * 0.5, 0, Math.PI * 0.5 + angle * 0.3]}><coneGeometry args={[appSize * 0.1, appSize * 2.8, 3]} /><meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 1.5} roughness={0.4} /></mesh>
          if (app.type === 'cone') return <mesh key={`${appIdx}-${i}`} position={pos} rotation={[angle, 0, Math.PI * 0.3]}><coneGeometry args={[appSize * 0.4, appSize * 2, 5]} /><meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 1.2} /></mesh>
          if (app.type === 'ring') return <mesh key={`${appIdx}-${i}`} position={pos} rotation={[i * 0.5, angle, 0]}><torusGeometry args={[appSize * 1.2, appSize * 0.2, 6, 12]} /><meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity} /></mesh>
          if (app.type === 'torus') return <mesh key={`${appIdx}-${i}`} position={pos}><torusGeometry args={[appSize * 0.8, appSize * 0.25, 6, 10]} /><meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 0.8} /></mesh>
          return <Sphere key={`${appIdx}-${i}`} args={[appSize, 6, 6]} position={pos}><meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 1.1} /></Sphere>
        }),
      )}
    </>
  )
}

function CreatureRenderer({
  parasite, inspecting, isSelected, onSelect,
}: {
  parasite: Parasite; inspecting: boolean; isSelected: boolean; onSelect: (p: Parasite) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const pointerStart = useRef({ x: 0, y: 0 })
  const { shape, color, motion, seed, size } = parasite

  // Never fully stop — just slow down when inspecting another creature
  const speedFactor = isSelected ? 0.3 : inspecting ? 0.15 : 1

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const spd = motion.speedMultiplier * speedFactor
    const amp = motion.amplitude * speedFactor
    const [x, y, z] = parasite.position

    const bite = 0.82 + Math.sin(t * 1.8 * spd + seed) * 0.09
    let px = x * bite + Math.sin(t * 2.5 * spd + seed) * 0.06 * amp
    let py = y * bite + Math.cos(t * 2.2 * spd + seed) * 0.05 * amp
    let pz = z * bite + Math.sin(t * 2.9 * spd + seed) * 0.06 * amp

    if (motion.primary === 'lurch' || motion.secondary === 'lurch') {
      const cycle = (t * spd + seed) % (Math.PI * 2)
      const lunge = cycle < 1.0 ? Math.sin(cycle * Math.PI) * 0.18 * amp : 0
      const len = Math.sqrt(x * x + y * y + z * z) || 1
      px -= (x / len) * lunge; py -= (y / len) * lunge; pz -= (z / len) * lunge
    }
    groupRef.current.position.set(px, py, pz)

    groupRef.current.rotation.y = (motion.primary === 'orbit' || motion.secondary === 'orbit') ? t * 0.5 * spd + seed : t * 0.2 * spd + seed
    if (motion.primary === 'writhe' || motion.secondary === 'writhe') {
      const jerk = Math.sin(t * 4.5 * spd + seed) > 0.7 ? 0.25 * amp : 0
      groupRef.current.rotation.x = Math.sin(t * 1.2 * spd + seed) * 0.8 * amp + jerk
      groupRef.current.rotation.z = Math.cos(t * 0.9 * spd + seed) * 0.6 * amp + jerk * 0.4
    } else {
      groupRef.current.rotation.x = Math.sin(t * 0.5 * spd + seed) * 0.3 * amp
      groupRef.current.rotation.z = Math.cos(t * 0.4 * spd + seed) * 0.2 * amp
    }
    if (motion.primary === 'pulse' || motion.secondary === 'pulse') groupRef.current.scale.setScalar(1 + Math.sin(t * 3 * spd + seed) * 0.12 * amp)
    else if (motion.primary === 'breathe' || motion.secondary === 'breathe') groupRef.current.scale.setScalar(1 + Math.sin(t * 1.2 * spd + seed) * 0.06 * amp)
  })

  // Drag vs click: record pointer position on down, compare on click
  const handlePointerDown = useCallback((e: { clientX: number; clientY: number }) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleClick = useCallback((e: { stopPropagation: () => void; clientX: number; clientY: number }) => {
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) return // was a drag
    e.stopPropagation()
    onSelect(parasite)
  }, [parasite, onSelect])

  const hitArea = (
    <mesh
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <sphereGeometry args={[size * 2.5, 8, 8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )

  // Selection highlight: strong glow aura + pulsing rings + light
  const highlightRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (highlightRef.current && isSelected) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.15
      highlightRef.current.scale.setScalar(pulse)
      highlightRef.current.rotation.y = clock.elapsedTime * 0.5
    }
  })

  const selectionHighlight = isSelected ? (
    <group ref={highlightRef}>
      {/* Outer glow sphere */}
      <Sphere args={[size * 3.5, 12, 12]}>
        <meshBasicMaterial color={color.emissive} transparent opacity={0.08} depthWrite={false} />
      </Sphere>
      {/* Primary ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 3, 0.03, 8, 32]} />
        <meshBasicMaterial color={color.emissive} transparent opacity={0.7} />
      </mesh>
      {/* Secondary ring (tilted) */}
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[size * 3.4, 0.02, 8, 32]} />
        <meshBasicMaterial color={color.emissive} transparent opacity={0.35} />
      </mesh>
      {/* Third ring (perpendicular) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[size * 2.8, 0.015, 8, 32]} />
        <meshBasicMaterial color={color.emissive} transparent opacity={0.25} />
      </mesh>
      <pointLight color={color.emissive} intensity={12} distance={4} />
    </group>
  ) : null

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

function AnimatedTether({ parasite, speedFactor }: { parasite: Parasite; speedFactor: number }) {
  const particleRefs = useRef<THREE.Mesh[]>([])
  const points = useMemo(() => {
    const [x, y, z] = parasite.position
    return Array.from({ length: 8 }).map((_, i) => {
      const p = i / 7
      const coil = Math.sin(p * Math.PI * 3 + parasite.seed) * 0.28 * (1 - p)
      return [x * p + Math.cos(parasite.seed) * coil, y * p + Math.sin(p * Math.PI * 2 + parasite.seed) * 0.15, z * p + Math.sin(parasite.seed) * coil] as [number, number, number]
    })
  }, [parasite])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speedFactor
    for (let i = 0; i < particleRefs.current.length; i++) {
      const mesh = particleRefs.current[i]
      if (!mesh) continue
      const progress = ((t * 0.35 + i * 0.5 + parasite.seed) % 1)
      const idx = progress * (points.length - 1)
      const lo = Math.floor(idx), hi = Math.min(lo + 1, points.length - 1), frac = idx - lo
      mesh.position.set(points[lo][0] + (points[hi][0] - points[lo][0]) * frac, points[lo][1] + (points[hi][1] - points[lo][1]) * frac, points[lo][2] + (points[hi][2] - points[lo][2]) * frac)
    }
  })

  return (
    <group>
      <Line points={points} color={parasite.color.emissive} lineWidth={1.5} transparent opacity={0.2} />
      {[0, 1].map(i => <mesh key={i} ref={(el: THREE.Mesh) => { particleRefs.current[i] = el }}><sphereGeometry args={[0.018, 4, 4]} /><meshBasicMaterial color={parasite.color.emissive} transparent opacity={0.5} /></mesh>)}
    </group>
  )
}

// Camera controller: smoothly move toward selected creature
function CameraController({ target, orbitRef }: { target: Parasite | null; orbitRef: React.RefObject<THREE.Object3D | null> }) {
  const { camera } = useThree()
  const defaultPos = useMemo(() => new THREE.Vector3(0, 0.6, 7.2), [])
  const goalPos = useRef(new THREE.Vector3())
  const goalLookAt = useRef(new THREE.Vector3())
  const active = useRef(false)

  useFrame(() => {
    const orbit = orbitRef.current as unknown as { enabled: boolean; target: THREE.Vector3; update: () => void } | null

    if (target) {
      // Camera directly in front of the creature, centered
      const [x, y, z] = target.position
      const creaturePos = new THREE.Vector3(x, y, z)
      const dir = creaturePos.clone().normalize()
      goalPos.current.copy(creaturePos).add(dir.multiplyScalar(2.2)).add(new THREE.Vector3(0, 0.1, 0))
      goalLookAt.current.set(x, y, z)

      const dist = camera.position.distanceTo(goalPos.current)
      if (dist > 0.05) {
        camera.position.lerp(goalPos.current, 0.06)
        const currentLookAt = new THREE.Vector3()
        camera.getWorldDirection(currentLookAt)
        const targetDir = goalLookAt.current.clone().sub(camera.position).normalize()
        currentLookAt.lerp(targetDir, 0.06)
        camera.lookAt(camera.position.clone().add(currentLookAt))
      } else {
        // Arrived — hold position
        camera.position.copy(goalPos.current)
        camera.lookAt(goalLookAt.current)
      }

      if (orbit) orbit.enabled = false
      active.current = true
    } else if (active.current) {
      // Return to default
      camera.position.lerp(defaultPos, 0.05)
      camera.lookAt(0, 0, 0)

      // Once close enough, hand back to OrbitControls
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

function DependencySwarm({
  deps, hostRatio, naked, creatureDesigns, selectedParasite, onSelectParasite,
}: {
  deps: Dependency[]; hostRatio: number; naked: boolean; creatureDesigns: CreatureDesign[] | undefined
  selectedParasite: Parasite | null; onSelectParasite: (p: Parasite | null) => void
}) {
  const swarmRef = useRef<THREE.Group>(null)
  const parasites = useMemo(() => createParasites(deps, creatureDesigns), [deps, creatureDesigns])
  const inspecting = selectedParasite !== null
  // Freeze rotation when inspecting — store the frozen rotation
  const frozenRot = useRef<{ y: number; x: number; z: number } | null>(null)

  useFrame(({ clock }) => {
    if (!swarmRef.current) return
    const t = clock.elapsedTime

    if (inspecting) {
      // Freeze: capture current rotation once, then hold it
      if (!frozenRot.current) {
        frozenRot.current = {
          y: swarmRef.current.rotation.y,
          x: swarmRef.current.rotation.x,
          z: swarmRef.current.rotation.z,
        }
      }
      // Hold the frozen rotation
      swarmRef.current.rotation.y = frozenRot.current.y
      swarmRef.current.rotation.x = frozenRot.current.x
      swarmRef.current.rotation.z = frozenRot.current.z
    } else {
      frozenRot.current = null
      swarmRef.current.rotation.y = t * 0.11
      swarmRef.current.rotation.x = Math.sin(t * 0.23) * 0.13
      swarmRef.current.rotation.z = Math.cos(t * 0.19) * 0.09
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

type ParasiteSceneProps = {
  result: AnalysisResult; naked: boolean
  selectedParasite: Parasite | null; onSelectParasite: (p: Parasite | null) => void
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
    <Canvas camera={{ position: [0, 0.6, 7.2], fov: 52 }} dpr={[1, 2]} onPointerMissed={handleMissClick}>
      <color attach="background" args={['#0c1a2e']} />
      <fog attach="fog" args={['#0c1a2e', 6, 14]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 6, 3]} intensity={1.2} color="#e0f0ff" />
      <pointLight position={[-3, -2, 2]} color="#56d8e0" intensity={18} distance={10} />
      <pointLight position={[4, 2, -3]} color="#a78bfa" intensity={12} distance={8} />
      <Stars radius={70} depth={45} count={500} factor={2} saturation={0.2} fade speed={0.4} />
      <DependencySwarm deps={displayDeps} hostRatio={result.hostProfile.hostRatio} naked={naked} creatureDesigns={result.gemini?.creatures} selectedParasite={selectedParasite} onSelectParasite={onSelectParasite} />
      <CameraController target={selectedParasite} orbitRef={orbitRef} />
      <OrbitControls ref={orbitRef} enablePan={false} enableDamping dampingFactor={0.08} minDistance={3} maxDistance={12} autoRotate={!selectedParasite} autoRotateSpeed={0.3} rotateSpeed={0.6} />
    </Canvas>
  )
}
