'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

// Define types for player and obstacle
interface PlayerProps {
  onCollision: (playerPosition: THREE.Vector3, playerDirection: THREE.Vector3) => void;
  colliding: boolean;
  collisionNormal: THREE.Vector3;
  shootFireball: any
}

interface ObstacleProps {
  position: [number, number, number];
}

type Fireball = {
  id: number;
  start: [number, number, number]; // XYZ position
  target: [number, number, number]; // XYZ target position
};



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

// Player component
const Player: React.FC<PlayerProps> = ({ onCollision, colliding, collisionNormal, shootFireball }) => {
  const { camera } = useThree();
  const playerRef = useRef<THREE.Mesh>(null);
  const [isJumping, setIsJumping] = useState(false);

  const gravity = -9.8 * 2;
  const jumpStrength = 5;

  const speed = 5;

  const controlsRef = useRef<any>(null);

  const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const direction = useRef<THREE.Vector3>(new THREE.Vector3());
  const [moveState, setMoveState] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  const handleShoot = () => {
    if (!playerRef.current) return;

    const startPosition = playerRef.current.position.clone();
    const targetPosition = startPosition.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(10)); // Fireball moves forward

    shootFireball(startPosition, targetPosition);
  };


  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setMoveState(prev => ({ ...prev, forward: true })); break;
        case 'KeyS': setMoveState(prev => ({ ...prev, backward: true })); break;
        case 'KeyA': setMoveState(prev => ({ ...prev, left: true })); break;
        case 'KeyD': setMoveState(prev => ({ ...prev, right: true })); break;
        case 'Space':
          if (!isJumping) {
            velocity.current.y = jumpStrength;
            setIsJumping(true);
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyQ': handleShoot(); break;
        case 'KeyW': setMoveState(prev => ({ ...prev, forward: false })); break;
        case 'KeyS': setMoveState(prev => ({ ...prev, backward: false })); break;
        case 'KeyA': setMoveState(prev => ({ ...prev, left: false })); break;
        case 'KeyD': setMoveState(prev => ({ ...prev, right: false })); break;
        case 'Space':
          if (!isJumping) {
            velocity.current.y = jumpStrength;
            setIsJumping(true);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const previousPosition = useRef<THREE.Vector3>(new THREE.Vector3());

  // Move player based on keyboard input and check collisions
  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    previousPosition.current.copy(camera.position);

    const currentPosition = camera.position.clone();

    // Calculate movement direction based on camera orientation
    direction.current.z = Number(moveState.forward) - Number(moveState.backward);
    direction.current.x = Number(moveState.right) - Number(moveState.left);
    direction.current.normalize();

    // Apply movement in the camera direction
    const frontVector = new THREE.Vector3(0, 0, Number(moveState.forward) - Number(moveState.backward));
    const sideVector = new THREE.Vector3(Number(moveState.left) - Number(moveState.right), 0, 0);

    // Combine and normalize movement vector
    const moveVector = frontVector.add(sideVector).normalize().multiplyScalar(speed * delta);

    // Get camera direction (excluding y-axis)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    // Calculate movement in camera space
    const moveQuat = new THREE.Quaternion();
    moveQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cameraDirection);
    moveVector.applyQuaternion(moveQuat);

    // Update camera position
    camera.position.add(moveVector);

    // Apply gravity
    velocity.current.y += gravity * delta;
    camera.position.y += velocity.current.y * delta;

    // Prevent falling below ground (y = 1 is ground level)
    if (camera.position.y < 1) {
      camera.position.y = 1;
      velocity.current.y = 0;
      setIsJumping(false);
    }

    // Create player "body" at camera position (slightly lower)
    const playerPosition = camera.position.clone();
    playerPosition.y -= 1; // Player body is below camera (eye level)

    // If collision detected, revert to previous position COMPLETELY
    if (colliding) {
      // Revert to previous position first
      camera.position.copy(currentPosition);

      // Make sure collisionNormal is normalized
      const normal = collisionNormal.clone().normalize();
      const pushDistance = 0.001; // Very small value
      camera.position.addScaledVector(normal, pushDistance);

      // Calculate how much of the movement is in the direction of the collision
      const dotProduct = moveVector.dot(normal);

      // Only remove the component in the direction of the collision
      // This creates a sliding effect along the surface
      if (dotProduct < 0) {
        // Create the sliding vector by removing the collision component
        const slide = moveVector.clone().addScaledVector(normal, -dotProduct);

        // Apply the sliding movement
        camera.position.add(slide)

        // Double-check that this new position doesn't cause another collision
        // If it does, you might need to simply revert to the original position
        // This part depends on your collision detection system
      }
    }
    onCollision(playerPosition, cameraDirection);
  });

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      <group ref={playerRef} position={camera.position}>
        {/* Player hitbox - invisible but used for collision detection */}
        <mesh visible={false} position={[0, -1, 0]}>
          <boxGeometry args={[1, 2, 1]} />
        </mesh>
      </group>
    </>
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
  const [fireballs, setFireballs] = useState<Fireball[]>([]);
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

  const shootFireball = (startPosition: [number, number, number], targetPosition: [number, number, number]): void => {
    setFireballs((prev: Fireball[]) => [
      ...prev,
      { id: Date.now(), start: startPosition, target: targetPosition },
    ]);
  };


  // Check for collisions with all obstacles
  const checkCollisions = (playerPosition: THREE.Vector3, playerDirection: THREE.Vector3) => {
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
        let collisionNormal = new THREE.Vector3(0, 0, 0);
        let playerCenter = new THREE.Vector3();
        playerBox.getCenter(playerCenter);

        let obstacleCenter = new THREE.Vector3();
        obstacleBox.getCenter(obstacleCenter);

        let collisionVector = playerCenter.clone().sub(obstacleCenter);
        if (Math.abs(collisionVector.x) > Math.abs(collisionVector.z)) {
          collisionNormal.set(Math.sign(collisionVector.x), 0, 0); // Collision on X-axis
        } else {
          collisionNormal.set(0, 0, Math.sign(collisionVector.z)); // Collision on Z-axis
        }
        setCollisionNormal(collisionNormal)
        isColliding = true
        break;
      }
    }

    setColliding(isColliding);
  };

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

      <div className="absolute top-4 left-4 bg-white text-black p-2 z-10">
        <h2 className="text-lg font-bold">
          Status: {colliding ? "Collision Detected!" : "No Collision"}
        </h2>
        <p>WASD to move, Mouse to look</p>
        <p className="text-sm">Press ESC to release mouse</p>
      </div>

      <Canvas camera={{ position: [0, 1.6, 0], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <gridHelper args={[50, 50]} />

        <Player
          onCollision={checkCollisions}
          colliding={colliding}
          collisionNormal={collisionNormal || new THREE.Vector3(0, 0, 0)}
          shootFireball={shootFireball}
        />

        {/* Obstacles positioned around the scene */}
        <Obstacle position={[5, 1, 0]} ref={addObstacleRef} />
        <Obstacle position={[-5, 1, 0]} ref={addObstacleRef} />
        <Obstacle position={[0, 1, 5]} ref={addObstacleRef} />
        <Obstacle position={[0, 1, -5]} ref={addObstacleRef} />
        <Obstacle position={[8, 1, 8]} ref={addObstacleRef} />

        {/* Ground */}

        {/* Fireballs */}
        {fireballs.map((fireball) => (
          <Fireball
            key={fireball.id}
            startPosition={fireball.start}
            targetPosition={fireball.target}
            onExplode={(impactPosition: any) =>
              setFireballs((prev) => prev.filter((f) => f.id !== fireball.id))
            }
          />
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="green" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default FirstPersonGame;