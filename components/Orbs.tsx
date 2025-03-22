// * Core Orbs Component Module
// ? This module contains all the 3D components related to orb visualization and interaction
// ! This is a critical file for the application's core functionality

import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// * Interface Definitions
// ? These types define the shape of our component props
interface OrbComponentProps {
  orb: {
    id: number;
    position: THREE.Vector3;
    name?: string;
  };
  isActive: boolean;
  isSelected: boolean;
  isHovered: boolean;
  hasChildren: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

// * Main Orb Component
// ? Renders a single orb with its visual effects and interactions
// @param props - The OrbComponentProps object containing all necessary data
export function OrbComponent({
  orb,
  isActive,
  isSelected,
  isHovered,
  hasChildren,
  onClick,
  onHover
}: OrbComponentProps) {
  // * Refs for animation
  const ref = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const textRef = useRef<THREE.Group>(null);
  
  // ? Generate particle positions for the outer cloud effect
  // ! This is computationally expensive, so we memoize it
  const particlePositions = useMemo(() => {
    const positions = [];
    const innerOrbRadius = 0.4;
    const outerOrbRadius = 1;
    for (let i = 0; i < 2000; i++) {
      let radius;
      do {
        radius = Math.random() * outerOrbRadius;
      } while (radius < innerOrbRadius);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  // * Animation Frame Handler
  // ? Updates the orb's appearance on each frame
  useFrame(({ camera }) => {
    if (ref.current) {
      // Scale based on state
      const scale = isActive ? 1.5 : isSelected ? 1.3 : isHovered ? 1.2 : 1;
      ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
    
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
      
      // Pulse the points if active in operation or hovered
      if (pointsRef.current.material) {
        const material = pointsRef.current.material as THREE.PointsMaterial;
        
        if (isActive) {
          material.size = 0.013 * (1 + 0.3 * Math.sin(Date.now() * 0.005));
        } else if (isHovered) {
          material.size = 0.015;
        } else {
          material.size = 0.013;
        }
      }
    }
    
    if (textRef.current) {
      // Make sure text always faces the camera
      (textRef.current as THREE.Group).lookAt(camera.position);
    }
  });

  // Define the orb color based on its state
  let orbColor = "white";
  if (isHovered) {
    orbColor = "#10b981"; // Teal green for hover
  } else if (isSelected) {
    orbColor = "#4ade80"; // Green when selected
  } else if (isActive) {
    orbColor = "#FF9B54"; // Orange when active in operation
  } else if (hasChildren) {
    orbColor = "#FFC857"; // Gold for orbs with children
  }

  return (
    <group 
      position={orb.position.toArray()} 
      onClick={onClick}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particlePositions}
            count={particlePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={orbColor}
          size={0.013}
          transparent
          opacity={isHovered ? 0.8 : 0.7}
        />
      </points>
      <mesh ref={ref}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          transparent
          opacity={0.2}
          depthWrite={false}
          color={orbColor}
          emissive={orbColor}
          emissiveIntensity={isHovered ? 1.2 : 0.9}
        />
      </mesh>
      
      {/* Display orb name above the orb */}
      <group ref={textRef} position={[0, 0.6, 0]}>
        <Text
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.9}
          outlineWidth={0.02}
          outlineColor={
            hasChildren ? "#FFC857" : 
            isActive ? "#FF9B54" : 
            isHovered ? "#10b981" : "#000000"
          }
          outlineOpacity={0.6}
        >
          {orb.name || `Orb ${orb.id}`}
        </Text>
      </group>
      
      {/* Visual indicator for orbs with children */}
      {hasChildren && (
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="#FFC857" 
            emissive="#FFC857"
            emissiveIntensity={isHovered ? 1.2 : 1}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Component to handle smooth camera animations
 */
export function CameraAnimator({ 
  target, 
  controls, 
  onComplete,
  setIsZooming
}: { 
  target: THREE.Vector3, 
  controls: React.RefObject<OrbitControlsImpl>,
  onComplete: () => void,
  setIsZooming: (value: boolean) => void
}) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (controls.current && target) {
      setIsZooming(true);
      
      // Kill any existing animations to prevent conflict
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.current.target);
      
      // Calculate a position closer to the orb (better framing)
      // Position the camera 2.5 units away from the orb
      const direction = new THREE.Vector3(0, 0, 1).normalize();  // Default camera direction
      const targetPosition = new THREE.Vector3().addVectors(target, direction.multiplyScalar(2.5));
      
      // Animate camera position in a single, smooth motion
      gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1,
        ease: "power2.inOut",
        onComplete
      });
      
      // Animate orbit controls target to center on the orb
      gsap.to(controls.current.target, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 1,
        ease: "power2.inOut"
      });
    }
  }, [target, controls, camera, onComplete, setIsZooming]);
  
  return null;
}

