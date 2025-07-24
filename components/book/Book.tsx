import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { pageAtom, pages } from './book-asset/pages';
import { Environment, OrbitControls, useTexture } from '@react-three/drei';
import { degToRad } from 'three/src/math/MathUtils.js';
import { useAtom } from 'jotai';
import { easing } from 'maath';
import styles from './book.module.css';
type PageProps = {
  rotation?: number;
  number?: number;
  data?: any;
  front?: string;
  back?: string;
  page?: number;
  opened?: boolean;
  bookClosed?: boolean;
  isCover?: boolean;
};

//set up before page
  //page turning animation
  const insideCurveStrength = 0.16; // Adjust this value to control the strength
  const outsideCurveStrength = 0.03;
  const turningCurveStrength = 0.09; // Adjust this value to control the strength of the turning curve
  const EASING_FACTOR = 0.5; // Adjust this value to control the smoothness of the rotation
  const EASING_FOLD_FACTOR = 0.3; // Adjust this value to control the smoothness of the fold rotation
  //page geometry
  const PAGE_WIDTH = 1.28;
  const PAGE_HEIGHT = 1.71;
  const PAGE_THICKNESS = 0.003;
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
  const coverPageGeometry = new THREE.BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_THICKNESS * 10, // Double thickness for the cover
    PAGE_SEGMENT_COUNT,
    PAGE_SEGMENT_HEIGHT
  )
  //translate the geometry to the center of the page
  pageGeometry.translate( PAGE_WIDTH / 2, 0, 0);
  coverPageGeometry.translate( PAGE_WIDTH / 2, 0, 0);
  const position = pageGeometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndices = []; //bones indices
  const skinWeights = [];
//bones weights

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
  coverPageGeometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  coverPageGeometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  // Set up materials for the pages
  //using white color for the pages, and black for the back of the book
  const whiteColor = new THREE.Color('white');
  const pageMaterials = [
    new THREE.MeshStandardMaterial({ color: whiteColor}),
    new THREE.MeshStandardMaterial({ color: '#111'}),
    new THREE.MeshStandardMaterial({ color: whiteColor}),
    new THREE.MeshStandardMaterial({ color: whiteColor}),
  ];
  const coverMaterial = [
     new THREE.MeshStandardMaterial({ color: whiteColor}),
    new THREE.MeshStandardMaterial({ color: '#111'}),
    new THREE.MeshStandardMaterial({ color: whiteColor}),
    new THREE.MeshStandardMaterial({ color: whiteColor}),
        new THREE.MeshStandardMaterial({ color: whiteColor}),
    new THREE.MeshStandardMaterial({ color: whiteColor}),
  ]
  pages.forEach((page, index) => {
    useTexture.preload(`textures/${page.front}.jpg`);
    useTexture.preload(`textures/${page.back}.jpg`);
    useTexture.preload(`textures/book-cover-roughness.jpg`);
  })

const Page: React.FC<PageProps> = ({ number = 0, data, front, back, page = 0, opened = false, bookClosed = false}) => {
  const isCover = number === 0 || number === pages.length - 1;
  //tried moving textures to the same folder, still have problem loading the pictures
  const [picture, picture2, pictureRoughness] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
   ...(
    number === 0 || number === pages.length - 1 ?
     [`/textures/book-cover-roughness.jpg`] : []
   )
  ])
  //to set the color space of the textures to sRGB, changing them from  too bright to normal colorating
  picture.colorSpace = picture2.colorSpace = THREE.SRGBColorSpace
  const ref = useRef<THREE.Mesh>(null);
  const turnedAt = useRef<number>(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef<THREE.SkinnedMesh>(null);
  const manualSkinnedMesh = useMemo(() => {
    //COVER PAGE
    if (isCover) {
      const coverMesh = new THREE.Mesh(coverPageGeometry, coverMaterial);
      coverMesh.castShadow = true;
      coverMesh.receiveShadow = true;
      return coverMesh;
    }
    //REGULAR PAGE
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
    // Create a skinned mesh with the page geometry and the skeleton
    // Use the pageGeometry and coverPageGeometry based on the page number
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
              roughness: 1,
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
     
    let mesh: THREE.SkinnedMesh = new THREE.SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false; // Disable frustum culling for the mesh, what is this? https://threejs.org/docs/#api/en/core/Object3D.frustumCulled
    mesh.add(skeleton.bones[0]); // Add the first bone to the mesh
    mesh.bind(skeleton);
    return mesh;
  }, []);

 
  //Make the page turn one by one using the useFrame hook, the book has skeleton animation, so we can use the skinned mesh to animate the page turning
  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    if(lastOpened.current !== opened) {
      turnedAt.current = + new Date();//the plus sign here is to get the timestamp value
      lastOpened.current = opened;
    }
    const newDate = + new Date();
    const dateDifference = newDate - turnedAt.current;
    let turningTime = Math.min(400, dateDifference) / 400;;
     turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2  ; // If the book is opened, rotate to 90 degrees, otherwise reset to 0
    if(!bookClosed){
      targetRotation += degToRad(number * 0.8);
    }
     if (isCover) {
      // For covers, simple rotation without bending
      if (ref.current) {
         easing.dampAngle(
          ref.current.rotation,
          'y',
          targetRotation,
          0.3, // Slower easing for more solid feel
          delta
        );
      }
      return;
    }
    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? ref.current : bones[i];
      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity = Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
      let rotationAngle = insideCurveStrength * insideCurveIntensity * targetRotation - outsideCurveStrength * outsideCurveIntensity * targetRotation  +
      turningCurveStrength * turningIntensity * targetRotation 
      ;
      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);//the sign function returns -1 or 1 depending on the sign of the targetRotation
      if (!target) continue; // Skip if the target is not defined
      if( bookClosed ) {
        if(i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
        }
      }
      //dampAngle is a function from maath library that smoothly interpolates the rotation of the bones
      easing.dampAngle(
        target.rotation, 
        'y', 
        rotationAngle, 
        EASING_FACTOR,
        delta
      ); // Smoothly interpolate the rotation of the first bone
      const foldIntensity = i > 8 ? Math.sin(i * Math.PI * ( 1/ bones.length) - 0.5) * turningTime : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        EASING_FOLD_FACTOR,
        delta
      )
    }
    
  });
  
  //const pageDepth = number === 0 || number === pages.length - 1 ? PAGE_THICKNESS * 10 : PAGE_THICKNESS;
  const pageDepth = PAGE_THICKNESS;
  useEffect(()=>{
    return () => {
      // Clean up the skinned mesh reference when the component unmounts
      if (skinnedMeshRef.current) {
        skinnedMeshRef.current.geometry.dispose();
        skinnedMeshRef.current.clear();
      }
      if (manualSkinnedMesh) {
        manualSkinnedMesh.geometry.dispose();
      }
      manualSkinnedMesh.clear();
    }
  },[])
  return (
     
    <group ref={ref} >
      <primitive 
        object={manualSkinnedMesh} 
        ref={skinnedMeshRef} 
        position-z={
          -number * pageDepth + page * pageDepth
        }
        />
    </group>
  );
};

