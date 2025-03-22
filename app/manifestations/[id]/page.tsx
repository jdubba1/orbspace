"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { X } from "lucide-react";
import gsap from "gsap";

// Import components and types from our newly structured files
import { 
  OrbComponent, 
  CameraAnimator, 
  BackgroundSphere
} from "@/components/Orbs";
import { 
  OrbLevel, 
  Manifestation, 
  OperationSettings, 
  prepopulatedManifestations 
} from "@/lib/manifestationData";
import { OrbDetailsPanel } from "@/components/OrbDetailsPanel";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { ManifestationControls } from "@/components/ManifestationControls";

// Import OrbitControls type from three
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface ManifestationPageProps {
  params: {
    id: string;
  };
}

export default function ManifestationPage({ params }: ManifestationPageProps) {
  const { id } = params;
  
  // Load manifestation data
  const manifestation = id !== "new" 
    ? prepopulatedManifestations[id] 
    : createNewManifestation();
  
  // States for managing the current view and interaction
  const [currentManifestation, setCurrentManifestation] = useState<Manifestation>(manifestation);
  const [navigationStack, setNavigationStack] = useState<OrbLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<OrbLevel>(currentManifestation.rootLevel);
  
  // UI states
  const [selectedOrb, setSelectedOrb] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [hoveredOrbId, setHoveredOrbId] = useState<number | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  
  // Camera and animation control
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  
  // Operation settings
  const [operationSettings, setOperationSettings] = useState<OperationSettings>({
    isRunning: false,
    frequency: 1000, // milliseconds between activations
    focus: "balanced",
    activeOrbId: null
  });

  // When manifestation changes, reset the current level
  useEffect(() => {
    setCurrentLevel(currentManifestation.rootLevel);
    setNavigationStack([]);
  }, [currentManifestation]);

  // Handle running operations for the current level
  useEffect(() => {
    if (operationSettings.isRunning && navigationStack.length > 0) {
      // Only activate operations on sub-levels, not the root level
      const interval = operationSettings.frequency;
      const startTime = performance.now();

      const animate = (time: number) => {
        if (!operationSettings.isRunning) return;
        
        const elapsedTime = time - startTime;
        const totalRotation = (elapsedTime / interval) * 360;
        const segmentSize = 360 / currentLevel.orbs.length;
        const activeSegment = Math.floor(totalRotation / segmentSize) % currentLevel.orbs.length;
        
        setOperationSettings(prev => ({
          ...prev,
          activeOrbId: activeSegment
        }));
        
        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    } else {
      // Not running operation or at root level
      setOperationSettings(prev => ({
        ...prev,
        activeOrbId: null
      }));
    }
  }, [currentLevel.orbs.length, operationSettings.isRunning, operationSettings.frequency, navigationStack.length]);

  // Handle orb selection
  const handleOrbClick = (orbId: number) => {
    // Don't allow clicking while zooming
    if (isZooming) return;
    
    const orb = currentLevel.orbs.find(o => o.id === orbId);
    if (!orb) return;
    
    // Select orb and open details panel
    setSelectedOrb(orbId);
    setIsDetailsOpen(true);
  };
  
  // Handle orb hover
  const handleOrbHover = (orbId: number | null) => {
    setHoveredOrbId(orbId);
  };
  
  // Handle entering a new level (navigating deeper)
  const enterOrbLevel = (orbId: number) => {
    const orb = currentLevel.orbs.find(o => o.id === orbId);
    if (!orb || !orb.childLevelId) return;
    
    // Find the child level
    const childLevel = currentManifestation.levels[orb.childLevelId];
    if (!childLevel) return;
    
    // Push current level to navigation stack
    setNavigationStack(prev => [...prev, currentLevel]);
    
    // Set the new level as current
    setCurrentLevel(childLevel);
    
    // Close details panel
    setIsDetailsOpen(false);
    setSelectedOrb(null);
  };

  // Handle navigation back up a level
  const navigateToLevel = (levelIndex: number) => {
    if (levelIndex < 0) {
      // Navigate to root level
      setCurrentLevel(currentManifestation.rootLevel);
      setNavigationStack([]);
    } else if (levelIndex < navigationStack.length) {
      // Navigate to a specific level in the stack
      const newLevel = navigationStack[levelIndex];
      setCurrentLevel(newLevel);
      setNavigationStack(prev => prev.slice(0, levelIndex));
    }
    
    // Close any open details when navigating
    setIsDetailsOpen(false);
    setSelectedOrb(null);
  };
  
  // Handler for updating an orb's details
  const updateOrbDetails = (orbId: number, updates: Partial<typeof currentLevel.orbs[0]>) => {
    // Create updated orb
    const updatedOrbs = currentLevel.orbs.map(orb => 
      orb.id === orbId ? { ...orb, ...updates } : orb
    );
    
    // Update the current level
    const updatedLevel = {
      ...currentLevel,
      orbs: updatedOrbs
    };
    
    // Update the current level
    setCurrentLevel(updatedLevel);
    
    // Update the level in the manifestation
    const updatedLevels = {
      ...currentManifestation.levels,
      [updatedLevel.id]: updatedLevel
    };
    
    // If we're at the root level, update the rootLevel directly
    const updatedManifestation = {
      ...currentManifestation,
      levels: updatedLevels,
      ...(navigationStack.length === 0 ? { rootLevel: updatedLevel } : {})
    };
    
    setCurrentManifestation(updatedManifestation);
  };

  // Predefined positions for all possible orbs (up to 8)
  const PREDEFINED_ORB_POSITIONS = [
    // All positions are designed to work well with the adjusted camera view
    // First orb (center)
    new THREE.Vector3(0, 0, 0),
    
    // Second orb (right of center)
    new THREE.Vector3(3.5, 0, 0),
    
    // Third orb (bottom left of center)
    new THREE.Vector3(-1.75, 0, 3),
    
    // Fourth orb (top point of tetrahedron)
    new THREE.Vector3(0.5, 3.5, 1),
    
    // Fifth orb (above first triangle face)
    new THREE.Vector3(0.58, 1.2, 1),
    
    // Sixth orb (above second triangle face)
    new THREE.Vector3(2.3, 1.2, 1),
    
    // Seventh orb (above third triangle face)
    new THREE.Vector3(-0.6, 1.2, 2.8),
    
    // Eighth orb (centered above the structure)
    new THREE.Vector3(0.6, 2.2, 1.2)
  ];

  // Add a new orb to the current level
  const addOrb = () => {
    const maxOrbs = 8;
    if (currentLevel.orbs.length >= maxOrbs) return;
    
    // Generate a new orb ID
    const newOrbId = Math.max(...currentLevel.orbs.map(o => o.id), 0) + 1;
    
    // Get the next predefined position
    const position = PREDEFINED_ORB_POSITIONS[currentLevel.orbs.length];
    
    const newOrb = {
      id: newOrbId,
      position: position,
      name: `New Orb ${newOrbId}`,
      description: "Add your description here",
      // No childLevelId initially
    };
    
    // Add the orb to the current level
    const updatedOrbs = [...currentLevel.orbs, newOrb];
    const updatedLevel = {
      ...currentLevel,
      orbs: updatedOrbs
    };
    
    // Update the current level
    setCurrentLevel(updatedLevel);
    
    // Update the level in the manifestation
    const updatedLevels = {
      ...currentManifestation.levels,
      [updatedLevel.id]: updatedLevel
    };
    
    // If we're at the root level, update the rootLevel directly
    const updatedManifestation = {
      ...currentManifestation,
      levels: updatedLevels,
      ...(navigationStack.length === 0 ? { rootLevel: updatedLevel } : {})
    };
    
    setCurrentManifestation(updatedManifestation);
  };
  
  // Reset to the original manifestation state
  const resetManifestation = () => {
    setCurrentManifestation(manifestation);
    setCurrentLevel(manifestation.rootLevel);
    setNavigationStack([]);
    setIsDetailsOpen(false);
    setSelectedOrb(null);
    setOperationSettings({
      isRunning: false,
      frequency: 1000,
      focus: "balanced",
      activeOrbId: null
    });
  };
  
  // Toggle the operation state
  const toggleOperation = () => {
    // Only allow running operation on sub-levels
    if (navigationStack.length === 0) {
      alert("Operations can only be run on sub-levels. Please navigate into an orb level first.");
      return;
    }
    
    setOperationSettings(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  };
  
  // Update operation settings
  const updateOperationSettings = (updates: Partial<OperationSettings>) => {
    setOperationSettings(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Check if we're at the root level
  const isRootLevel = navigationStack.length === 0;
  
  // Create navigation breadcrumbs
  const breadcrumbs = [
    { 
      name: currentManifestation.name, 
      onClick: () => navigateToLevel(-1) // Root level
    },
    ...navigationStack.map((level, index) => ({
      name: level.name,
      onClick: () => navigateToLevel(index)
    })),
    { 
      name: currentLevel.name, 
      onClick: () => {} // Current level (not clickable)
    }
  ];

  // Create a new empty manifestation
  function createNewManifestation(): Manifestation {
    const rootLevel: OrbLevel = {
      id: "root",
      name: "Untitled Manifestation",
      orbs: [],
      operationSettings: {
        isRunning: false,
        frequency: 1000,
        focus: "balanced",
        activeOrbId: null
      }
    };
    
    return {
      id: "new",
      name: "Untitled Manifestation",
      rootLevel,
      levels: {
        root: rootLevel
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Add a function to zoom camera back out when closing details panel
  const zoomOutCamera = () => {
    // Only zoom out if we're currently zoomed in
    if (selectedOrb !== null) {
      setIsZooming(true);
      
      // Center point of the current level (average of all orb positions)
      const center = new THREE.Vector3();
      currentLevel.orbs.forEach(orb => {
        center.add(orb.position);
      });
      center.divideScalar(currentLevel.orbs.length);
      
      // Find the furthest orb to ensure all orbs are visible
      let maxDistance = 0;
      currentLevel.orbs.forEach(orb => {
        const distance = orb.position.distanceTo(center);
        if (distance > maxDistance) {
          maxDistance = distance;
        }
      });
      
      // Set target to center of all orbs
      setCameraTarget(center);
      
      // After animation completes, clear selection
      setTimeout(() => {
        setIsDetailsOpen(false);
        setSelectedOrb(null);
      }, 200); // Short delay before clearing selection
    } else {
      // If no orb is selected, just close the panel
      setIsDetailsOpen(false);
    }
  };

  // Center camera on orbs when first loading
  useEffect(() => {
    // Short delay to ensure the scene is fully rendered
    const timer = setTimeout(() => {
      if (currentLevel.orbs.length > 0 && orbitControlsRef.current) {
        // Calculate center of orbs
        const center = new THREE.Vector3();
        currentLevel.orbs.forEach(orb => {
          center.add(orb.position);
        });
        center.divideScalar(currentLevel.orbs.length);
        
        // Set orbit controls target to center of orbs
        if (orbitControlsRef.current) {
          gsap.to(orbitControlsRef.current.target, {
            x: center.x,
            y: center.y,
            z: center.z,
            duration: 1.5,
            ease: "power2.inOut"
          });
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [currentLevel.orbs, navigationStack.length]);

  return (
    <div className="relative w-full h-screen">
      <Canvas 
        camera={{ 
          position: [7, 3, 12], // Adjusted position (slightly down and right)
          fov: 50 
        }} 
        style={{ background: "#000" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Orbit Controls with tighter constraints */}
        <OrbitControls 
          ref={orbitControlsRef}
          enableZoom 
          zoomSpeed={0.5} 
          minDistance={5} 
          maxDistance={20}
          // More restricted rotation to prevent seeing text from behind
          minAzimuthAngle={-Math.PI / 4} // Reduced left rotation
          maxAzimuthAngle={Math.PI / 4}  // Reduced right rotation
          minPolarAngle={Math.PI / 4}    // Increased min upward tilt 
          maxPolarAngle={Math.PI / 1.5}  // Reduced max downward tilt
          // Improve dampening for smoother camera movement
          enableDamping
          dampingFactor={0.05}
        />
        
        {/* Camera animation */}
        {cameraTarget && (
          <CameraAnimator 
            target={cameraTarget} 
            controls={orbitControlsRef}
            onComplete={() => {
              setCameraTarget(null);
              setIsZooming(false);
            }}
            setIsZooming={setIsZooming}
          />
        )}

        {/* Background */}
        <BackgroundSphere />

        {/* Sacred Geometry Connections */}
        {currentLevel.orbs.length >= 2 && (
          <SacredGeometryLines 
            orbs={currentLevel.orbs} 
            isRootLevel={isRootLevel} 
          />
        )}

        {/* Render Orbs */}
        {currentLevel.orbs.map((orb) => (
          <OrbComponent
            key={orb.id}
            orb={orb}
            isActive={operationSettings.activeOrbId === orb.id}
            isSelected={selectedOrb === orb.id}
            isHovered={hoveredOrbId === orb.id}
            hasChildren={!!orb.childLevelId}
            onClick={() => {
              if (isZooming) return;
              setIsZooming(true);
              setCameraTarget(orb.position);
              setTimeout(() => handleOrbClick(orb.id), 500);
            }}
            onHover={(hovered) => handleOrbHover(hovered ? orb.id : null)}
          />
        ))}
      </Canvas>

      {/* Navbar */}
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
      
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation breadcrumbs={breadcrumbs} />

      {/* Control Buttons */}
      <div className="absolute bottom-4 left-4 flex flex-row space-x-2">
        {/* <button
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          onClick={() => addOrb()}
          disabled={currentLevel.orbs.length >= 8}
        >
          {currentLevel.orbs.length >= 8 ? "Max Orbs Reached" : "Add Orb"}
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={resetManifestation}
        >
          Reset
        </button> */}
        
        {/* Operation Controls */}
        <ManifestationControls 
          isRootLevel={isRootLevel} 
          operationSettings={operationSettings}
          orbCount={currentLevel.orbs.length}
          maxOrbs={8}
          onAddOrb={addOrb}
          onReset={resetManifestation}
          onToggleOperation={toggleOperation}
          onUpdateSettings={updateOperationSettings}
        />
      </div>
      
      {/* Orb Details Panel */}
      {isDetailsOpen && selectedOrb !== null && (
        <OrbDetailsPanel
          orb={currentLevel.orbs.find(o => o.id === selectedOrb)!}
          isRootLevel={isRootLevel}
          onClose={zoomOutCamera}
          onUpdate={(updates) => updateOrbDetails(selectedOrb, updates)}
          onEnterLevel={() => enterOrbLevel(selectedOrb)}
        />
      )}
    </div>
  );
}

// Component to render sacred geometry connections between orbs
function SacredGeometryLines({ 
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
  index,
  thickness = 0.01, // Much thinner default
  opacity = 0.4     // More transparent default
}: { 
  startOrb: { id: number; position: THREE.Vector3 }; 
  endOrb: { id: number; position: THREE.Vector3 };
  isRootLevel?: boolean; // Make optional since we're not using it
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
  
  // Calculate midpoint and rotation to align cylinder with the line direction
  const midpoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion();
  
  // Set up quaternion for rotation - aligning cylinder with the connection line
  const up = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3().crossVectors(up, direction).normalize();
  const angle = Math.acos(up.dot(direction));
  quaternion.setFromAxisAngle(axis, angle);
  
  return (
    <mesh 
      ref={lineRef} 
      position={midpoint}
      quaternion={quaternion}
    >
      <cylinderGeometry 
        args={[
          thickness, // radiusTop
          thickness, // radiusBottom
          length,    // height
          8,         // radialSegments
          1,         // heightSegments
          false      // openEnded
        ]} 
      />
      <meshBasicMaterial 
        transparent={true} 
        opacity={opacity} 
        color={"#ffffff"} // White lines for all connections
      />
    </mesh>
  );
}