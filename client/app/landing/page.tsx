'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import Ground from '@/components/game-components/ground/Ground';
import Enemy from '@/components/game-components/enemy/Enemy';
import Player from '@/components/game-components/player/Player';
import * as THREE from 'three';
import { Stats } from '@react-three/drei';
import socket from '@/lib/socket';


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
      {/* <cylinderGeometry args={[0.75, 0.75, 1.5, 32]} />  */}
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
});


// Main game component
const FirstPersonGame: React.FC = () => {
  const obstacles = useRef<THREE.Mesh[]>([]);
  const [colliding, setColliding] = useState(false);
  const [collisionNormal, setCollisionNormal] = useState<THREE.Vector3 | null>(null);
  const [enemies, setEnemies] = useState<{ [id: string]: THREE.Vector3 }>({});
  const [myPosition, setMyPosition] = useState(new THREE.Vector3(0, 0, 0));
  const [gameStarted, setGameStarted] = useState(false);
  const myId = useRef<string | undefined>(undefined);

  //socket setup
  useEffect(() => {
    socket.on("connect", () => {
      myId.current = socket.id;
    });

    socket.on("currentPlayers", (players) => {
      const filtered = Object.entries(players)
        .filter(([id]) => id !== socket.id)
        .reduce((acc, [id, pos]) => {
          acc[id] = new THREE.Vector3(pos.x, pos.y, pos.z);
          return acc;
        }, {});
      setEnemies(filtered);
    });

    socket.on("newPlayer", ({ id, position }) => {
      if (id !== socket.id) {
        setEnemies((prev) => ({
          ...prev,
          [id]: new THREE.Vector3(position.x, position.y, position.z),
        }));
      }
    });

    socket.on("playerMoved", ({ id, position }) => {
      if (id !== socket.id) {
        setEnemies((prev) => ({
          ...prev,
          [id]: new THREE.Vector3(position.x, position.y, position.z),
        }));
      }
    });

    socket.on("playerDisconnected", (id) => {
      setEnemies((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    return () => {
      socket.off();
    };
  }, []);

  // send my position on change
  useEffect(() => {
    const interval = setInterval(() => {
      socket.emit("updatePosition", {
        x: myPosition.x,
        y: myPosition.y,
        z: myPosition.z,
      });
    }, 50);
    return () => clearInterval(interval);
  }, [myPosition]);

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
  const checkCollisions = (playerPosition: THREE.Vector3) => {
    // Create player hitbox
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      playerPosition,
      new THREE.Vector3(1, 2, 1) // Player size
    );

    // Check collision with each obstacle
    let isColliding = false;
    for (const obstacle of obstacles.current) {
      if (!obstacle) continue;

      const obstacleBox = new THREE.Box3().setFromObject(obstacle);

      if (playerBox.intersectsBox(obstacleBox)) {
        //sliding collision algorithm(to get collision normal)
        let collisionNormal = new THREE.Vector3(0, 0, 0);
        let playerCenter = new THREE.Vector3();
        playerBox.getCenter(playerCenter);

        let obstacleCenter = new THREE.Vector3();
        obstacleBox.getCenter(obstacleCenter);

        let collisionVector = playerCenter.clone().sub(obstacleCenter);
        let absVector = {
          x: Math.abs(collisionVector.x),
          y: Math.abs(collisionVector.y),
          z: Math.abs(collisionVector.z),
        };

        // Find which component has the largest magnitude
        let maxComponent = Math.max(absVector.x, absVector.y, absVector.z);

        // Set the normal based on the dominant axis
        if (maxComponent === absVector.x) {
          collisionNormal.set(Math.sign(collisionVector.x), 0, 0);
        } else if (maxComponent === absVector.y) {
          collisionNormal.set(0, Math.sign(collisionVector.y), 0);
        } else {
          collisionNormal.set(0, 0, Math.sign(collisionVector.z));
        }
        setCollisionNormal(collisionNormal)
        //sliding collision algorithm(to get collision normal)


        isColliding = true
        break;
      }
    }

    setColliding(isColliding);
  };

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

        <Player
          setPosition={setMyPosition}
          onCollision={checkCollisions}
          colliding={colliding}
          collisionNormal={collisionNormal || new THREE.Vector3(0, 0, 0)}
        />
        {Object.entries(enemies).map(([id, pos]) => (
          <Enemy key={id} position={pos} />
        ))}

        {/* Obstacles positioned around the scene */}
        <Obstacle position={[5, 1, 0]} ref={addObstacleRef} />
        <Obstacle position={[-5, 1, 0]} ref={addObstacleRef} />
        <Obstacle position={[0, 1, 5]} ref={addObstacleRef} />
        <Obstacle position={[0, 1, -5]} ref={addObstacleRef} />
        <Obstacle position={[8, 1, 8]} ref={addObstacleRef} />

        {/* Ground */}
        <Ground />
      </Canvas>
    </div>
  );
};

export default FirstPersonGame;