import { useState, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, OrbitControls, Sphere, Stars } from '@react-three/drei'
import type { Group, Mesh } from 'three'
import { parseGitHubUrl, fetchPackageJson, analyzeDependencies, type AnalysisResult } from './github'
import './App.css'

const HOST_RADIUS = 0.26
const PARASITE_COUNT = 54
const PARASITE_FIELD_RADIUS = 3.8
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const WORM_SEGMENT_COUNT = 10
const MAX_VISIBLE_DEPENDENCIES = 18

const SAMPLE_DEPENDENCIES = [
  'react', 'vite', 'typescript', 'eslint', 'three', 'zustand', 'axios', 'tailwindcss',
  'lodash', 'date-fns', 'zod', 'react-query', 'framer-motion', 'firebase', 'supabase',
  'storybook', 'vitest', 'prettier', 'd3', 'next', 'sharp', 'playwright', 'tanstack-router',
  'sentry', 'msw', 'radix-ui', 'react-hook-form', 'yup', 'stripe', 'socket.io', 'prisma',
  'graphql', 'apollo', 'postcss', 'sass', 'babel', 'rollup', 'webpack', 'lodash-es',
  'immer', 'recoil', 'jotai', 'date-io', 'uuid', 'jsonwebtoken', 'bcrypt', 'nodemailer',
  'cors', 'express', 'fastify', 'drizzle', 'react-spring', 'gsap', 'lucide-react'
]

const PARASITE_COLORS = ['#a7ff12', '#39ff88', '#00e5ff', '#ff4df3', '#f6ff00', '#ff7a18']

type ParasiteVariant = 'centipede' | 'pustule' | 'maggot'

type Parasite = {
  name: string
  color: string
  variant: ParasiteVariant
  seed: number
  size: number
  position: [number, number, number]
}

function createParasites(dependencyNames: string[]): Parasite[] {
  const count = dependencyNames.length
  if (count === 0) return []

  return dependencyNames.map((name, index) => {
    const normalizedY = count > 1 ? 1 - (index / (count - 1)) * 2 : 0
    const orbitRadius = count > 1 ? Math.sqrt(1 - normalizedY * normalizedY) : 1
    const theta = GOLDEN_ANGLE * index
    const ringNoise = 0.74 + (index % 7) * 0.06
    const size = 0.18 + (name.length % 7) * 0.032

    return {
      name,
      color: PARASITE_COLORS[index % PARASITE_COLORS.length],
      seed: index * 0.71 + name.length * 0.13,
      size,
      variant: index % 3 === 0 ? 'centipede' : index % 3 === 1 ? 'pustule' : 'maggot',
      position: [
        Math.cos(theta) * orbitRadius * PARASITE_FIELD_RADIUS * ringNoise,
        normalizedY * PARASITE_FIELD_RADIUS * 0.9,
        Math.sin(theta) * orbitRadius * PARASITE_FIELD_RADIUS * ringNoise,
      ],
    }
  })
}

function HostNucleus() {
  const hostRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 6.4) * 0.11
    if (hostRef.current) hostRef.current.scale.setScalar(pulse)
  })

  return (
    <group>
      <Sphere ref={hostRef} args={[HOST_RADIUS, 48, 48]}>
        <meshStandardMaterial
          color="#ffd86b"
          emissive="#ffb000"
          emissiveIntensity={2.7}
          metalness={0.18}
          roughness={0.12}
        />
      </Sphere>
      <Sphere args={[HOST_RADIUS * 1.8, 32, 32]}>
        <meshBasicMaterial color="#ffcf4a" transparent opacity={0.08} />
      </Sphere>
      <pointLight color="#ffd86b" intensity={65} distance={4.4} />
    </group>
  )
}