// * Background Sphere Component
// ? Creates the ethereal background effect for the 3D space
export function BackgroundSphere() {
  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={{
          uColor1: { value: new THREE.Color("#4F7CAC") },
          uColor2: { value: new THREE.Color("#343434") },
          uColor3: { value: new THREE.Color("#CE4257") },
          uNoiseScale: { value: 1.5 },
          uBlendFactor: { value: 0.5 },
        }}
        fragmentShader={`
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;
          uniform float uNoiseScale;
          uniform float uBlendFactor;
          varying vec3 vPosition;
          float random(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
          }
          float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(
                mix(random(i), random(i + vec3(1.0, 0.0, 0.0)), f.x),
                mix(random(i + vec3(0.0, 1.0, 0.0)), random(i + vec3(1.0, 1.0, 0.0)), f.x),
                f.y
              ),
              mix(
                mix(random(i + vec3(0.0, 0.0, 1.0)), random(i + vec3(1.0, 0.0, 1.0)), f.x),
                mix(random(i + vec3(0.0, 1.0, 1.0)), random(i + vec3(1.0, 1.0, 1.0)), f.x),
                f.y
              ),
              f.z
            );
          }
          void main() {
            vec3 normalizedPosition = normalize(vPosition);
            float noiseFactor = noise(normalizedPosition * uNoiseScale);
            float mixFactor = 0.5 + normalizedPosition.y * uBlendFactor + noiseFactor * 0.25;
            vec3 color = mix(uColor1, uColor2, mixFactor);
            color = mix(color, uColor3, abs(noiseFactor * 0.5));
            gl_FragColor = vec4(color, 1.0);
          }
        `}
        vertexShader={`
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
      />
    </mesh>
  );
}

// * Geometric Connections Component
// ? Creates the sacred geometry pattern by drawing lines between orbs
// @param orbs - Array of orb objects with positions
// @param isRootLevel - Boolean indicating if this is the root level
export function GeometricConnections({ 
  orbs,
  isRootLevel 
}: { 
  orbs: { id: number; position: THREE.Vector3 }[];
  isRootLevel: boolean;
}) {
  // * Connection Generation
  // ? Creates a unique set of connections between orbs based on sacred geometry principles
  const connections = useMemo(() => {
    if (!orbs || orbs.length < 2) return [];
    
    // TODO: Consider adding more complex sacred geometry patterns for larger numbers of orbs
    
    // ? Basic circular connections
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    
    // * Create primary connections (circular pattern)
    for (let i = 0; i < orbs.length; i++) {
      const nextIndex = (i + 1) % orbs.length;
      lines.push([orbs[i].position.clone(), orbs[nextIndex].position.clone()]);
    }
    
    // * Create additional sacred geometry patterns
    if (orbs.length > 3) {
      // ? For even numbers, connect opposite orbs
      if (orbs.length % 2 === 0) {
        for (let i = 0; i < orbs.length / 2; i++) {
          lines.push([
            orbs[i].position.clone(), 
            orbs[i + orbs.length / 2].position.clone()
          ]);
        }
      }
      
      // ? For 4+ orbs, add diagonal connections
      if (orbs.length >= 4) {
        for (let i = 0; i < orbs.length; i++) {
          const diagonalIndex = (i + 2) % orbs.length;
          lines.push([
            orbs[i].position.clone(), 
            orbs[diagonalIndex].position.clone()
          ]);
        }
      }
    }
    
    return lines;
  }, [orbs]);
  
  return (
    <group>
      {connections.map((connection, index) => (
        <LineComponent
          key={index}
          start={connection[0]}
          end={connection[1]}
          color={isRootLevel ? "#4F7CAC" : "#CE4257"}
          opacity={isRootLevel ? 0.3 : 0.5}
        />
      ))}
    </group>
  );
}

// * Line Component
// ? Renders a single glowing line between two points
// @param start - Starting position of the line
// @param end - Ending position of the line
// @param color - Color of the line
// @param opacity - Base opacity of the line
function LineComponent({ 
  start, 
  end, 
  color, 
  opacity 
}: { 
  start: THREE.Vector3; 
  end: THREE.Vector3; 
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  
  // * Create curved line geometry
  // ? Uses a quadratic curve for more aesthetic appeal
  const geometry = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      start,
      new THREE.Vector3(
        (start.x + end.x) / 2,
        (start.y + end.y) / 2 + 0.5, // ? Add slight upward curve
        (start.z + end.z) / 2
      ),
      end
    );
    
    return new THREE.TubeGeometry(curve, 10, 0.02, 8, false);
  }, [start, end]);
  
  // * Pulsing Animation
  // ? Creates a gentle pulsing effect for the line
  useFrame(({ clock }) => {
    if (ref.current && ref.current.material) {
      const material = ref.current.material as THREE.MeshBasicMaterial;
      const pulse = Math.sin(clock.getElapsedTime() * 1.5) * 0.3 + 0.7;
      material.opacity = opacity * pulse;
    }
  });
  
  return (
    <mesh ref={ref} geometry={geometry}>
      <meshBasicMaterial 
        color={color} 
        transparent={true} 
        opacity={opacity} 
        fog={true}
      />
    </mesh>
  );
} 