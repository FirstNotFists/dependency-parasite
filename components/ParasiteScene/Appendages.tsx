import { Sphere } from '@react-three/drei'
import type { CreatureShape, CreatureColor } from '../../types'

export default function Appendages({ shape, size, color }: { shape: CreatureShape; size: number; color: CreatureColor }) {
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
