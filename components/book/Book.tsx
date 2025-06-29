import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { pages } from './book-asset/pages';

type PageProps = {
  rotation?: number;
  number?: number;
  data?: any;
};

//set up before page
  const PAGE_WIDTH = 1;
  const PAGE_HEIGHT = 1.5;
  const PAGE_THICKNESS = 0.01;
  const PAGE_SEGMENT_COUNT = 30;
  const PAGE_SEGMENT_HEIGHT = 2;
  const PAGE_SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENT_COUNT;
  const pageGeometry = new THREE.BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_THICKNESS,
    PAGE_SEGMENT_COUNT,
    PAGE_SEGMENT_HEIGHT
  );
  
  pageGeometry.translate( PAGE_WIDTH / 2, 0, 0);

  const position = pageGeometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndices = []; //bones indices
  const skinWeights = [];
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;
    const skinIndex =Math.max(0, Math.floor(x / PAGE_SEGMENT_WIDTH));
    let skinWeight = (x % PAGE_SEGMENT_WIDTH) / PAGE_SEGMENT_WIDTH;
    
    skinIndices.push(skinIndex, skinIndex + 1, 0, 0);//only pusing two bones per vertex
    skinWeights.push(1- skinWeight, skinWeight, 0, 0);
  }
  pageGeometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  pageGeometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  const whiteColor = new THREE.Color('white');
  const pageMaterials = [
    new THREE.MeshStandardMaterial({ color: whiteColor}),
    new THREE.MeshStandardMaterial({ color: '#111'}),
    new THREE.MeshStandardMaterial({ color: whiteColor}),
    new THREE.MeshStandardMaterial({ color: whiteColor}),
    new THREE.MeshStandardMaterial({ color: 'pink'}),//front face of book
    new THREE.MeshStandardMaterial({ color: 'blue'}), //back face of book
  ];

const Page: React.FC<PageProps> = () => {
  const ref = useRef<THREE.Mesh>(null);

  const skinnedMeshRef = useRef<THREE.SkinnedMesh>(null);
  
  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENT_COUNT; i++) {
      const bone = new THREE.Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = PAGE_SEGMENT_WIDTH; 
      }
      if (i > 0) {
        bones[i - 1].add(bone); // link the bone to the previous one
      }
    }
    
    const skeleton = new THREE.Skeleton(bones);

    const materials = pageMaterials;
    
    const mesh = new THREE.SkinnedMesh(pageGeometry, materials);
    if(!mesh) {
      return {};
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false; // Disable frustum culling for the mesh, what is this? https://threejs.org/docs/#api/en/core/Object3D.frustumCulled
    mesh.add(skeleton.bones[0]); // Add the first bone to the mesh
    mesh.bind(skeleton);
    return mesh;
  }, []);
  useFrame(() => {
 if (!skinnedMeshRef.current) return;

  const bones = skinnedMeshRef.current.skeleton.bones;
  const time = Date.now() * 0.001;

  // Animate bones (e.g., page wave effect)
  bones.forEach((bone, i) => {
    if (i > 0) {
      bone.rotation.z = Math.sin(time + i * 0.2) * 0.1;
    }
    // Explicitly update matrix
    bone.updateMatrixWorld(); // ✅ Critical fix!
  });
  });

  return (
    <group ref={ref}>
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} />
    </group>
  );
};

const Book: React.FC = () => {
  return (
    <group>
      <group>
        {
          [...pages].map((pageD, index) => (
            <Page key={index} number={index} data={pageD} />
          ))
        }
      </group>
    </group>
  );
};

const BookLoader: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <Canvas>
          <Book />
      </Canvas>
    </div>
  );
};

export default BookLoader;