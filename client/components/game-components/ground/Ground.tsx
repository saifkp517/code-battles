import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, forwardRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { Sky } from "@react-three/drei";



const Ground = forwardRef<THREE.Mesh, { children?: React.ReactNode }>((props, ref) => {
  const { scene } = useThree();

  const grassMap = useLoader(TextureLoader, "/textures/grass.jpg");

  const getGroundHeight = (x: number, z: number): number => {
    // Simple procedural function – tweak per terrain type
    const frequency = 0.1;
    const amplitude = 1;
    return Math.sin(x * frequency) * Math.cos(z * frequency) * amplitude;
  };

  useEffect(() => {
    scene.fog = null;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useMemo(() => {
    grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
    grassMap.repeat.set(100, 100);
    grassMap.anisotropy = 16;
  }, [grassMap]);

  const sunPosition = useMemo(() => new THREE.Vector3(100, 10, 100), []);

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={sunPosition}
        inclination={0.6}
        azimuth={0.25}
        turbidity={10}
        rayleigh={3}
        mieCoefficient={0.005}
        mieDirectionalG={0.7}
      />

      {/* GROUND MESH */}
      <mesh
        ref={ref}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[2000, 2000, 128, 128]} />
        <meshStandardMaterial map={grassMap} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* LIGHTING */}
      <ambientLight intensity={0.4} color="#D6EAF8" />
      <directionalLight position={sunPosition} intensity={1.5} castShadow color="#FFFAF0">
        <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100, 0.1, 200]} />
      </directionalLight>
      <hemisphereLight args={["#B3E5FC", "#C5E1A5", 0.3]} position={[0, 50, 0]} />

      {/* CHILDREN LIKE PLAYER + OBSTACLES */}
      {props.children}
    </>
  );
});

export default Ground;