function WriggleShell({ parasite }: { parasite: Parasite }) {
  const groupRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current == null) return

    const t = clock.elapsedTime
    const [x, y, z] = parasite.position
    const bitePressure = 0.82 + Math.sin(t * 1.8 + parasite.seed) * 0.09

    groupRef.current.position.set(
      x * bitePressure + Math.sin(t * 2.5 + parasite.seed) * 0.09,
      y * bitePressure + Math.cos(t * 2.2 + parasite.seed) * 0.07,
      z * bitePressure + Math.sin(t * 2.9 + parasite.seed) * 0.09,
    )
    groupRef.current.rotation.x = Math.sin(t * 0.7 + parasite.seed) * 0.7
    groupRef.current.rotation.y = t * 0.34 + parasite.seed
    groupRef.current.rotation.z = Math.cos(t * 0.9 + parasite.seed) * 0.48
  })

  if (parasite.variant === 'pustule') {
    return (
      <group ref={groupRef} position={parasite.position}>
        <Sphere args={[parasite.size * 1.35, 16, 16]}>
          <meshStandardMaterial
            color="#141a10"
            emissive={parasite.color}
            emissiveIntensity={0.72}
            roughness={0.9}
          />
        </Sphere>
        {Array.from({ length: 8 }).map((_, index) => {
          const angle = (index / 8) * Math.PI * 2
          const distance = parasite.size * (0.72 + (index % 3) * 0.18)

          return (
            <Sphere
              key={`${parasite.name}-pock-${index}`}
              args={[parasite.size * (0.26 + (index % 2) * 0.09), 8, 8]}
              position={[
                Math.cos(angle) * distance,
                Math.sin(angle * 1.7) * parasite.size * 0.5,
                Math.sin(angle) * distance,
              ]}
            >
              <meshStandardMaterial color={parasite.color} emissive={parasite.color} emissiveIntensity={1.2} />
            </Sphere>
          )
        })}
      </group>
    )
  }

  if (parasite.variant === 'maggot') {
    return (
      <group ref={groupRef} position={parasite.position}>
        {Array.from({ length: 7 }).map((_, index) => {
          const segmentOffset = index - 3

          return (
            <Sphere
              key={`${parasite.name}-larva-${index}`}
              args={[parasite.size * (0.62 - index * 0.035), 14, 14]}
              position={[
                segmentOffset * parasite.size * 0.5,
                Math.sin(index + parasite.seed) * parasite.size * 0.2,
                Math.cos(index + parasite.seed) * parasite.size * 0.12,
              ]}
              scale={[1.35, 0.78, 0.82]}
            >
              <meshStandardMaterial color="#d8f6c0" emissive={parasite.color} emissiveIntensity={0.55} roughness={0.88} />
            </Sphere>
          )
        })}
      </group>
    )
  }

  return (
    <group ref={groupRef} position={parasite.position}>
      {Array.from({ length: WORM_SEGMENT_COUNT }).map((_, index) => {
        const segmentOffset = index - WORM_SEGMENT_COUNT / 2
        const scale = 1 - Math.abs(segmentOffset) * 0.045
        const legAngle = index % 2 === 0 ? 0.75 : -0.75

        return (
          <group
            key={`${parasite.name}-segment-${index}`}
            position={[
              segmentOffset * parasite.size * 0.56,
              Math.sin(index * 0.8 + parasite.seed) * parasite.size * 0.24,
              Math.cos(index * 0.65 + parasite.seed) * parasite.size * 0.2,
            ]}
          >
            <Sphere args={[parasite.size * scale, 12, 12]} scale={[1.25, 0.72, 0.86]}>
              <meshStandardMaterial color="#12190e" emissive={parasite.color} emissiveIntensity={0.88} roughness={0.8} />
            </Sphere>
            <mesh position={[0, -parasite.size * 0.55, parasite.size * 0.55]} rotation={[legAngle, 0, 0.45]}>
              <coneGeometry args={[parasite.size * 0.08, parasite.size * 0.85, 5]} />
              <meshStandardMaterial color={parasite.color} emissive={parasite.color} emissiveIntensity={0.9} />
            </mesh>
            <mesh position={[0, -parasite.size * 0.55, -parasite.size * 0.55]} rotation={[-legAngle, 0, -0.45]}>
              <coneGeometry args={[parasite.size * 0.08, parasite.size * 0.85, 5]} />
              <meshStandardMaterial color={parasite.color} emissive={parasite.color} emissiveIntensity={0.9} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function WrithingTether({ parasite }: { parasite: Parasite }) {
  const points = useMemo(() => {
    const [x, y, z] = parasite.position
    const pointsCount = 8

    return Array.from({ length: pointsCount }).map((_, index) => {
      const progress = index / (pointsCount - 1)
      const coil = Math.sin(progress * Math.PI * 3 + parasite.seed) * 0.34 * (1 - progress)

      return [
        x * progress + Math.cos(parasite.seed) * coil,
        y * progress + Math.sin(progress * Math.PI * 2 + parasite.seed) * 0.18,
        z * progress + Math.sin(parasite.seed) * coil,
      ] as [number, number, number]
    })
  }, [parasite])

  return <Line points={points} color={parasite.color} lineWidth={1.8} transparent opacity={0.34} />
}

function DependencySwarm({ dependencies }: { dependencies: string[] }) {
  const swarmRef = useRef<Group>(null)
  const parasites = useMemo(() => createParasites(dependencies), [dependencies])

  useFrame(({ clock }) => {
    if (swarmRef.current == null) return

    const t = clock.elapsedTime
    swarmRef.current.rotation.y = t * 0.11
    swarmRef.current.rotation.x = Math.sin(t * 0.23) * 0.13
    swarmRef.current.rotation.z = Math.cos(t * 0.19) * 0.09
  })

  return (
    <group ref={swarmRef} rotation={[0.1, -0.35, -0.04]}>
      <HostNucleus />
      {parasites.map((parasite, i) => (
        <WrithingTether key={`${parasite.name}-tether-${i}`} parasite={parasite} />
      ))}
      {parasites.map((parasite, i) => (
        <WriggleShell key={`${parasite.name}-shell-${i}`} parasite={parasite} />
      ))}
    </group>
  )
}

function ParasiteScene({ dependencies }: { dependencies: string[] }) {
  return (
    <>
      <color attach="background" args={['#020301']} />
      <fog attach="fog" args={['#020301', 4.8, 11.5]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 6, 3]} intensity={1.3} color="#c9ff8a" />
      <pointLight position={[-3, -2, 2]} color="#ff4df3" intensity={30} distance={7} />
      <Stars radius={70} depth={45} count={1600} factor={2.8} saturation={0.45} fade speed={0.9} />
      <DependencySwarm dependencies={dependencies} />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={9.5} autoRotate autoRotateSpeed={0.42} />
    </>
  )
}

function App() {
  const [inputUrl, setInputUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseGitHubUrl(inputUrl)
    if (!parsed) {
      setStatus('error')
      setErrorMsg('GitHub 레포지토리 URL 형식이 올바르지 않습니다.')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const pkgJson = await fetchPackageJson(parsed.owner, parsed.repo)
      const analysis = analyzeDependencies(parsed.owner, parsed.repo, pkgJson)
      setResult(analysis)
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || '분석 중 오류가 발생했습니다.')
    }
  }

  const currentDeps = result 
    ? result.dependencies.map(d => d.name) 
    : SAMPLE_DEPENDENCIES.slice(0, PARASITE_COUNT);

  // 최대 60개까지만 3D 렌더링 (성능 이슈)
  const displayDeps = currentDeps.slice(0, 60);
  
  // 패널에 보여줄 의존성 이름 목록 (태그 클라우드 용)
  const parasiteNames = currentDeps.slice(0, MAX_VISIBLE_DEPENDENCIES)

  return (
    <main className="app-shell">
      <section className="parasite-stage" aria-label="3D dependency parasite renderer">
        <Canvas camera={{ position: [0, 0.6, 7.2], fov: 52 }} dpr={[1, 2]}>
          <ParasiteScene dependencies={displayDeps} />
        </Canvas>
      </section>

      <section className="hero-panel" aria-labelledby="page-title">
        <p className="eyebrow">Dependency Parasite / live specimen DP-006</p>
        <h1 id="page-title">내 코드는 거들 뿐.</h1>
        <p className="hero-copy">
          아주 작은 금색 핵이 직접 작성한 코드입니다. 나머지는 dependency가 낳은 곰보 포자와 다지류
          기생충입니다. GitHub 스캔 결과에 따라 종과 체형이 바뀝니다.
        </p>

        <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
          <input 
            type="text" 
            placeholder="https://github.com/facebook/react" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={status === 'loading'}
            style={{ padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', width: '100%' }}
          />
          <button 
            type="submit" 
            disabled={status === 'loading' || !inputUrl}
            style={{ padding: '12px', background: '#ff4df3', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            {status === 'loading' ? '스캔 중...' : '분석 시작'}
          </button>
        </form>
        {status === 'error' && <p style={{ color: '#ff4d4d', marginTop: '8px', fontSize: '14px' }}>{errorMsg}</p>}
      </section>

      <aside className="scan-panel" aria-label="기생충 분석 요약">
        <div>
          <span>Repository</span>
          <strong>{result ? result.repository : 'Sample Data'}</strong>
        </div>
        <div>
          <span>Risk Level</span>
          <strong style={{ color: result ? (result.riskLevel === 'Extremely High' ? '#ff4d4d' : '#a7ff12') : 'inherit' }}>
            {result ? result.riskLevel : 'Unknown'}
          </strong>
        </div>
        <div>
          <span>Host Integrity</span>
          <strong>{result ? `${result.hostIntegrity}% / Diminished` : '3% / Barely alive'}</strong>
        </div>
        <div>
          <span>Invasion Vector</span>
          <strong>{result ? `${result.dependencyCount} external proteins` : `${PARASITE_COUNT} external proteins`}</strong>
        </div>
      </aside>

      <section className="codex-card">
        <p className="codex-label">Ig Nobel style bio report</p>
        <h2>{result ? '숙주는 작고, 의존성은 굶주렸다.' : '숙주는 작고, node_modules는 굶주렸다.'}</h2>
        <p>
          {result 
            ? `이 프로젝트는 ${result.dependencyCount}개의 외부 단백질을 숙주 삼아 연명하고 있습니다. 직접 작성한 코드는 희미하게 빛나지만, 지휘권은 이미 외부 세계로 넘어갔을지도 모릅니다.` 
            : '이 생명체는 자신의 창조주를 중앙에 가둔 채 외부 단백질을 계속 증식시킵니다. 개발자는 창조주라기보다 먹이를 공급하는 사육사에 가깝습니다.'
          }
        </p>
        <div className="dependency-cloud" aria-label="렌더링에 사용한 샘플 의존성">
          {parasiteNames.map((dependency) => (
            <span key={dependency}>{dependency}</span>
          ))}
          {currentDeps.length > MAX_VISIBLE_DEPENDENCIES && (
            <span>+{currentDeps.length - MAX_VISIBLE_DEPENDENCIES} more...</span>
          )}
        </div>
      </section>

      <div className="viewer-overlay">
        <span className="recording-dot" />
        {status === 'loading' ? '레포지토리 스캔 중...' : '전체 격리실 렌더링 중'}
      </div>
    </main>
  )
}

export default App
