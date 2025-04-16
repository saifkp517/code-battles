// Player component
import React, { useRef, useState, useEffect } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import Explosion from '../explosion/Explosion';
import * as THREE from 'three';

interface PlayerProps {
    obstacles: THREE.Mesh[];
    getGroundHeight: (x: number, z: number) => number;
    onPositionChange: (pos: THREE.Vector3) => void;
}

type FireballProps = {
    position: THREE.Vector3;
    direction: THREE.Vector3;
    speed?: number;
    obstacles?: THREE.Mesh[];
    onExplode: (position: THREE.Vector3) => void;
};

const Fireball: React.FC<FireballProps> = ({ position, direction, speed = 2, obstacles, onExplode }) => {
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
            fireballPosition.distanceTo(obstacle.position)
            if (fireballPosition.distanceTo(obstacle.position) < 5) {
                console.log("ye");
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



const Player: React.FC<PlayerProps> = ({ onPositionChange, obstacles, getGroundHeight }) => {
    const { camera } = useThree();
    const [colliding, setColliding] = useState(false);
    const [collisionNormal, setCollisionNormal] = useState<THREE.Vector3 | null>(null);
    const jumpRequested = useRef(false);
    const playerRef = useRef<THREE.Mesh>(null);
    const jumpDirection = useRef(new THREE.Vector3());
    const isJumpingRef = useRef(false);
    const [fireballs, setFireballs] = useState<{ id: number; position: THREE.Vector3; direction: THREE.Vector3 }[]>([]);
    const [collisionType, setCollisionType] = useState("");
    const [explosions, setExplosions] = useState<{ id: number; position: THREE.Vector3 }[]>([]);
    const lastUpdateTime = useRef(0);

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
        for (const obstacle of obstacles) {
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
                    setCollisionType("sphere")
                    // Calculate collision normal (direction from obstacle to player)
                    const collisionNormal = new THREE.Vector3()
                        .subVectors(playerCenter, obstaclePosition)
                        .normalize();

                    setCollisionNormal(collisionNormal);
                    isColliding = true;
                    break;
                }
            } else if (isObstacleCylinder) {
                // Handle cylinder collision with any orientation
                const obstaclePosition = obstacle.position.clone();

                // Get cylinder properties
                const radiusTop = obstacle.geometry.parameters.radiusTop;
                const radiusBottom = obstacle.geometry.parameters.radiusBottom || radiusTop;
                const radius = Math.max(radiusTop, radiusBottom) * Math.max(obstacle.scale.x, obstacle.scale.z);
                const height = obstacle.geometry.parameters.height * obstacle.scale.y;

                // Get cylinder's axis vector (assuming Y is the height axis in cylinder geometry)
                // We need to extract the Y axis of the cylinder from its world matrix
                const cylinderMatrix = obstacle.matrixWorld.clone();
                const cylinderUpVector = new THREE.Vector3(0, 1, 0).applyMatrix4(
                    new THREE.Matrix4().extractRotation(cylinderMatrix)
                ).normalize();

                // Get cylinder endpoints
                const cylinderCenter = obstaclePosition.clone();
                const cylinderEnd1 = cylinderCenter.clone().addScaledVector(cylinderUpVector, height / 2);
                const cylinderEnd2 = cylinderCenter.clone().addScaledVector(cylinderUpVector, -height / 2);

                // Project player center onto cylinder axis
                const toPlayer = new THREE.Vector3().subVectors(playerCenter, cylinderEnd1);
                const axisLine = new THREE.Vector3().subVectors(cylinderEnd2, cylinderEnd1);
                const axisLength = axisLine.length();
                const axisNormalized = axisLine.clone().normalize();

                // Projection calculation
                const projectionLength = toPlayer.dot(axisNormalized);
                const projectionPoint = new THREE.Vector3().copy(cylinderEnd1).addScaledVector(axisNormalized, projectionLength);

                // Check if projection is within cylinder length
                const withinCylinderLength = projectionLength >= 0 && projectionLength <= axisLength;

                // Distance from player to nearest point on cylinder axis
                let distanceToAxis;
                let collisionNormal;
                let collisionPoint;

                if (withinCylinderLength) {
                    // Player is alongside the cylinder body
                    // Get distance from player to axis
                    distanceToAxis = new THREE.Vector3().subVectors(playerCenter, projectionPoint).length();

                    if (distanceToAxis < radius + playerSphere.radius) {
                        // Collision with cylinder side
                        collisionNormal = new THREE.Vector3().subVectors(playerCenter, projectionPoint).normalize();
                        collisionPoint = projectionPoint.clone().addScaledVector(collisionNormal, radius);
                        setCollisionNormal(collisionNormal);
                        setCollisionType("cylinder-side");
                        isColliding = true;
                        break;
                    }
                } else {
                    // Player is beyond the cylinder ends
                    // Find nearest end point
                    const endPoint = projectionLength < 0 ? cylinderEnd1 : cylinderEnd2;

                    // Check distance to end point (to see if we hit the cap)
                    const distanceToEnd = new THREE.Vector3().subVectors(playerCenter, endPoint).length();

                    if (distanceToEnd < radius + playerSphere.radius) {
                        // End cap collision
                        collisionNormal = new THREE.Vector3().subVectors(playerCenter, endPoint).normalize();
                        collisionPoint = endPoint.clone().addScaledVector(collisionNormal, radius);

                        // Determine if it's top or bottom
                        const isEnd1 = endPoint.equals(cylinderEnd1);
                        setCollisionNormal(collisionNormal);
                        setCollisionType(isEnd1 ? "cylinder-top" : "cylinder-bottom");
                        isColliding = true;
                        break;
                    }
                }
            }
            else {
                // Handle box collision (your existing code)
                const obstacleBox = new THREE.Box3().setFromObject(obstacle);

                if (playerBox.intersectsBox(obstacleBox)) {
                    setCollisionType("box")
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
    const playerHeight = 2;
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
        let onGround = camera.position.y <= groundY + playerHeight;

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
            jumpDirection.current.copy(cameraDirection);

            velocity.current.y = jumpStrength;
            isJumpingRef.current = true;
            jumpRequested.current = false;
        }

        //work later
        // if (isJumpingRef.current && moveState.forward == false) {
        //     camera.position.addScaledVector(jumpDirection.current, playerSpeed / 2 * delta);
        // }

        // Apply gravity

        if (!isGrounded) {
            velocity.current.y += gravity * delta;
        }
        camera.position.y += velocity.current.y * delta;



        if (camera.position.y < groundY + playerHeight - 0.5) {
            isJumpingRef.current = false;
            camera.position.y = groundY + playerHeight - 0.5;
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

            console.log(collisionType)
            if (collisionType === "sphere") {
                // Spherical collision handling
                if (isOnTop) {
                    // Standing on top of sphere
                    isGrounded = true;

                    // Apply horizontal movement
                    const cameraDirection = new THREE.Vector3();
                    camera.getWorldDirection(cameraDirection);
                    cameraDirection.y = 0;
                    cameraDirection.normalize();

                    if (jumpRequested.current) {
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
                    // Project movement onto the tangent plane of the cylinder side
                    const slideVector = moveVector.clone().projectOnPlane(normal);

                    // Add a small push away from the surface to prevent sticking
                    const pushDistance = 0.001;
                    camera.position.addScaledVector(normal, pushDistance);
                    camera.position.add(slideVector);
                }
            } else if (collisionType === "cylinder-top" || collisionType === "cylinder-bottom") {
                // Cap collision - depends on orientation 
                const movingAwayFromCollision = moveVector.dot(normal) > 0;

                if (movingAwayFromCollision) {
                    camera.position.add(moveVector);
                } else {
                    // Treat cap like a flat surface
                    const slideVector = moveVector.clone().projectOnPlane(normal);

                    // Check if this is a top cap that can be stood on
                    // We only want the player to stand on relatively flat surfaces
                    const upDot = normal.dot(new THREE.Vector3(0, 1, 0));
                    if (Math.abs(upDot) > 0.7) { // Cap is mostly horizontal
                        isGrounded = upDot > 0; // Only if normal points up

                        if (isGrounded && jumpRequested.current) {
                            velocity.current.y = jumpStrength;
                            isJumpingRef.current = true;
                            jumpRequested.current = false;
                        }
                    }

                    // Add a small push away from the surface
                    const pushDistance = 0.001;
                    camera.position.addScaledVector(normal, pushDistance);
                    camera.position.add(slideVector);
                }
            } else {
                // Box collision (original code)
                if (isOnTop) {

                    isGrounded = true;
                    onGround = true;

                    const cameraDirection = new THREE.Vector3();
                    camera.getWorldDirection(cameraDirection);
                    cameraDirection.y = 0;
                    cameraDirection.normalize();

                    if (jumpRequested.current) {
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

        playerPosition.copy(camera.position)

        const currentTime = performance.now();

        // Only emit the position change every 100ms
        if (currentTime - lastUpdateTime.current >= 1000) {
            onPositionChange(playerPosition.clone());
            lastUpdateTime.current = currentTime; // Update the last update time
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
                    obstacles={obstacles} // Pass obstacle references here
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