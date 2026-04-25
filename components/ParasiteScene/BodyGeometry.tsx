import { Sphere } from '@react-three/drei'
import type { CreatureShape, CreatureColor } from '../../types'

export default function BodyGeometry({ shape, size, color }: { shape: CreatureShape; size: number; color: CreatureColor }) {
  const [ax, ay, az] = shape.aspectRatio
  const mat = <meshStandardMaterial color={color.primary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity} roughness={0.75} />

  if (shape.body === 'tapered') return <group scale={[ax, ay, az]}><mesh><capsuleGeometry args={[size * 0.3, size * 0.9, 4, 8]} />{mat}</mesh><mesh position={[0, size * 0.55, 0]} scale={[1.4, 0.6, 1.4]}><sphereGeometry args={[size * 0.35, 8, 8]} />{mat}</mesh></group>
  if (shape.body === 'hooked') return <group scale={[ax, ay, az]}><Sphere args={[size, 8, 8]} scale={[1, 0.7, 0.8]}>{mat}</Sphere><mesh position={[size * 0.6, size * 0.3, 0]} rotation={[0, 0, -Math.PI * 0.4]}><coneGeometry args={[size * 0.15, size * 0.9, 5]} /><meshStandardMaterial color={color.secondary} emissive={color.emissive} emissiveIntensity={color.emissiveIntensity * 1.3} roughness={0.6} /></mesh></group>
  if (shape.body === 'torus') return <mesh scale={[ax, ay, az]}><torusGeometry args={[size * 0.8, size * 0.3, 8, 16]} />{mat}</mesh>
  if (shape.body === 'capsule') return <mesh scale={[ax * 0.6, ay * 1.4, az * 0.6]}><capsuleGeometry args={[size * 0.4, size * 0.8, 4, 8]} />{mat}</mesh>
  if (shape.body === 'ellipsoid') return <Sphere args={[size, 10, 10]} scale={[ax, ay * 1.3, az * 0.8]}>{mat}</Sphere>
  return <Sphere args={[size, 10, 10]} scale={[ax, ay, az]}>{mat}</Sphere>
}
