import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { pages } from './book-asset/pages';
import { useHelper, useTexture } from '@react-three/drei';

type PageProps = {
  rotation?: number;
  number?: number;
  data?: any;
  front?: string;
  back?: string;
};

//set up before page
  const PAGE_WIDTH = 1;
  const PAGE_HEIGHT = 1.5;
  const PAGE_THICKNESS = 0.01;
  const PAGE_SEGMENT_COUNT = 3;
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
    let skinIndex =Math.max(0, Math.floor(x / PAGE_SEGMENT_WIDTH));
    if (skinIndex >= PAGE_SEGMENT_COUNT) skinIndex = PAGE_SEGMENT_COUNT - 1;
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
  ];

const Page: React.FC<PageProps> = ({ number, data, front, back}) => {
  //tried moving textures to the same folder, still have problem loading the pictures
  const [picture, picture2, pictureRoughness] = useTexture([
    `./textures/${front}.jpg`,
    `./textures/${back}.jpg`,
   ...(
    number === 0 || number === pages.length - 1 ?
     [`./textures/book-cover-roughness.jpg`] : []
   )
  ])
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
    const materials = [...pageMaterials,
      new THREE.MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        ...(
          number === 0 
          ? {
            roughnessMap: pictureRoughness,
            } 
          : {
              roughness: 0.1,
            }
         )
      }),
      new THREE.MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        ...(
          number === pages.length - 1 
          ? {
            roughnessMap: pictureRoughness,
            } 
          : {
              roughness: 0.1,
            }
         )
      })
     ];
    const mesh: THREE.SkinnedMesh = new THREE.SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false; // Disable frustum culling for the mesh, what is this? https://threejs.org/docs/#api/en/core/Object3D.frustumCulled
    mesh.add(skeleton.bones[0]); // Add the first bone to the mesh
    mesh.bind(skeleton);
    return mesh;
  }, []);

 
  //Make the page turn one by one using the useFrame hook, the book has skeleton animation, so we can use the skinned mesh to animate the page turning
  useFrame((state, delta) => {
    if (!manualSkinnedMesh) return;
    if (!skinnedMeshRef.current) return;
    // Rotate the page around the y-axis, simulating a page turn
    // Limit the rotation to 90 degrees (PI/2 radians)
    //animate the page turning with bones and skeleton
    if (skinnedMeshRef.current.skeleton) {
      const bones = skinnedMeshRef.current.skeleton.bones;
      for (let i = 0; i < bones.length; i++) {
        bones[i].rotation.y += delta;
        bones[i].rotation.y = Math.min(bones[i].rotation.y, Math.PI / 2); // Limit the rotation to 90 degrees
        //page only turns and fold like snapping
      }
    }
    if (skinnedMeshRef.current) {
      skinnedMeshRef.current.rotation.y += delta;
      skinnedMeshRef.current.rotation.y = Math.min(skinnedMeshRef.current.rotation.y, Math.PI / 2); // Limit the rotation to 90 degrees
    }
  });
    
  return (
    manualSkinnedMesh &&
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
            <Page key={index} number={index} front={pageD.front} back={pageD.back} />
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
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <camera position={[0, 0, 5]}  />
      </Canvas>
    </div>
  );
};

export default BookLoader;