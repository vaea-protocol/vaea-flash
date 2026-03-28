'use client';
import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

/* ═══ Responsive hook ═══ */
function useBreakpoint() {
  const [bp, setBp] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setBp(w <= 640 ? 'mobile' : w <= 1024 ? 'tablet' : 'desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return bp;
}

/* ═══ Auto-adjust camera for screen size ═══ */
function ResponsiveCamera({ desktop, mobile }: { desktop: number; mobile: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const z = size.width <= 640 ? mobile : desktop;
    (camera as THREE.PerspectiveCamera).position.z = z;
    camera.updateProjectionMatrix();
  }, [size.width, camera, desktop, mobile]);
  return null;
}

/* ═══ Background shapes — 3 different types ═══ */

function BgSphere({ position, color, s = 0.4, rotation = [0, 0, 0] }: {
  position: [number, number, number]; color: string; s?: number;
  rotation?: [number, number, number];
}) {
  return (
    <Float speed={1.8} rotationIntensity={0.1} floatIntensity={0.8}>
      <mesh position={position} rotation={rotation} scale={s}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} toneMapped={false} />
      </mesh>
    </Float>
  );
}

function BgRoundedCube({ position, color, s = 0.55, rotation = [0, 0, 0] }: {
  position: [number, number, number]; color: string; s?: number;
  rotation?: [number, number, number];
}) {
  return (
    <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.8}>
      <mesh position={position} rotation={rotation} scale={s}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} toneMapped={false} />
      </mesh>
    </Float>
  );
}

function BgTriangle({ position, color, s = 0.5, rotation = [0, 0, 0] }: {
  position: [number, number, number]; color: string; s?: number;
  rotation?: [number, number, number];
}) {
  return (
    <Float speed={1.8} rotationIntensity={0.12} floatIntensity={0.8}>
      <mesh position={position} rotation={rotation} scale={s}>
        <tetrahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.05} toneMapped={false} />
      </mesh>
    </Float>
  );
}

/* ═══ Glass material — same as homepage torus ═══ */
const GLASS_PROPS = {
  backside: true,
  samples: 8,
  resolution: 256,
  transmission: 0.95,
  roughness: 0.4,
  clearcoat: 0.1,
  clearcoatRoughness: 0.1,
  thickness: 1.2,
  backsideThickness: 0.8,
  ior: 1.5,
  chromaticAberration: 0.8,
  anisotropy: 0.5,
  color: '#ffffff',
  attenuationDistance: 0.5,
  attenuationColor: '#ffffff',
  toneMapped: false,
} as const;

/* ═══ Knot 1: Classic trefoil — p=2, q=3 (Collateral Swap) ═══ */
function GlassKnot1() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI * 0.15 + Math.sin(s.clock.elapsedTime * 0.2) * 0.08;
      ref.current.rotation.y = s.clock.elapsedTime * 0.1;
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <mesh ref={ref} scale={1.9}>
        <torusKnotGeometry args={[0.8, 0.3, 128, 32, 2, 3]} />
        <MeshTransmissionMaterial {...GLASS_PROPS} />
      </mesh>
    </Float>
  );
}

/* ═══ Knot 2: Cinquefoil — p=3, q=5 (Self-Liquidation) ═══ */
function GlassKnot2() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI * 0.1 + Math.sin(s.clock.elapsedTime * 0.25) * 0.06;
      ref.current.rotation.y = s.clock.elapsedTime * 0.12;
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <mesh ref={ref} scale={1.9}>
        <torusKnotGeometry args={[0.75, 0.28, 128, 32, 3, 5]} />
        <MeshTransmissionMaterial {...GLASS_PROPS} />
      </mesh>
    </Float>
  );
}

/* ═══ Knot 3: Solomon's knot — p=3, q=2 (Leverage) ═══ */
function GlassKnot3() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI * 0.12 + Math.sin(s.clock.elapsedTime * 0.18) * 0.07;
      ref.current.rotation.y = s.clock.elapsedTime * 0.09;
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <mesh ref={ref} scale={1.9}>
        <torusKnotGeometry args={[0.85, 0.25, 128, 32, 3, 2]} />
        <MeshTransmissionMaterial {...GLASS_PROPS} />
      </mesh>
    </Float>
  );
}

/* ═══ Scene wrappers — each with different background shapes ═══ */

function SceneShell({ children, bgShapes }: { children: React.ReactNode; bgShapes: React.ReactNode }) {
  const bp = useBreakpoint();
  const height = bp === 'mobile' ? 200 : bp === 'tablet' ? 240 : 280;

  return (
    <div style={{ width: '100%', height, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ResponsiveCamera desktop={7} mobile={9} />
        <ambientLight intensity={0.6} />
        <directionalLight intensity={0.8} position={[5, 5, 8]} />
        {children}
        {bgShapes}
        <Environment resolution={128}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Lightformer intensity={3} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[50, 2, 1]} />
            <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[50, 2, 1]} />
          </group>
        </Environment>
      </Canvas>
    </div>
  );
}

export function SwapOrb() {
  return (
    <SceneShell bgShapes={<>
      <BgSphere position={[-3.0, 1.3, -1.5]} color="#FF718F" s={0.45} />
      <BgSphere position={[2.8, 1.0, -1]} color="#29C1A2" s={0.35} />
      <BgSphere position={[1.2, -2.2, -1.5]} color="#FF9060" s={0.5} />
      <BgSphere position={[-2.5, -1.8, -0.8]} color="#823FFF" s={0.38} />
    </>}>
      <GlassKnot1 />
    </SceneShell>
  );
}

export function ShieldOrb() {
  return (
    <SceneShell bgShapes={<>
      <BgRoundedCube position={[-2.8, 1.4, -1.5]} color="#FF718F" s={0.5} rotation={[0.3, 0.4, 0.2]} />
      <BgRoundedCube position={[2.6, 0.8, -1]} color="#29C1A2" s={0.4} rotation={[0.5, 0.2, -0.3]} />
      <BgRoundedCube position={[1.0, -2.0, -1.5]} color="#FF9060" s={0.55} rotation={[0.1, 0.6, -0.4]} />
      <BgRoundedCube position={[-2.3, -1.6, -0.8]} color="#823FFF" s={0.42} rotation={[0.4, 0.1, 0.5]} />
    </>}>
      <GlassKnot2 />
    </SceneShell>
  );
}

export function LeverageOrb() {
  return (
    <SceneShell bgShapes={<>
      <BgTriangle position={[-2.9, 1.2, -1.5]} color="#FF718F" s={0.55} rotation={[0.2, 0.3, 0.1]} />
      <BgTriangle position={[2.7, 1.1, -1]} color="#29C1A2" s={0.45} rotation={[0.4, 0.5, -0.2]} />
      <BgTriangle position={[1.3, -2.1, -1.5]} color="#FF9060" s={0.6} rotation={[0.1, 0.2, -0.5]} />
      <BgTriangle position={[-2.4, -1.9, -0.8]} color="#823FFF" s={0.48} rotation={[0.3, 0.1, 0.6]} />
    </>}>
      <GlassKnot3 />
    </SceneShell>
  );
}
