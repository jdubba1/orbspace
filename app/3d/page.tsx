"use client";

// COLOR SCHEME
// JET : #343434
// AMARANTH: #CE4257
// CORAL: #FF7F51
// SANDY BROWN: FF9B54
// STEEL BLUE: #4F7CAC

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import Link from "next/link";
import { X } from "lucide-react";

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
      const segmentSize = (360 * orbs.length) / orbs.length;
      const activeSegment =
        Math.floor(totalRotation / segmentSize) % orbs.length;

      setActiveOrbId(activeSegment);

      requestAnimationFrame(animate); // Schedule the next frame
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId); // Cleanup on unmount
  }, [orbs.length]);

  // Simulate wheel movements
  useEffect(() => {
    const wheel1Interval = setInterval(
      () => setWheel1Position((p) => (p + 3) % 360),
      50,
    );
    const wheel2Interval = setInterval(
      () => setWheel2Position((p) => (p + 2) % 360),
      100,
    );
    const wheel3Interval = setInterval(
      () => setWheel3Position((p) => (p + 1) % 360),
      150,
    );

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
        style={{ background: "#000" }} // Fallback for unsupported browsers
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Orbit Controls */}
        <OrbitControls
          enableZoom={true}
          zoomSpeed={0.5}
          minDistance={5}
          maxDistance={20}
        />

        {/* Gradient Sphere Background */}
        <mesh>
          <sphereGeometry args={[500, 64, 64]} /> {/* Large sphere */}
          <shaderMaterial
            side={THREE.BackSide} // Render the inside of the sphere
            uniforms={{
              uColor1: { value: new THREE.Color("#4F7CAC") }, // Blue
              uColor2: { value: new THREE.Color("#343434") }, // Gray
              uColor3: { value: new THREE.Color("#CE4257") }, // Red
              uNoiseScale: { value: 1.5 }, // Noise scale
              uBlendFactor: { value: 0.5 }, // Control blending strength
            }}
            fragmentShader={`
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform float uNoiseScale;
      uniform float uBlendFactor;
      varying vec3 vPosition;

      // Simple random function
      float random(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }

      // Simple 3D noise function
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

        // Calculate the noise-based distortion
        float noiseFactor = noise(normalizedPosition * uNoiseScale);

        // Balanced gradient blending
        float mixFactor = 0.5 + normalizedPosition.y * uBlendFactor + noiseFactor * 0.25;

        vec3 color = mix(uColor1, uColor2, mixFactor); // Base gradient
        color = mix(color, uColor3, abs(noiseFactor * 0.5)); // Add dappled effect

        gl_FragColor = vec4(color, 1.0);
      }
    `}
            vertexShader={`
      varying vec3 vPosition;

      void main() {
        vPosition = position; // Pass vertex position to fragment shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `}
          />
        </mesh>

        {/* Orbs or Other Scene Objects */}
        {orbs.map((orb) => (
          <Orb
            key={orb.id}
            id={orb.id}
            position={orb.position}
            isActive={activeOrbId === orb.id}
          />
        ))}
      </Canvas>
      {/* Transparent Navbar Overlay */}
      <nav className="absolute top-0 left-0 right-0 py-2 px-4 flex justify-between items-center z-10 bg-black bg-opacity-0 hover:bg-opacity-20 transition duration-300">
        <Link href="/">
          <p className="text-white text-base hover:underline font-bold font-mono italic">
            orb.space
          </p>
        </Link>
        <Link href="/">
          <X className="text-white" />
        </Link>
      </nav>
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
                  Math.random() * 6 - 3,
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

    for (let i = 0; i < 2000; i++) {
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
          color={isActive ? "#FF9B54" : "white"}
          size={0.013}
          transparent
          opacity={0.7}
        />
      </points>

      {/* Transparent Inner Orb */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          transparent
          opacity={0.2}
          depthWrite={false} // Ensures text isn't obscured by transparency
          color={isActive ? "#FF9B54" : "white"}
          emissive={isActive ? "#FF9B54" : "white"}
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* ID Text (Inside the Smaller Orb) */}
      <Text
        position={[0, 0, 0]} // Place the text at the center of the smaller orb
        fontSize={0.15} // Adjust the font size to fit within the smaller orb
        // color={isActive ? "#FF9B54" : "white"}
        color={"white"}
        anchorX="center"
        anchorY="middle"
      >
        {id.toString()}
      </Text>
    </group>
  );
}
