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
    setPosition: any
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

    const gravity = 9.8 / 4; // Gravity constant (adjust for desired arc height)



    useFrame(() => {
        if (!fireballRef.current) return;

        const elapsedTime = (Date.now() - startTime.current) / 1000;

        const initialPosition = fireballRef.current.position.clone();
        const initialVelocity = direction.clone().multiplyScalar(speed);

        // x and z are linear motion
        fireballRef.current.position.x = initialPosition.x + initialVelocity.x * elapsedTime;
        fireballRef.current.position.z = initialPosition.z + initialVelocity.z * elapsedTime;

        // y is affected by gravity (parabolic arc)
        fireballRef.current.position.y = initialPosition.y +
            initialVelocity.y * elapsedTime -
            0.5 * gravity * elapsedTime * elapsedTime;

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


const Player: React.FC<PlayerProps> = ({ onCollision, colliding, collisionNormal, setPosition }) => {
    const { camera } = useThree();
    const playerRef = useRef<THREE.Mesh>(null);
    const isOnGround = useRef(false);
    const isJumpingRef = useRef(false);
    const [fireballs, setFireballs] = useState<{ id: number; position: THREE.Vector3; direction: THREE.Vector3 }[]>([]);
    const [explosions, setExplosions] = useState<{ id: number; position: THREE.Vector3 }[]>([]);

    const handleShoot = () => {
        if (!playerRef.current) return;

        const startPosition = playerRef.current.position.clone();

        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
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
    const jumpStrength = 10;

    const playerSpeed = 5;

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
                    // if (!isJumpingRef.current && camera.position.y <= 1.05) {
                    if (!isJumpingRef.current) {
                        velocity.current.y = jumpStrength;
                        isJumpingRef.current = true;
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
                    if (isJumpingRef.current) {
                        isJumpingRef.current = false;
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


    // Move player based on keyboard input and check collisions
    useFrame((_, delta) => {
        if (!controlsRef.current?.isLocked) return;

        let isGrounded = false;


        if (playerRef.current) {
            playerRef.current.position.copy(camera.position);
        }

        // Calculate movement direction based on camera orientation
        direction.current.z = Number(moveState.forward) - Number(moveState.backward);
        direction.current.x = Number(moveState.right) - Number(moveState.left);
        direction.current.normalize();

        // Apply movement in the camera direction
        const frontVector = new THREE.Vector3(0, 0, Number(moveState.forward) - Number(moveState.backward));
        const sideVector = new THREE.Vector3(Number(moveState.left) - Number(moveState.right), 0, 0);
        const horizontalMove = frontVector.add(sideVector).normalize().multiplyScalar(playerSpeed * delta);

        // Combine and normalize movement vector
        const moveVector = new THREE.Vector3(
            horizontalMove.x,
            velocity.current.y * delta, // Vertical movement from gravity
            horizontalMove.z
        );

        // Get camera direction (excluding y-axis)
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();


        // Calculate movement in camera space
        const moveQuat = new THREE.Quaternion();
        moveQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cameraDirection);
        moveVector.applyQuaternion(moveQuat);

        const playerPosition = camera.position.clone();

        // Step 2: Apply movement
        camera.position.add(moveVector);

        if (colliding) {
            const normal = collisionNormal.clone().normalize();

            // Restore previous position
            camera.position.copy(playerPosition);

            const isOnTop = normal.y > 0.7;

            if (isOnTop) {
                if(isJumpingRef.current) velocity.current.y = jumpStrength;
                else velocity.current.y = 0;
                isGrounded = true;

                // Get the horizontal movement in camera space
                const cameraDirection = new THREE.Vector3();
                camera.getWorldDirection(cameraDirection);
                cameraDirection.y = 0;
                cameraDirection.normalize();

                const moveQuat = new THREE.Quaternion();
                moveQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cameraDirection);

                // Apply full horizontal movement without restriction
                const horizontalMoveWorld = horizontalMove.clone().applyQuaternion(moveQuat);
                camera.position.x += horizontalMoveWorld.x;
                camera.position.z += horizontalMoveWorld.z;

            } else {
                // Wall collision (not on top)

                // Check if player is trying to move away from the wall
                const movingAwayFromWall = moveVector.dot(normal) > 0;

                if (movingAwayFromWall) {
                    // Allow movement away from the wall
                    camera.position.copy(playerPosition);
                    camera.position.add(moveVector);
                } else {
                    // Apply sliding behavior for movement into the wall
                    const slideVector = moveVector.clone().projectOnPlane(normal);

                    // Push slightly away from the wall to prevent getting stuck
                    const pushDistance = 0.001;

                    // Apply both the push and the slide
                    camera.position.copy(playerPosition); // Reset to pre-collision position
                    camera.position.addScaledVector(normal, pushDistance); // Push away from wall
                    camera.position.add(slideVector); // Slide along the wall
                }
            }
        }


        // Apply gravity

        if (!isGrounded) {
            velocity.current.y += gravity * delta;
        }
        camera.position.y += velocity.current.y * delta;


        // Prevent falling below ground (y = 1 is ground level)
        if (camera.position.y < 1) {
            isJumpingRef.current = false;
            camera.position.y = 1;
            velocity.current.y = 0;
        }

        setPosition(playerPosition.clone());

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
                {/* Collision box */}
                <mesh visible={false} position={[0, -1, 0]}>
                    <boxGeometry args={[1, 2, 1]} />
                </mesh>

                {/* Visible player mesh */}
                <mesh position={[0, -1, 0]}>
                    {/* <capsuleGeometry args={[0.5, 1, 8, 16]} /> */}
                    <meshStandardMaterial color="skyblue" />
                </mesh>
            </group>
        </>
    );
};

export default Player;