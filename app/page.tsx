


"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface Orb {
  id: number;
  position: THREE.Vector3;
}

export default function Home() {
  const [wheel1Position, setWheel1Position] = useState<number>(0);
  const [wheel2Position, setWheel2Position] = useState<number>(0);
  const [wheel3Position, setWheel3Position] = useState<number>(0);
  const [orbs, setOrbs] = useState<Orb[]>([
    { id: 0, position: new THREE.Vector3(-3, 2, -3) },
    { id: 1, position: new THREE.Vector3(3, 2, -3) },
    { id: 2, position: new THREE.Vector3(3, -2, 3) },
    { id: 3, position: new THREE.Vector3(-3, -2, 3) },
  ]);
  const [activeOrbId, setActiveOrbId] = useState<number>(0);
  const [showTerminal, setShowTerminal] = useState<boolean>(true);

  useEffect(() => {
    const updateInterval = 1000; // Time between orb changes (1 second)
    const startTime = performance.now();
  
    const animate = (time: number) => {
      const elapsedTime = time - startTime;
  
      // Calculate the total rotation based on elapsed time
      const totalRotation = (elapsedTime / updateInterval) * 360;
  
      // Determine the active segment based on total rotation
      const segmentSize = 360 * orbs.length / orbs.length;
      const activeSegment = Math.floor(totalRotation / segmentSize) % orbs.length;
  
      setActiveOrbId(activeSegment);
  
      requestAnimationFrame(animate); // Schedule the next frame
    };
  
    const animationId = requestAnimationFrame(animate);
  
    return () => cancelAnimationFrame(animationId); // Cleanup on unmount
  }, [orbs.length]);

  // Simulate wheel movements
  useEffect(() => {
    const wheel1Interval = setInterval(() => setWheel1Position((p) => (p + 3) % 360), 50);
    const wheel2Interval = setInterval(() => setWheel2Position((p) => (p + 2) % 360), 100);
    const wheel3Interval = setInterval(() => setWheel3Position((p) => (p + 1) % 360), 150);

    return () => {
      clearInterval(wheel1Interval);
      clearInterval(wheel2Interval);
      clearInterval(wheel3Interval);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ background: "rgb(31, 41, 55)" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Orbit Controls with Zoom */}
        <OrbitControls
          enableZoom={true}
          zoomSpeed={0.5}
          minDistance={5} // Minimum zoom distance
          maxDistance={20} // Maximum zoom distance
        />

        {/* Orbs */}
        {orbs.map((orb) => (
          <Orb
            key={orb.id}
            id={orb.id}
            position={orb.position}
            isActive={activeOrbId === orb.id}
          />
        ))}
      </Canvas>
      {showTerminal && (
        <div className=" absolute bottom-16 left-4 w-[300px] bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Live Status</h2>
            <button
              className="text-red-500 font-bold"
              onClick={() => setShowTerminal(false)}
            >
              X
            </button>
          </div>
          <p>Wheel 1 Position: {wheel1Position.toFixed(2)}°</p>
          <p>Wheel 2 Position: {wheel2Position.toFixed(2)}°</p>
          <p>Wheel 3 Position: {wheel3Position.toFixed(2)}°</p>
          <p>Active Orb ID: {activeOrbId}</p>
        </div>
      )}
      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex flex-row justify-between  space-x-2">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() =>
            setOrbs((prev) => [
              ...prev,
              {
                id: prev.length,
                position: new THREE.Vector3(
                  Math.random() * 6 - 3,
                  Math.random() * 6 - 3,
                  Math.random() * 6 - 3
                ),
              },
            ])
          }
        >
          Add Orb
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Reset
        </button>
        {/* Terminal */}
     

      {/* Toggle Terminal Button */}
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
          onClick={() => setShowTerminal((prev) => !prev)}
        >
          {showTerminal ? "Hide Terminal" : "Show Terminal"}
        </button>
      </div>
    </div>
  );
}


function Orb({
  id,
  position,
  isActive,
}: {
  id: number;
  position: THREE.Vector3;
  isActive: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random particle positions for the outer cloud
  const particlePositions = useMemo(() => {
    const positions = [];
    const innerOrbRadius = 0.4; // Radius of the inner orb (exclude particles here)
    const outerOrbRadius = 1; // Outer radius for the particle cloud
  
    for (let i = 0; i < 500; i++) {
      let radius;
  
      // Ensure particles are outside the inner orb radius
      do {
        radius = Math.random() * outerOrbRadius; // Radius between 0 and outerOrbRadius
      } while (radius < innerOrbRadius);
  
      const theta = Math.random() * Math.PI * 2; // Angle between 0 and 2π
      const phi = Math.acos(2 * Math.random() - 1); // Angle between 0 and π
  
      // Convert spherical coordinates to Cartesian
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
  
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  // Pulse animation for the glowing haze
  useFrame(() => {
    if (ref.current) {
      const scale = isActive ? 1.5 : 1;
      ref.current.scale.set(scale, scale, scale);
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002; // Add slow shimmer rotation
    }
  });

  return (
    <group position={position.toArray()}>
      {/* Shimmery Cloud */}
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
          color={isActive ? "orange" : "white"}
          size={0.02}
          transparent
          opacity={0.5}
        />
      </points>

      {/* Transparent Inner Orb */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          transparent
          opacity={0.1}
          depthWrite={false} // Ensures text isn't obscured by transparency
          color={isActive ? "orange" : "white"}
          emissive={isActive ? "orange" : "white"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* ID Text (Inside the Smaller Orb) */}
      <Text
        position={[0, 0, 0]} // Place the text at the center of the smaller orb
        fontSize={0.15} // Adjust the font size to fit within the smaller orb
        color={isActive ? "orange" : "white"}
        anchorX="center"
        anchorY="middle"
      >
        {id.toString()}
      </Text>
    </group>
  );
}
