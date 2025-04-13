'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import Player from '@/components/game-components/player/Player';
import * as THREE from 'three';
import { Stats } from '@react-three/drei';
import Ground from '@/components/game-components/ground/Ground';

// Define types for player and obstacle


interface ObstacleProps {
  position: [number, number, number];
}



const Fireball = ({ startPosition, targetPosition, onExplode }: any) => {

  const fireballRef = useRef<THREE.Mesh>(null);
  const [time, setTime] = useState(0);

  // Calculate fireball path (elliptical arc)
  const start = new THREE.Vector3(...startPosition);
  const end = new THREE.Vector3(...targetPosition);
  const mid = new THREE.Vector3().lerpVectors(start, end, 0.5).add(new THREE.Vector3(0, 3, 0)); // Arc peak

  useFrame(() => {
    if (!fireballRef.current) return;

    setTime((prev) => prev + 0.02); // Time progression
    if (time > 1) {
      onExplode(end); // Fireball reaches target, trigger explosion
      return;
    }

    // Quadratic Bézier curve (parabolic arc)
    const newPosition = new THREE.Vector3()
      .lerpVectors(start, mid, time)
      .lerp(end, time);

    fireballRef.current.position.copy(newPosition);
  });

  return (
    <mesh ref={fireballRef} position={start}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial emissive="orange" color="red" />
    </mesh>
  );
};



// Obstacle component with forwarded ref using a Cylinder
const Obstacle = React.forwardRef<THREE.Mesh, ObstacleProps>(({ position }, ref) => {
  return (
    <mesh ref={ref} position={position}>
      {/* <cylinderGeometry args={[1.75, 1.75, 1.5, 32]} />  */}
      <sphereGeometry args={[1.75]} />
      {/* <boxGeometry args={[10, 3, 3]} /> */}
      <meshStandardMaterial color="red" />
    </mesh>
  );
});


// Main game component
const FirstPersonGame: React.FC = () => {
  const obstacles = useRef<THREE.Mesh[]>([]);
  const [gameStarted, setGameStarted] = useState(false);


  // Setup obstacle references
  useEffect(() => {
    obstacles.current = [];
  }, []);

  // Add an obstacle to the collection
  const addObstacleRef = (ref: THREE.Mesh | null) => {
    if (ref && !obstacles.current.includes(ref)) {
      obstacles.current.push(ref);
    }
  };


  // Check for collisions with all obstacles


  const playerRef = useRef<THREE.Vector3>(null); // for storing latest position if needed


  return (
    <div className="w-full h-screen relative">
      {/* {!gameStarted ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h2 className="text-2xl mb-4">First-Person Collision Detection</h2>
            <p className="mb-4">Click to start. Use WASD to move and mouse to look around.</p>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setGameStarted(true)}
            >
              Start Game
            </button>
          </div>
        </div>
      ) : null} */}

      {/* Instructions */}
      {/* <div className="absolute top-4 left-4 bg-white text-black p-2 z-10">
        <p>WASD to move, Mouse to look</p>
        <p className="text-sm">Press ESC to release mouse</p>
      </div> */}

      <Canvas camera={{ position: [0, 1.6, 0], fov: 75 }}>
        <Stats />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <gridHelper args={[50, 50]} />

        <Ground>
          <Player obstacles={obstacles} />

          <Obstacle position={[15, 1, 0]} ref={addObstacleRef} />
          <Obstacle position={[-15, 1, 0]} ref={addObstacleRef} />
          <Obstacle position={[10, 1, 5]} ref={addObstacleRef} />
          <Obstacle position={[10, 1, -5]} ref={addObstacleRef} />
          <Obstacle position={[18, 1, 8]} ref={addObstacleRef} />
        </Ground>
      </Canvas>
    </div>
  );
};

export default FirstPersonGame;