import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Component for sacred geometry connections between orbs
export function SacredGeometryLines({ 
  orbs, 
  isRootLevel 
}: { 
  orbs: { id: number; position: THREE.Vector3 }[]; 
  isRootLevel: boolean 
}) {
  return (
    <group>
      {/* Circular connections - connect each orb to the next */}
      {orbs.map((orb, i) => (
        <OrbConnection 
          key={`circle-${i}`}
          startOrb={orb}
          endOrb={orbs[(i + 1) % orbs.length]}
          isRootLevel={isRootLevel}
          index={i}
        />
      ))}
      
      {/* Diagonal connections for 4+ orbs */}
      {orbs.length >= 4 && orbs.map((orb, i) => (
        <OrbConnection 
          key={`diagonal-${i}`}
          startOrb={orb}
          endOrb={orbs[(i + 2) % orbs.length]}
          isRootLevel={isRootLevel}
          index={i + 100} // Different phase for diagonals
          thickness={0.02} // Thinner lines
          opacity={0.4} // More transparent
        />
      ))}
      
      {/* Cross connections for even number of orbs */}
      {orbs.length >= 4 && orbs.length % 2 === 0 && orbs.slice(0, orbs.length / 2).map((orb, i) => (
        <OrbConnection 
          key={`cross-${i}`}
          startOrb={orb}
          endOrb={orbs[i + orbs.length / 2]}
          isRootLevel={isRootLevel}
          index={i + 200} // Different phase for cross connections
          thickness={0.025} // Medium thickness
          opacity={0.5} // Medium opacity
        />
      ))}
    </group>
  );
}

// Component for a single orb connection with animation
function OrbConnection({ 
  startOrb, 
  endOrb, 
  isRootLevel,
  index,
  thickness = 0.01, // Much thinner default
  opacity = 0.4     // More transparent default
}: { 
  startOrb: { id: number; position: THREE.Vector3 }; 
  endOrb: { id: number; position: THREE.Vector3 };
  isRootLevel: boolean;
  index: number;
  thickness?: number;
  opacity?: number;
}) {
  const lineRef = useRef<THREE.Mesh>(null);
  
  // Animation for the connection
  useFrame(({ clock }) => {
    if (lineRef.current && lineRef.current.material) {
      const material = lineRef.current.material as THREE.MeshBasicMaterial;
      // Create a unique animation phase for each connection
      const phase = index * 0.3;
      const pulse = Math.sin(clock.getElapsedTime() * 1.2 + phase) * 0.5 + 0.5;
      material.opacity = (opacity * 0.3) + (pulse * opacity);
    }
  });
  
  // Buffer distance from the orb centers
  const bufferDistance = 0.4;
  
  // Calculate start and end points with buffer
  const direction = endOrb.position.clone().sub(startOrb.position).normalize();
  const reverseDirection = direction.clone().negate();
  
  const startPoint = startOrb.position.clone().add(direction.clone().multiplyScalar(bufferDistance));
  const endPoint = endOrb.position.clone().add(reverseDirection.multiplyScalar(bufferDistance));
  
  // Calculate length of line
  const length = startPoint.distanceTo(endPoint);
  
  // Calculate midpoint for positioning
  const midpoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
  
  // Set up quaternion for rotation - aligning cylinder with the connection line
  const quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3().crossVectors(up, direction).normalize();
  const angle = Math.acos(up.dot(direction));
  quaternion.setFromAxisAngle(axis, angle);
  
  // Line color based on level
  const color = isRootLevel ? "#4F7CAC" : "#CE4257";
  
  return (
    <mesh 
      ref={lineRef}
      position={midpoint}
      quaternion={quaternion}
    >
      <cylinderGeometry args={[thickness, thickness, length, 8]} />
      <meshBasicMaterial 
        color={color}
        transparent={true} 
        opacity={opacity}
      />
    </mesh>
  );
} 