import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

type PageProps = {
  rotation: number;
};

const Page: React.FC<PageProps> = ({ rotation }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime()) * rotation;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0.01]}>
      <boxGeometry args={[1, 1.5, 0.01]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
};

const Book: React.FC = () => {
  return (
    <group>
      {/* Book cover (back) */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[1, 1.5, 0.02]} />
        <meshStandardMaterial color="#5a3e2b" />
      </mesh>

      {/* Animated page */}
      <Page rotation={0.5} />
    </group>
  );
};

const BookLoader: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
        <Book />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate />
      </Canvas>
    </div>
  );
};

export default Book;