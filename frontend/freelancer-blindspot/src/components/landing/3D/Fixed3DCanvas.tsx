import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Environment, Float } from '@react-three/drei'
import { useScroll, motion } from 'framer-motion'
import * as THREE from 'three'
import GoldOrb from './GoldOrb'

function InteractiveLight() {
  const lightRef = useRef<THREE.PointLight>(null)
  useFrame((state) => {
    if (!lightRef.current) return
    lightRef.current.position.set(state.mouse.x * 5, state.mouse.y * 5, 10)
  })
  return <pointLight ref={lightRef} color="#ffffff" intensity={1} distance={20} />
}

export default function Fixed3DCanvas() {
  const { scrollY } = useScroll()
  const [scrollFactor, setScrollFactor] = useState(0)

  useEffect(() => {
    const unsub = scrollY.on('change', (y) => {
      setScrollFactor(Math.min(y / 1200, 1))
    })
    return unsub
  }, [scrollY])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-warm-bg select-none">
      
      {/* ── Background Aesthetics ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(243,239,230,0)_0%,rgba(235,232,222,0.6)_100%)]" />
      
      {/* ── Subtle Background Blobs (Parallax) ── */}
      <motion.div 
        animate={{ y: scrollFactor * -200, scale: 1 + scrollFactor * 0.2 }}
        className="absolute -top-[10%] -left-[10%] w-full h-full bg-gold-primary opacity-5 blur-[160px] rounded-full" 
      />

      <Canvas
        camera={{ position: [0, 0, 10], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, stencil: false, depth: true }}
        className="pointer-events-auto"
      >
        <Suspense fallback={null}>
          <Environment preset="city" blur={1} />
          <ambientLight intensity={0.4} />
          
          <InteractiveLight />
          
          {/* ── Fixed Key Light ── */}
          <pointLight position={[10, 10, 10]} color="#ffffff" intensity={2} />
          <pointLight position={[-10, -5, 5]} color="#c5a059" intensity={1.5} />

          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
            <GoldOrb scrollFactor={scrollFactor} />
          </Float>
          
          <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        </Suspense>
      </Canvas>

      {/* ── Bottom Gradient Fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none bg-gradient-to-t from-warm-bg to-transparent" />
    </div>
  )
}