const Book: React.FC = () => {
  const [page, setPage] = useAtom(pageAtom);
  const [pageList, setPageList] = useState<PageProps[]>(pages);
  // Spine parameters
  const SPINE_RADIUS = PAGE_THICKNESS * pages.length * 0.5;
  const SPINE_HEIGHT = PAGE_HEIGHT;
  const SPINE_SEGMENTS = 32;
  const SPINE_ANGLE = Math.PI * .75; // 90 degrees of arc

  // Calculate spine position based on book thickness
  const totalBookThickness = PAGE_THICKNESS * pages.length;
  const spineOffset = totalBookThickness * 0.5;

  // Create curved spine geometry
  const spineGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(
      SPINE_RADIUS,
      SPINE_RADIUS,
      SPINE_HEIGHT,
      SPINE_SEGMENTS,
      1,
      true, // Open ended
      Math.PI *1.2 , // Start angle
      SPINE_ANGLE // Arc length
    );
    
    return geometry;
  }, []);

  const spineMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.7,
    metalness: 0.2,
    side: THREE.DoubleSide
  }), []);




  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const turnThePage = () => { 
      setPage((prevPage) => {
        const virtualPage = (prevPage >= pages.length - 1) ? 0 : prevPage + 1;
        return virtualPage;
      });


  }

  const movePageTo = (pageNumber: number, destination?: number) => {
    if(!destination){
      //move to the end of the book
      const tempList = [...pageList];
      //take the current page and move it to the end of the book
      const currentPage = tempList.splice(pageNumber, 1);
      //add the current page to the one before the last page
      tempList.splice(tempList.length - 2, 0, currentPage[0]);
      setPageList(tempList);
    } else {
      //move the page to the destination
      const tempList = [...pageList];
      const currentPage = tempList.splice(pageNumber, 1);
      tempList.splice(destination, 0, currentPage[0]);
      setPageList(tempList);
    }
  }
  const animatePage = () => {
        const halfway = Math.floor(pages.length / 2);
        setPage(halfway);
        timerRef.current = setInterval(turnThePage, 3000);
        return () => {
          if (timerRef.current) clearInterval(timerRef.current);
        };
  }
  
  useEffect(() => {
    animatePage();
    //clear the canvas when the component unmounts
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      
    }
  },[]);
  useEffect(()=>{
    movePageTo(page);
  },[page])
  return (
      <group>
        {/* SPINE */}
          <mesh
          geometry={spineGeometry}
          material={spineMaterial}
          position={[-spineOffset, 0, 0]} // Position between covers
          castShadow
          />
        {/* PAGES */}
        {
          pageList.map((pageD, index) => (
            <Page 
              key={page} 
              page={page} 
              opened={page > index}  
              number={index} 
              front={pageD.front} 
              bookClosed={
                page === 0 || page === pages.length - 1
              }  
              back={pageD.back} />
              
          )) 

        }
      </group>
  );
};

const BookLoader: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <Canvas>
          <OrbitControls />
          <Book />
            <Environment preset="studio"></Environment>
          <directionalLight 
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
          />
           <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial transparent opacity={0.2} />
          </mesh>
      </Canvas>
    </div>
  );
};

export default BookLoader;