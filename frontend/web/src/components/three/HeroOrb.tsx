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

function GlassTorus() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI * 0.15 + Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <mesh ref={ref} scale={1.9}>
        <torusGeometry args={[1, 0.42, 64, 128]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          resolution={256}
          transmission={0.95}
          roughness={0.4}
          clearcoat={0.1}
          clearcoatRoughness={0.1}
          thickness={1.2}
          backsideThickness={0.8}
          ior={1.5}
          chromaticAberration={0.8}
          anisotropy={0.5}
          color="#ffffff"
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

function Capsule({ position, color, scaleX = 1, scaleY = 1, scaleZ = 1, rotation = [0, 0, 0] }: {
  position: [number, number, number]; color: string;
  scaleX?: number; scaleY?: number; scaleZ?: number;
  rotation?: [number, number, number];
}) {
  return (
    <Float speed={1.8} rotationIntensity={0.1} floatIntensity={0.8}>
      <mesh position={position} rotation={rotation} scale={[scaleX, scaleY, scaleZ]}>
        <capsuleGeometry args={[0.35, 1.2, 16, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} toneMapped={false} />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  const bp = useBreakpoint();
  const height = bp === 'mobile' ? 320 : bp === 'tablet' ? 460 : 640;

  return (
    <div style={{ width: '100%', height, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#FEF4EF']} />
        <ResponsiveCamera desktop={8.5} mobile={11} />
        <ambientLight intensity={0.6} />
        <directionalLight intensity={0.8} position={[5, 5, 8]} />

        <GlassTorus />

        {/* Colored capsules — spread around the dominant torus */}
        <Capsule position={[-3.2, 1.5, -1.5]} color="#FF718F" scaleX={1.1} scaleY={0.9} scaleZ={1.1} rotation={[0, 0, 0.3]} />
        <Capsule position={[-2.0, 2.8, -1]} color="#29C1A2" scaleX={0.9} scaleY={0.85} scaleZ={0.9} rotation={[0.2, 0.3, -0.2]} />
        <Capsule position={[1.3, -2.6, -1.5]} color="#FF9060" scaleX={1.2} scaleY={0.8} scaleZ={0.9} rotation={[0, 0, -0.5]} />
        <Capsule position={[-1.4, -2.8, -0.8]} color="#823FFF" scaleX={0.9} scaleY={0.9} scaleZ={0.9} rotation={[0.1, 0, 0.6]} />
        <Capsule position={[3.0, 1.2, -1]} color="#8ECAE6" scaleX={1.1} scaleY={0.9} scaleZ={1.0} rotation={[0, 0.2, -0.15]} />

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
