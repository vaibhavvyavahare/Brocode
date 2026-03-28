import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function WebGLBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Particle field ──────────────────────────────────────────────────
    const PARTICLE_COUNT = 1800
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    const palette = [
      new THREE.Color('#f59e0b'),
      new THREE.Color('#3b82f6'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#10b981'),
    ]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      sizes[i] = Math.random() * 2.5 + 0.5
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:   { value: 0 },
        uScroll: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uScroll;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(uTime * 0.4 + pos.x * 0.5) * 0.15;
          pos.x += cos(uTime * 0.3 + pos.z * 0.4) * 0.1;
          pos.y -= uScroll * 0.003;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (280.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.2, 0.5, d);
          gl_FragColor = vec4(vColor, a * 0.7);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
    })

    const particles = new THREE.Points(geometry, particleMat)
    scene.add(particles)

    // ── Floating grid lines ─────────────────────────────────────────────
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x1e1e35, transparent: true, opacity: 0.5
    })
    for (let i = -5; i <= 5; i++) {
      const hGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-10, i * 1.2, -3),
        new THREE.Vector3(10, i * 1.2, -3),
      ])
      const vGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i * 2, -6, -3),
        new THREE.Vector3(i * 2, 6, -3),
      ])
      scene.add(new THREE.Line(hGeo, gridMat))
      scene.add(new THREE.Line(vGeo, gridMat))
    }

    // ── Mouse interaction ───────────────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.5
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 0.5
    }
    window.addEventListener('mousemove', handleMouseMove)

    // ── Scroll tracking ─────────────────────────────────────────────────
    let scrollY = 0
    const handleScroll = () => { scrollY = window.scrollY }
    window.addEventListener('scroll', handleScroll)

    // ── Resize ──────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // ── Animation loop ──────────────────────────────────────────────────
    let animId: number
    const start = performance.now()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = (performance.now() - start) * 0.001
      particleMat.uniforms.uTime.value = t
      particleMat.uniforms.uScroll.value = scrollY

      particles.rotation.y = t * 0.02 + mouse.x * 0.3
      particles.rotation.x = mouse.y * 0.2

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      mount.removeChild(renderer.domElement)
      geometry.dispose()
      particleMat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
