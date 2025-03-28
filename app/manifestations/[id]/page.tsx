"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { X } from "lucide-react";
import gsap from "gsap";

// Import our hooks and components
import { useManifestationState } from "@/hooks/useManifestationState";
import { useCameraControls } from "@/hooks/useCameraControls";
import { OrbLevelView } from "@/components/manifestation/OrbLevelView";
import { CameraAnimator, BackgroundSphere } from "@/components/Orbs";
import { OrbDetailsPanel } from "@/components/OrbDetailsPanel";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { ManifestationControls } from "@/components/ManifestationControls";
import { SacredGeometryLines } from "@/components/SacredGeometryLines";

interface ManifestationPageProps {
  params: {
    id: string;
  };
}

export default function ManifestationPage({ params }: ManifestationPageProps) {
  // Use our manifestation state hook
  const {
    currentLevel,
    selectedOrb,
    isDetailsOpen,
    hoveredOrbId,
    isZooming,
    operationSettings,
    breadcrumbs,
    isRootLevel,
    
    handleOrbClick,
    handleOrbHover,
    enterOrbLevel,
    updateOrbDetails,
    addOrb,
    resetManifestation,
    toggleOperation,
    updateOperationSettings,
    zoomOutCamera,
    setIsZooming,
    shouldResetCamera,
    setShouldResetCamera,
  } = useManifestationState(params.id);

  // Use camera controls
  const { 
    orbitControlsRef, 
    defaultCameraPosition 
  } = useCameraControls();
  
  // Camera target state for animations
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);

  // Add this with your other useState declarations
  const [showGeometry, setShowGeometry] = useState(true);

  // Add useEffect to detect level changes and reset camera
  useEffect(() => {
    // Only run this when not at root level (meaning we just entered a new level)
    if (!isRootLevel) {
      setIsZooming(true);
      setCameraTarget(new THREE.Vector3(0, 0, 0));
      
      // Reset camera to default position
      setTimeout(() => {
        if (orbitControlsRef.current) {
          orbitControlsRef.current.target.set(0, 0, 0);
          orbitControlsRef.current.update();
        }
        setIsZooming(false);
      }, 1500); // Wait for animation to complete
    }
  }, [currentLevel.id]); // This will run whenever we change levels

  // Add an effect to handle camera resets
  useEffect(() => {
    if (shouldResetCamera && orbitControlsRef.current) {
      setIsZooming(true);
      
      // Reset target to center of scene
      orbitControlsRef.current.target.set(0, 0, 0);
      
      // Get camera
      const camera = orbitControlsRef.current.object;
      
      // Reset position (simplest approach)
      gsap.to(camera.position, {
        x: 6,
        y: 2.5, 
        z: 10,
        duration: 1.2,
        ease: "power2.out",
        onComplete: () => {
          setIsZooming(false);
          setShouldResetCamera(false); // Reset flag
        }
      });
    }
  }, [shouldResetCamera, orbitControlsRef]);

  // Define a custom zoom out function for this component
  const handleZoomOut = () => {
    if (selectedOrb !== null) {
      setIsZooming(true);
      
      // Move camera back to default position
      setCameraTarget(defaultCameraPosition);
      
      // After camera has moved, close the panel
      setTimeout(() => {
        setIsZooming(false);
        // Call the original zoomOutCamera function to handle state cleanup
        zoomOutCamera();
      }, 300);
    } else {
      zoomOutCamera();
    }
  };

  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={{
          position: [6, 2.5, 10],
          fov: 50,
        }}
        style={{ background: "#000" }}
      >
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
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
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

        {/* Orbs in the current level */}
        <OrbLevelView
          orbs={currentLevel.orbs}
          selectedOrb={selectedOrb}
          isZooming={isZooming}
          activeOrbId={operationSettings.activeOrbId}
          hoveredOrbId={hoveredOrbId}
          onOrbClick={(orbId) => {
            if (isZooming) return;
            const orb = currentLevel.orbs.find(o => o.id === orbId);
            if (!orb) return;
            
            // Set zooming state and prepare camera animation
            setIsZooming(true);
            setCameraTarget(orb.position);
            
            // After camera moves, show the details panel
            setTimeout(() => {
              handleOrbClick(orbId);
            }, 800); // Longer delay to ensure camera is done moving
          }}
          onOrbHover={handleOrbHover}
        />

        {/* Add the sacred geometry connections */}
        {currentLevel.orbs.length >= 2 && showGeometry && (
          <SacredGeometryLines 
            orbs={currentLevel.orbs} 
            isRootLevel={isRootLevel} 
          />
        )}

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
        <ManifestationControls
          isRootLevel={isRootLevel}
          operationSettings={operationSettings}
          orbCount={currentLevel.orbs.length}
          maxOrbs={8}
          showGeometry={showGeometry}
          onAddOrb={addOrb}
          onReset={resetManifestation}
          onToggleOperation={toggleOperation}
          onUpdateSettings={updateOperationSettings}
          onToggleGeometry={() => setShowGeometry(!showGeometry)}
        />
      </div>

      {/* Orb Details Panel with updated onClose handler */}
      {isDetailsOpen && selectedOrb !== null && (
        <OrbDetailsPanel
          orb={currentLevel.orbs.find((o) => o.id === selectedOrb)!}
          isRootLevel={isRootLevel}
          onClose={handleZoomOut}
          onUpdate={(updates) => updateOrbDetails(selectedOrb, updates)}
          onEnterLevel={() => enterOrbLevel(selectedOrb)}
        />
      )}
    </div>
  );
}
