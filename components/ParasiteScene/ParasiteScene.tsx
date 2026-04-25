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
    appendages: [{
      type: appTypes[(h * 3 + index) % appTypes.length],
      count: 2 + (h % 6),
      sizeRatio: 0.15 + (h % 25) / 100,
      spread: spreads[(h * 7 + index) % spreads.length],
    }],
    aspectRatio: [
      0.6 + (h % 10) / 10,
      0.7 + ((h * 3) % 12) / 10,
      0.6 + ((h * 5) % 8) / 10,
    ],
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
  const h = hashString(name)
  return palettes[(h + index) % palettes.length]
}

function fallbackMotion(name: string, index: number): CreatureMotion {
  const motions = ['writhe', 'lurch', 'pulse', 'drift', 'orbit', 'flicker', 'breathe'] as const
  const h = hashString(name)
  return {
    primary: motions[(h + index) % motions.length],
    secondary: motions[(h + index + 3) % motions.length],
    speedMultiplier: 0.5 + (h % 8) / 10,
    amplitude: 0.4 + (h % 5) / 10,
  }
}

function createParasites(
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
    const baseSize = 0.14 + Math.min(dep.transitiveCount, 30) * 0.012
    const size = Math.min(baseSize, 0.55)
    const design = designMap.get(dep.name)

    return {
      name: dep.name,
      creatureName: design?.creatureName ?? dep.name,
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
      bioLabel: design?.bioLabel ?? `${dep.name} 기생체`,
    }
  })
}

// --- 3D Components ---

function HostNucleus({ hostRatio }: { hostRatio: number }) {
  const hostRef = useRef<THREE.Mesh>(null)
  const radius = 0.08 + hostRatio * 0.6

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 6.4) * 0.11
    if (hostRef.current) hostRef.current.scale.setScalar(pulse)
  })

  return (
    <group>
      <Sphere ref={hostRef} args={[radius, 48, 48]}>
        <meshStandardMaterial color="#ffd86b" emissive="#ffb000" emissiveIntensity={2.7} metalness={0.18} roughness={0.12} />
      </Sphere>
      <Sphere args={[radius * 1.8, 32, 32]}>
        <meshBasicMaterial color="#ffcf4a" transparent opacity={0.08} />
      </Sphere>
      <pointLight color="#ffd86b" intensity={65} distance={4.4} />
    </group>
  )
}

// Body geometry with material included (for composite types)
function BodyGeometry({ shape, size, color }: { shape: CreatureShape; size: number; color: CreatureColor }) {
  const [ax, ay, az] = shape.aspectRatio
  const mat = <meshStandardMaterial color={color.primary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity} roughness={0.75} />

  if (shape.body === 'tapered') {
    return (
      <group scale={[ax, ay, az]}>
        <mesh>
          <capsuleGeometry args={[size * 0.3, size * 0.9, 8, 16]} />
          {mat}
        </mesh>
        <mesh position={[0, size * 0.55, 0]} scale={[1.4, 0.6, 1.4]}>
          <sphereGeometry args={[size * 0.35, 12, 12]} />
          {mat}
        </mesh>
      </group>
    )
  }

  if (shape.body === 'hooked') {
    return (
      <group scale={[ax, ay, az]}>
        <Sphere args={[size, 12, 12]} scale={[1, 0.7, 0.8]}>
          {mat}
        </Sphere>
        <mesh position={[size * 0.6, size * 0.3, 0]} rotation={[0, 0, -Math.PI * 0.4]}>
          <coneGeometry args={[size * 0.15, size * 0.9, 6]} />
          <meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 1.3} roughness={0.6} />
        </mesh>
      </group>
    )
  }

  if (shape.body === 'torus') {
    return (
      <mesh scale={[ax, ay, az]}>
        <torusGeometry args={[size * 0.8, size * 0.3, 12, 24]} />
        {mat}
      </mesh>
    )
  }

  if (shape.body === 'capsule') {
    return (
      <mesh scale={[ax * 0.6, ay * 1.4, az * 0.6]}>
        <capsuleGeometry args={[size * 0.4, size * 0.8, 8, 16]} />
        {mat}
      </mesh>
    )
  }

  if (shape.body === 'ellipsoid') {
    return (
      <Sphere args={[size, 16, 16]} scale={[ax, ay * 1.3, az * 0.8]}>
        {mat}
      </Sphere>
    )
  }

  return (
    <Sphere args={[size, 16, 16]} scale={[ax, ay, az]}>
      {mat}
    </Sphere>
  )
}

