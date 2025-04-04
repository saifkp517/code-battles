// Player component
import React, { useRef, useState, useEffect } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import Explosion from '../explosion/Explosion';
import * as THREE from 'three';

interface PlayerProps {
    onCollision: (playerPosition: THREE.Vector3, playerDirection: THREE.Vector3) => void;
    colliding: boolean;
    collisionNormal: THREE.Vector3;
}

type FireballProps = {
    position: THREE.Vector3;
    direction: THREE.Vector3;
    speed?: number;
    obstacles?: THREE.Mesh[];
    onExplode: (position: THREE.Vector3) => void;
};

const Fireball: React.FC<FireballProps> = ({ position, direction, speed = 2, obstacles = [], onExplode }) => {
    const fireballRef = useRef<THREE.Mesh>(null);
    const startTime = useRef<number>(Date.now());
    const velocity = direction.clone().normalize().multiplyScalar(speed);

    const gravity = 9.8; // Gravity constant (adjust for desired arc height)
    const initialYVelocity = 5;

    useFrame(() => {
        if (!fireballRef.current) return;

        const elapsedTime = (Date.now() - startTime.current) / 1000;

        // Elliptical motion formula
        fireballRef.current.position.x += velocity.x;
        fireballRef.current.position.z += velocity.z;

        fireballRef.current.position.y = velocity.y + 1 +
            (initialYVelocity * elapsedTime) -
            (gravity * elapsedTime * elapsedTime);

        // Collision detection with ground and obstacles
        const fireballPosition = fireballRef.current.position.clone();

        if (fireballPosition.y <= 0) {
            onExplode(fireballPosition);
            return;
        }

        for (const obstacle of obstacles) {
            if (fireballPosition.distanceTo(obstacle.position) < 1.5) {
                onExplode(fireballPosition);
                return;
            }
        }
    });

    return (
        <mesh ref={fireballRef} position={position} castShadow>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial emissive={"orange"} emissiveIntensity={2} color="red" />
        </mesh>
    );
};


const Player: React.FC<PlayerProps> = ({ onCollision, colliding, collisionNormal }) => {
    const { camera } = useThree();
    const playerRef = useRef<THREE.Mesh>(null);
    const [isJumping, setIsJumping] = useState(false);
    const [fireballs, setFireballs] = useState<{ id: number; position: THREE.Vector3; direction: THREE.Vector3 }[]>([]);
    const [explosions, setExplosions] = useState<{ id: number; position: THREE.Vector3 }[]>([]);

    const handleShoot = () => {
        if (!playerRef.current) return;

        const startPosition = playerRef.current.position.clone();

        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        console.log(cameraDirection)
        const newFireball = {
            id: Date.now(),
            position: startPosition, // Player's position
            direction: cameraDirection, // Forward direction
        };
        setFireballs((prev) => [...prev, newFireball]);

    };

    const handleExplosion = (position: THREE.Vector3) => {
        setFireballs((prev) => prev.slice(1)); // Remove the first fireball
        setExplosions((prev) => [...prev, { id: Date.now(), position }]);

        // Remove explosion after a second
        setTimeout(() => {
            setExplosions((prev) => prev.filter((exp) => exp.id !== position.length()));
        }, 1000);
    };

    const gravity = -9.8 * 2;
    const jumpStrength = 5;

    const speed = 20;

    const controlsRef = useRef<any>(null);

    const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
    const direction = useRef<THREE.Vector3>(new THREE.Vector3());
    const [moveState, setMoveState] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false
    });




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
        document.addEventListener('mousedown', handleShoot)

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.addEventListener('mousedown', handleShoot)
        };
    }, []);

    const previousPosition = useRef<THREE.Vector3>(new THREE.Vector3());

    // Move player based on keyboard input and check collisions
    useFrame((_, delta) => {
        if (!controlsRef.current?.isLocked) return;

        previousPosition.current.copy(camera.position);

        if (playerRef.current) {
            playerRef.current.position.copy(camera.position);
        }


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
            {fireballs.map((fireball) => (
                <Fireball
                    key={fireball.id}
                    position={fireball.position}
                    direction={fireball.direction}
                    obstacles={[]} // Pass obstacle references here
                    onExplode={handleExplosion}
                />
            ))}

            {explosions.map((explosion) => (
                <Explosion key={explosion.id} position={explosion.position} />
            ))}
            <group ref={playerRef} position={camera.position}>
                {/* Player hitbox - invisible but used for collision detection */}
                <mesh visible={false} position={[0, -1, 0]}>

                    <boxGeometry args={[1, 2, 1]} />
                </mesh>
            </group>
        </>
    );
};

export default Player;