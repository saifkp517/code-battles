// Player component
import React, { useRef, useState, useEffect } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import Explosion from '../explosion/Explosion';
import * as THREE from 'three';

interface PlayerProps {
    obstacles: any;
    getGroundHeight: (x: number, z: number) => number;
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



const Player: React.FC<PlayerProps> = ({ obstacles, getGroundHeight }) => {
    const { camera } = useThree();
    const [colliding, setColliding] = useState(false);
    const [collisionNormal, setCollisionNormal] = useState<THREE.Vector3 | null>(null);
    const jumpRequested = useRef(false);
    const playerRef = useRef<THREE.Mesh>(null);
    const isJumpingRef = useRef(false);
    const [fireballs, setFireballs] = useState<{ id: number; position: THREE.Vector3; direction: THREE.Vector3 }[]>([]);
    const [collisionType, setCollisionType] = useState("");
    const [explosions, setExplosions] = useState<{ id: number; position: THREE.Vector3 }[]>([]);

    const checkCollisions = (playerPosition: THREE.Vector3) => {
        // Create player hitbox - keeping box for player
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            playerPosition,
            new THREE.Vector3(1, 2, 1) // Player size
        );

        // Player sphere representation (for sphere-to-sphere collision)
        const playerSphere = new THREE.Sphere(
            playerPosition.clone(),
            1 // Player radius (adjust based on your player size)
        );

        // Get player center for calculations
        const playerCenter = new THREE.Vector3();
        playerBox.getCenter(playerCenter);

        // Check collision with each obstacle
        let isColliding = false;
        for (const obstacle of obstacles.current) {
            if (!obstacle) continue;

            // Determine if obstacle is spherical by checking its geometry
            const isObstacleSphere = obstacle.geometry instanceof THREE.SphereGeometry;
            const isObstacleCylinder = obstacle.geometry instanceof THREE.CylinderGeometry;

            if (isObstacleSphere) {
                // Handle sphere collision
                // Get sphere center and radius from obstacle
                const obstaclePosition = obstacle.position.clone();
                const obstacleRadius = obstacle.geometry.parameters.radius * obstacle.scale.x; // Assuming uniform scale

                // Calculate distance between centers
                const distance = playerCenter.distanceTo(obstaclePosition);
                const minDistance = playerSphere.radius + obstacleRadius;

                if (distance < minDistance) {
                    // Calculate collision normal (direction from obstacle to player)
                    const collisionNormal = new THREE.Vector3()
                        .subVectors(playerCenter, obstaclePosition)
                        .normalize();

                    setCollisionNormal(collisionNormal);
                    isColliding = true;
                    break;
                }
            } else if (isObstacleCylinder) {
                // Handle cylinder collision
                const obstaclePosition = obstacle.position.clone();
                const obstacleRadius = obstacle.geometry.parameters.radiusTop * obstacle.scale.x;
                const cylinderHeight = obstacle.geometry.parameters.height * obstacle.scale.y;
                const halfHeight = cylinderHeight / 2;


                // Calculate horizontal distance to cylinder axis
                const playerHorizontal = playerCenter.clone();
                playerHorizontal.y = obstaclePosition.y; // Project onto cylinder's XZ plane

                const cylinderAxis = new THREE.Vector3(0, 1, 0);
                const playerToCylinder = new THREE.Vector3();
                playerToCylinder.subVectors(playerHorizontal, obstaclePosition);
                playerToCylinder.y = 0; // Only care about horizontal distance

                const horizontalDistance = playerToCylinder.length();

                // Check if player's Y position is within cylinder height
                const playerY = playerCenter.y;
                const inYRange = playerY >= obstaclePosition.y - halfHeight &&
                    playerY <= obstaclePosition.y + halfHeight;

                if (horizontalDistance < obstacleRadius + playerSphere.radius && inYRange) {
                    // Side collision with cylinder
                    const collisionNormal = playerToCylinder.clone().normalize();
                    setCollisionNormal(collisionNormal);
                    setCollisionType("cylinder-side");
                    isColliding = true;
                    break;
                } else if (horizontalDistance < obstacleRadius) {
                    // Top or bottom collision
                    if (playerY > obstaclePosition.y) {
                        // Top collision
                        setCollisionNormal(new THREE.Vector3(0, 1, 0));
                        setCollisionType("cylinder-top");
                    } else {
                        // Bottom collision
                        setCollisionNormal(new THREE.Vector3(0, -1, 0));
                        setCollisionType("cylinder-bottom");
                    }
                    isColliding = true;
                    break;
                }
            }
            else {
                // Handle box collision (your existing code)
                const obstacleBox = new THREE.Box3().setFromObject(obstacle);

                if (playerBox.intersectsBox(obstacleBox)) {
                    let collisionNormal = new THREE.Vector3(0, 0, 0);

                    let obstacleCenter = new THREE.Vector3();
                    obstacleBox.getCenter(obstacleCenter);

                    // Calculate overlap on each axis
                    const playerMin = playerBox.min;
                    const playerMax = playerBox.max;
                    const obstacleMin = obstacleBox.min;
                    const obstacleMax = obstacleBox.max;

                    // Calculate penetration depth on each axis
                    const overlapX = Math.min(playerMax.x - obstacleMin.x, obstacleMax.x - playerMin.x);
                    const overlapY = Math.min(playerMax.y - obstacleMin.y, obstacleMax.y - playerMin.y);
                    const overlapZ = Math.min(playerMax.z - obstacleMin.z, obstacleMax.z - playerMin.z);

                    // The collision normal should be along the axis with the smallest penetration
                    if (overlapX <= overlapY && overlapX <= overlapZ) {
                        // X-axis has smallest penetration
                        collisionNormal.set(Math.sign(playerCenter.x - obstacleCenter.x), 0, 0);
                    } else if (overlapY <= overlapX && overlapY <= overlapZ) {
                        // Y-axis has smallest penetration
                        collisionNormal.set(0, Math.sign(playerCenter.y - obstacleCenter.y), 0);
                    } else {
                        // Z-axis has smallest penetration
                        collisionNormal.set(0, 0, Math.sign(playerCenter.z - obstacleCenter.z));
                    }

                    setCollisionNormal(collisionNormal);
                    isColliding = true;
                    break;
                }
            }
        }
        setColliding(isColliding);
    };




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