// Appendage renderer with new types: tendril, fang
function Appendages({ shape, size, color }: { shape: CreatureShape; size: number; color: CreatureColor }) {
  return (
    <>
      {shape.appendages.map((app, appIdx) =>
        Array.from({ length: app.count }).map((_, i) => {
          const angle = app.spread === 'radial'
            ? (i / app.count) * Math.PI * 2
            : app.spread === 'linear'
              ? ((i / (app.count - 1 || 1)) - 0.5) * Math.PI
              : (i * 2.39996)

          const dist = size * (0.8 + appIdx * 0.2)
          const appSize = size * app.sizeRatio
          const pos: [number, number, number] = [
            Math.cos(angle) * dist,
            Math.sin(angle * 1.3 + appIdx) * size * 0.4,
            Math.sin(angle) * dist,
          ]

          if (app.type === 'tendril') {
            return (
              <group key={`${appIdx}-${i}`} position={pos}>
                {[0, 1, 2].map(seg => (
                  <mesh
                    key={seg}
                    position={[seg * appSize * 0.7, seg * appSize * 0.35, seg * appSize * 0.15]}
                    rotation={[0, 0, Math.PI * 0.18 * seg]}
                  >
                    <coneGeometry args={[appSize * (0.25 - seg * 0.05), appSize * 0.8, 5]} />
                    <meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * (1.3 - seg * 0.2)} />
                  </mesh>
                ))}
              </group>
            )
          }

          if (app.type === 'fang') {
            return (
              <mesh key={`${appIdx}-${i}`} position={pos} rotation={[angle * 0.5, 0, Math.PI * 0.5 + angle * 0.3]}>
                <coneGeometry args={[appSize * 0.1, appSize * 2.8, 4]} />
                <meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 1.5} roughness={0.4} />
              </mesh>
            )
          }

          if (app.type === 'cone') {
            return (
              <mesh key={`${appIdx}-${i}`} position={pos} rotation={[angle, 0, Math.PI * 0.3]}>
                <coneGeometry args={[appSize * 0.4, appSize * 2, 6]} />
                <meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 1.2} />
              </mesh>
            )
          }

          if (app.type === 'ring') {
            return (
              <mesh key={`${appIdx}-${i}`} position={pos} rotation={[i * 0.5, angle, 0]}>
                <torusGeometry args={[appSize * 1.2, appSize * 0.2, 8, 16]} />
                <meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity} />
              </mesh>
            )
          }

          if (app.type === 'torus') {
            return (
              <mesh key={`${appIdx}-${i}`} position={pos}>
                <torusGeometry args={[appSize * 0.8, appSize * 0.25, 8, 12]} />
                <meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 0.8} />
              </mesh>
            )
          }

          return (
            <Sphere key={`${appIdx}-${i}`} args={[appSize, 8, 8]} position={pos}>
              <meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 1.1} />
            </Sphere>
          )
        }),
      )}
    </>
  )
}

