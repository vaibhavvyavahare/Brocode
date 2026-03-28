import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface OrbProps {
  scrollFactor: number
}

export default function GoldOrb({ scrollFactor }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { viewport } = useThree()

  // ── Large Cinematic Scale ───────────────────────────────────────────
  const baseScale = Math.min(viewport.width / 1.8, viewport.height / 1.5, 3.5)
  const currentScale = baseScale + scrollFactor * 1.5

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return

    const t = state.clock.getElapsedTime()

    // ── Precise Rotation ───────────────────────────────────────────────
    meshRef.current.rotation.y = t * 0.15 + scrollFactor * 0.8
    meshRef.current.rotation.x = Math.PI * 0.05 + scrollFactor * 0.4
    
    // ── Translation ───────────────────────────────────────────────────
    groupRef.current.position.y = -scrollFactor * 2
    groupRef.current.position.z = -scrollFactor * 2
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} scale={currentScale}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial 
          color="#111111"
          metalness={1}
          roughness={0.1}
          envMapIntensity={1.5}
        />

        {/* ── Internal Gold Core Glow ────────────────────────────────── */}
        <pointLight color="#b89865" intensity={4} distance={8} />

        {/* ── Floating Strategic Labels ──────────────────────────────── */}
        <Html position={[-1.2, 0.4, 0]} transform distanceFactor={2.5} occlude>
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full whitespace-nowrap opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-primary" />
              <span className="text-[7px] font-mono font-bold tracking-[0.2em] text-white uppercase">REVENUE</span>
           </div>
        </Html>
        <Html position={[1.2, -0.3, 0]} transform distanceFactor={2.5} occlude>
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full whitespace-nowrap opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-primary" />
              <span className="text-[7px] font-mono font-bold tracking-[0.2em] text-white uppercase">STRATEGY</span>
           </div>
        </Html>
      </mesh>

      {/* ── Minimalist Orbiting Rings ─────────────────────────────────── */}
      <group scale={currentScale}>
        {[
          { r: [0, 0, 0], radius: 1.1 },
          { r: [Math.PI / 2.5, 0, 0], radius: 1.25 },
          { r: [0, Math.PI / 3, 0], radius: 1.4 },
        ].map((ring, i) => (
          <mesh key={i} rotation={ring.r as any}>
            <torusGeometry args={[ring.radius, 0.002, 16, 128]} />
            <meshStandardMaterial color="#b89865" opacity={0.2} transparent metalness={1} roughness={0} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
