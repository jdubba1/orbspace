"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { X } from "lucide-react";

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
import { OperationControls } from "@/components/OperationControls";

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

  // Add a new orb to the current level
  const addOrb = (position?: THREE.Vector3) => {
    const maxOrbs = 8;
    if (currentLevel.orbs.length >= maxOrbs) return;
    
    // Generate a new orb ID
    const newOrbId = Math.max(...currentLevel.orbs.map(o => o.id), 0) + 1;
    
    const newOrb = {
      id: newOrbId,
      position: position || new THREE.Vector3(
        Math.random() * 6 - 3,
        Math.random() * 6 - 3,
        Math.random() * 6 - 3
      ),
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

  return (
    <div className="relative w-full h-screen">
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }} style={{ background: "#000" }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Orbit Controls */}
        <OrbitControls 
          ref={orbitControlsRef}
          enableZoom 
          zoomSpeed={0.5} 
          minDistance={5} 
          maxDistance={20} 
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
        <button
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
        </button>
        
        {/* Operation Controls */}
        <OperationControls 
          isRootLevel={isRootLevel} 
          operationSettings={operationSettings}
          onToggleOperation={toggleOperation}
          onUpdateSettings={updateOperationSettings}
        />
      </div>
      
      {/* Orb Details Panel */}
      {isDetailsOpen && selectedOrb !== null && (
        <OrbDetailsPanel
          orb={currentLevel.orbs.find(o => o.id === selectedOrb)!}
          isRootLevel={isRootLevel}
          onClose={() => setIsDetailsOpen(false)}
          onUpdate={(updates) => updateOrbDetails(selectedOrb, updates)}
          onEnterLevel={() => enterOrbLevel(selectedOrb)}
        />
      )}
    </div>
  );
}