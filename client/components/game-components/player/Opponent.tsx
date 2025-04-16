import * as THREE from 'three';

export const Opponent = ({
    position,
    getGroundHeight,
  }: {
    position: THREE.Vector3;
    getGroundHeight: (x: number, z: number) => number;
  }) => {
    return (
      <mesh position={new THREE.Vector3(...position)}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  };
  