// Creature renderer with click support and improved motion
function CreatureRenderer({
  parasite,
  paused,
  isSelected,
  onSelect,
}: {
  parasite: Parasite
  paused: boolean
  isSelected: boolean
  onSelect: (p: Parasite) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const { shape, color, motion, seed, size } = parasite

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    if (paused && !isSelected) return

    const t = clock.elapsedTime
    const spd = isSelected ? 0.3 : motion.speedMultiplier
    const amp = isSelected ? 0.2 : motion.amplitude
    const [x, y, z] = parasite.position

    // Position
    const bite = 0.82 + Math.sin(t * 1.8 * spd + seed) * 0.09
    let px = x * bite + Math.sin(t * 2.5 * spd + seed) * 0.06 * amp
    let py = y * bite + Math.cos(t * 2.2 * spd + seed) * 0.05 * amp
    let pz = z * bite + Math.sin(t * 2.9 * spd + seed) * 0.06 * amp

    // Lurch: periodic lunge toward host
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
    if (motion.primary === 'orbit' || motion.secondary === 'orbit') {
      groupRef.current.rotation.y = t * 0.5 * spd + seed
    } else {
      groupRef.current.rotation.y = t * 0.2 * spd + seed
    }

    if (motion.primary === 'writhe' || motion.secondary === 'writhe') {
      const rawX = Math.sin(t * 1.2 * spd + seed) * 0.8 * amp
      const jerk = Math.sin(t * 4.5 * spd + seed) > 0.7 ? 0.25 * amp : 0
      groupRef.current.rotation.x = rawX + jerk
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

  const handleClick = useCallback((e: THREE.Event) => {
    (e as unknown as { stopPropagation: () => void }).stopPropagation()
    onSelect(parasite)
  }, [parasite, onSelect])

  const handlePointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'auto'
  }, [])

  const clickProps = {
    onClick: handleClick,
    onPointerOver: handlePointerOver,
    onPointerOut: handlePointerOut,
  }

  if (shape.segments > 1) {
    const segCount = Math.min(shape.segments, 8)
    return (
      <group ref={groupRef} position={parasite.position}>
        {/* Invisible click target */}
        <mesh {...clickProps} visible={false}>
          <sphereGeometry args={[size * 2, 8, 8]} />
          <meshBasicMaterial />
        </mesh>
        {Array.from({ length: segCount }).map((_, i) => {
          const off = i - segCount / 2
          const segScale = 1 - Math.abs(off) / segCount * 0.4
          return (
            <group
              key={i}
              position={[
                off * size * 0.55 * shape.aspectRatio[0],
                Math.sin(i * 0.8 + seed) * size * 0.2,
                Math.cos(i * 0.65 + seed) * size * 0.15,
              ]}
            >
              <BodyGeometry shape={shape} size={size * segScale} color={color} />
            </group>
          )
        })}
        <Appendages shape={shape} size={size} color={color} />
      </group>
    )
  }

  return (
    <group ref={groupRef} position={parasite.position}>
      <mesh {...clickProps} visible={false}>
        <sphereGeometry args={[size * 2, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
      <BodyGeometry shape={shape} size={size * 1.2} color={color} />
      <Appendages shape={shape} size={size} color={color} />
    </group>
  )
}

// Animated tether with feeding particles
function AnimatedTether({ parasite, paused }: { parasite: Parasite; paused: boolean }) {
  const particleRefs = useRef<THREE.Mesh[]>([])

  const points = useMemo(() => {
    const [x, y, z] = parasite.position
    return Array.from({ length: 12 }).map((_, i) => {
      const p = i / 11
      const coil = Math.sin(p * Math.PI * 4 + parasite.seed) * 0.28 * (1 - p)
      return [
        x * p + Math.cos(parasite.seed) * coil,
        y * p + Math.sin(p * Math.PI * 2.5 + parasite.seed) * 0.15,
        z * p + Math.sin(parasite.seed) * coil,
      ] as [number, number, number]
    })
  }, [parasite])

  useFrame(({ clock }) => {
    if (paused) return
    const t = clock.elapsedTime
    for (let i = 0; i < particleRefs.current.length; i++) {
      const mesh = particleRefs.current[i]
      if (!mesh) continue
      const progress = ((t * 0.35 + i * 0.33 + parasite.seed) % 1)
      const idx = progress * (points.length - 1)
      const lo = Math.floor(idx)
      const hi = Math.min(lo + 1, points.length - 1)
      const frac = idx - lo
      mesh.position.set(
        points[lo][0] + (points[hi][0] - points[lo][0]) * frac,
        points[lo][1] + (points[hi][1] - points[lo][1]) * frac,
        points[lo][2] + (points[hi][2] - points[lo][2]) * frac,
      )
      mesh.scale.setScalar(0.6 + Math.sin(t * 3 + i) * 0.3)
    }
  })

  return (
    <group>
      <Line points={points} color={parasite.color.emissive} lineWidth={1.5} transparent opacity={0.2} />
      {[0, 1, 2].map(i => (
        <mesh
          key={i}
          ref={(el: THREE.Mesh) => { particleRefs.current[i] = el }}
        >
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color={parasite.color.emissive} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// Camera controller for click-to-inspect
function CameraController({
  target,
  orbitRef,
}: {
  target: Parasite | null
  orbitRef: React.RefObject<THREE.Object3D | null>
}) {
  const { camera } = useThree()
  const defaultPos = useRef(new THREE.Vector3(0, 0.6, 7.2))
  const targetPos = useRef(new THREE.Vector3())
  const tempVec = useRef(new THREE.Vector3())

  useFrame(() => {
    if (target) {
      const [x, y, z] = target.position
      tempVec.current.set(x, y, z)
      const dir = tempVec.current.clone().normalize()
      targetPos.current.copy(tempVec.current).add(dir.multiplyScalar(2.5))
      camera.position.lerp(targetPos.current, 0.04)
      tempVec.current.set(x, y, z)
      camera.lookAt(tempVec.current)

      const orbit = orbitRef.current as unknown as { enabled: boolean; autoRotate: boolean }
      if (orbit) {
        orbit.enabled = false
        orbit.autoRotate = false
      }
    } else {
      camera.position.lerp(defaultPos.current, 0.04)
      camera.lookAt(0, 0, 0)

      const orbit = orbitRef.current as unknown as { enabled: boolean; autoRotate: boolean; target: THREE.Vector3; update: () => void }
      if (orbit) {
        orbit.enabled = true
        orbit.autoRotate = true
        orbit.target.set(0, 0, 0)
        orbit.update()
      }
    }
  })

  return null
}

function DependencySwarm({
  deps,
  hostRatio,
  naked,
  creatureDesigns,
  selectedParasite,
  onSelectParasite,
}: {
  deps: Dependency[]
  hostRatio: number
  naked: boolean
  creatureDesigns: CreatureDesign[] | undefined
  selectedParasite: Parasite | null
  onSelectParasite: (p: Parasite | null) => void
}) {
  const swarmRef = useRef<THREE.Group>(null)
  const parasites = useMemo(
    () => createParasites(deps, creatureDesigns),
    [deps, creatureDesigns],
  )
  const paused = selectedParasite !== null

  useFrame(({ clock }) => {
    if (!swarmRef.current || paused) return
    const t = clock.elapsedTime
    swarmRef.current.rotation.y = t * 0.11
    swarmRef.current.rotation.x = Math.sin(t * 0.23) * 0.13
    swarmRef.current.rotation.z = Math.cos(t * 0.19) * 0.09
  })

  return (
    <group ref={swarmRef} rotation={[0.1, -0.35, -0.04]}>
      <HostNucleus hostRatio={hostRatio} />
      {!naked && (
        <>
          {parasites.map((p, i) => (
            <AnimatedTether key={`t-${i}`} parasite={p} paused={paused} />
          ))}
          {parasites.map((p, i) => (
            <CreatureRenderer
              key={`c-${i}`}
              parasite={p}
              paused={paused}
              isSelected={selectedParasite?.name === p.name}
              onSelect={onSelectParasite}
            />
          ))}
        </>
      )}
    </group>
  )
}

type ParasiteSceneProps = {
  result: AnalysisResult
  naked: boolean
  selectedParasite: Parasite | null
  onSelectParasite: (p: Parasite | null) => void
}

export default function ParasiteScene({ result, naked, selectedParasite, onSelectParasite }: ParasiteSceneProps) {
  const displayDeps = result.dependencies.slice(0, MAX_DISPLAY_DEPS)
  const orbitRef = useRef(null)

  const handleCanvasClick = useCallback(() => {
    if (selectedParasite) onSelectParasite(null)
  }, [selectedParasite, onSelectParasite])

  return (
    <Canvas camera={{ position: [0, 0.6, 7.2], fov: 52 }} dpr={[1, 2]} onClick={handleCanvasClick}>
      <color attach="background" args={['#040a08']} />
      <fog attach="fog" args={['#040a08', 5, 12]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 6, 3]} intensity={0.8} color="#b8e6d0" />
      <pointLight position={[-3, -2, 2]} color="#5ce0d6" intensity={15} distance={8} />
      <pointLight position={[4, 2, -3]} color="#a78bfa" intensity={10} distance={6} />
      <Stars radius={70} depth={45} count={1200} factor={2.2} saturation={0.3} fade speed={0.5} />
      <DependencySwarm
        deps={displayDeps}
        hostRatio={result.hostProfile.hostRatio}
        naked={naked}
        creatureDesigns={result.gemini?.creatures}
        selectedParasite={selectedParasite}
        onSelectParasite={onSelectParasite}
      />
      <CameraController target={selectedParasite} orbitRef={orbitRef} />
      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        minDistance={2}
        maxDistance={9.5}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </Canvas>
  )
}
