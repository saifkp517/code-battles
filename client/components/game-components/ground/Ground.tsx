import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useEffect, useMemo } from "react";
import { Sky } from "@react-three/drei";

const Ground: React.FC = () => {
  const { scene } = useThree();
  
  // Set a basic background color as fallback
  useEffect(() => {
    // Removing fog for a clearer sky view
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  // Load grass texture
  const grassMap = useLoader(TextureLoader, "/textures/grass.jpg");
  
  // Configure texture with proper settings
  useMemo(() => {
    grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
    grassMap.repeat.set(100, 100);
    // Enable anisotropic filtering for better appearance at angles
    grassMap.anisotropy = 16;
  }, [grassMap]);

  // Sun position parameters
  const sunPosition = useMemo(() => {
    return new THREE.Vector3(100, 10, 100);
  }, []);

  return (
    <>
      {/* Realistic Sky */}
      <Sky 
        distance={450000} 
        sunPosition={sunPosition}
        inclination={0.6} // Time of day (0 to 1)
        azimuth={0.25} // Sun position around horizon
        turbidity={10} // Atmospheric turbidity
        rayleigh={3} // Rayleigh scattering
        mieCoefficient={0.005} // Mie scattering
        mieDirectionalG={0.7} // Mie directional scattering
      />

      {/* Ground with no grid lines */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        receiveShadow
      >
        {/* Using just 1 segment eliminates visible grid lines */}
        <planeGeometry args={[2000, 2000, 1, 1]} />
        <meshStandardMaterial 
          map={grassMap}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.4} color="#D6EAF8" />
      <directionalLight 
        position={sunPosition} 
        intensity={1.5} 
        castShadow 
        color="#FFFAF0"
      >
        <orthographicCamera 
          attach="shadow-camera" 
          args={[-100, 100, 100, -100, 0.1, 200]} 
        />
      </directionalLight>
      
      {/* Additional fill light for better shadows */}
      <hemisphereLight 
        args={["#B3E5FC", "#C5E1A5", 0.3]} 
        position={[0, 50, 0]} 
      />
    </>
  );
};

export default Ground;