        const id = Date.now();
        setFireballs((prev) => prev.slice(1)); // Remove the first fireball
        setExplosions((prev) => [...prev, { id, position }]);

        // Remove explosion after a second
        setTimeout(() => {
            setExplosions((prev) => prev.filter((exp) => exp.id !== id));
        }, 1000);
    };

    const gravity = -9.8 * 2;
    const jumpStrength = 10;

    const playerSpeed = 10;

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
                    jumpRequested.current = true;
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
                    jumpRequested.current = false;
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

        //get parent terrain ground height
        const groundY = getGroundHeight(camera.position.x, camera.position.z);
        let onGround = camera.position.y <= groundY + 1.5

        if (playerRef.current) {
            playerRef.current.position.copy(camera.position);
        }

        checkCollisions(playerRef.current?.position || new THREE.Vector3(0, 0, 0));

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

        //handle jump

        if (jumpRequested.current && onGround) {
            camera.position.addScaledVector(cameraDirection, playerSpeed * delta)

            velocity.current.y = jumpStrength;
            isJumpingRef.current = true;
            jumpRequested.current = false;
        }


        // Apply gravity

        if (!isGrounded) {
            velocity.current.y += gravity * delta;
        }
        camera.position.y += velocity.current.y * delta;



        if (camera.position.y < groundY + 1.5) {
            isJumpingRef.current = false;
            camera.position.y = groundY + 1.5;
            velocity.current.y = 0;
        }



        //collision detection handling
        if (colliding) {
            isJumpingRef.current = false;
            const normal = collisionNormal!.clone().normalize();

            // Restore previous position
            camera.position.copy(playerPosition);

            // Check if the player is on top of something
            const isOnTop = normal.y > 0.7;

            if (collisionType === "sphere") {
                // Spherical collision handling
                if (isOnTop) {
                    // Standing on top of sphere
                    if (jumpRequested) velocity.current.y = jumpStrength;
                    else velocity.current.y = 0;
                    isGrounded = true;

                    // Apply horizontal movement
                    const cameraDirection = new THREE.Vector3();
                    camera.getWorldDirection(cameraDirection);
                    cameraDirection.y = 0;
                    cameraDirection.normalize();

                    if (jumpRequested.current && onGround) {
                        cameraDirection.normalize().multiplyScalar(playerSpeed);

                        velocity.current.y = jumpStrength;
                        isJumpingRef.current = true;
                        jumpRequested.current = false;
                    }


                    const moveQuat = new THREE.Quaternion();
                    moveQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cameraDirection);

                    const horizontalMoveWorld = horizontalMove.clone().applyQuaternion(moveQuat);
                    camera.position.x += horizontalMoveWorld.x;
                    camera.position.z += horizontalMoveWorld.z;

                    //jump from top
                    const topHeight = camera.position.y;
                    const nextY = camera.position.y + velocity.current.y * delta;

                    if (nextY >= topHeight) {
                        camera.position.y = nextY;
                    } else {
                        camera.position.y = topHeight;
                        velocity.current.y = 0;
                        isJumpingRef.current = false;
                    }
                } else {
                    // Side collision with sphere
                    const movingAwayFromCollision = moveVector.dot(normal) > 0;

                    if (movingAwayFromCollision) {
                        camera.position.add(moveVector);
                    } else {
                        // Project the movement onto the tangent plane of the sphere
                        const slideVector = moveVector.clone().projectOnPlane(normal);
                        const pushDistance = 0.001;

                        camera.position.addScaledVector(normal, pushDistance);
                        camera.position.add(slideVector);

                        // Adjust vertical velocity based on where on the sphere we hit
                        if (normal.y < 0) {
                            // Hitting ceiling-like part of sphere
                            velocity.current.y = Math.min(velocity.current.y, 0);
                        } else if (Math.abs(normal.y) < 0.3) {
                            // Side collision with sphere
                            if (velocity.current.y > 0) {
                                velocity.current.y *= 0.8;
                            }
                        }
                    }
                }
            } else if (collisionType === "cylinder-side") {
                // Cylinder side collision
                const movingAwayFromCollision = moveVector.dot(normal) > 0;

                if (movingAwayFromCollision) {
                    camera.position.add(moveVector);
                } else {
                    // For cylinder sides, project movement onto the tangent plane
                    // This is similar to sphere handling but preserves vertical movement
                    const horizontalNormal = normal.clone();
                    horizontalNormal.y = 0;
                    horizontalNormal.normalize();

                    // Create a slide vector that preserves vertical movement but slides horizontally
                    const slideVector = moveVector.clone();
                    const horizontalMove = new THREE.Vector3(moveVector.x, 0, moveVector.z);
                    const horizontalProjected = horizontalMove.clone().projectOnPlane(horizontalNormal);

                    slideVector.x = horizontalProjected.x;
                    slideVector.z = horizontalProjected.z;

                    const pushDistance = 0.01;
                    camera.position.addScaledVector(horizontalNormal, pushDistance);
                    camera.position.add(slideVector);
                }
            } else if (collisionType === "cylinder-top" || collisionType === "cylinder-bottom") {
                // Top/bottom of cylinder, treat like a flat surface
                if (collisionType === "cylinder-top") {
                    isGrounded = true;

                    // Apply horizontal movement
                    const cameraDirection = new THREE.Vector3();
                    camera.getWorldDirection(cameraDirection);
                    cameraDirection.y = 0;
                    cameraDirection.normalize();

                    if (jumpRequested.current && onGround ) {
                        cameraDirection.normalize().multiplyScalar(playerSpeed);

                        velocity.current.y = jumpStrength;
                        isJumpingRef.current = true;
                        jumpRequested.current = false;
                    }


                    const moveQuat = new THREE.Quaternion();
                    moveQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cameraDirection);

                    const horizontalMoveWorld = horizontalMove.clone().applyQuaternion(moveQuat);
                    camera.position.x += horizontalMoveWorld.x;
                    camera.position.z += horizontalMoveWorld.z;


                } else {
                    // Bottom collision - just bounce off
                    velocity.current.y = 0;
                    camera.position.addScaledVector(normal, 0.01);
                }
            } else {
                // Box collision (original code)
                if (isOnTop) {

                    isGrounded = true;


                    const cameraDirection = new THREE.Vector3();
                    camera.getWorldDirection(cameraDirection);
                    cameraDirection.y = 0;
                    cameraDirection.normalize();

                    if (jumpRequested.current && !isJumpingRef.current) {
                        cameraDirection.normalize().multiplyScalar(playerSpeed);

                        velocity.current.y = jumpStrength;
                        isJumpingRef.current = true;
                        jumpRequested.current = false;
                    }



                    const moveQuat = new THREE.Quaternion();
                    moveQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cameraDirection);

                    const horizontalMoveWorld = horizontalMove.clone().applyQuaternion(moveQuat);
                    camera.position.x += horizontalMoveWorld.x;
                    camera.position.z += horizontalMoveWorld.z;

                    //jump from top
                    const topHeight = camera.position.y;
                    const nextY = camera.position.y + velocity.current.y * delta;

                    if (nextY >= topHeight) {
                        camera.position.y = nextY;
                    } else {
                        camera.position.y = topHeight;
                        velocity.current.y = 0;
                        isJumpingRef.current = false;
                    }
                } else {
                    const movingAwayFromWall = moveVector.dot(normal) > 0;

                    if (movingAwayFromWall) {
                        camera.position.add(moveVector);
                    } else {
                        const slideVector = moveVector.clone().projectOnPlane(normal);
                        const pushDistance = 0.001;

                        camera.position.addScaledVector(normal, pushDistance);
                        camera.position.add(slideVector);
                    }
                }
            }
        }


        checkCollisions(playerPosition);
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