import { useState, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { 
  Manifestation, 
  OrbLevel, 
  OperationSettings, 
  prepopulatedManifestations, 
  Orb
} from '@/lib/manifestationData';
import { computeOrbPositions, createFreshManifestationCopy } from '@/utils/orbUtils';
import { useCameraControls } from './useCameraControls';

export function useManifestationState(manifestationId: string) {
  // Load manifestation data
  const loadManifestation = () => {
    return manifestationId !== "new" 
      ? prepopulatedManifestations[manifestationId] 
      : createNewManifestation();
  };

  // States for managing view and interaction
  const [currentManifestation, setCurrentManifestation] = useState<Manifestation>(loadManifestation());
  const [navigationStack, setNavigationStack] = useState<OrbLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<OrbLevel>(currentManifestation.rootLevel);

  // UI states
  const [selectedOrb, setSelectedOrb] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [hoveredOrbId, setHoveredOrbId] = useState<number | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  // Operation settings
  const [operationSettings, setOperationSettings] = useState<OperationSettings>({
    isRunning: false,
    frequency: 1000,
    focus: "balanced",
    activeOrbId: null,
  });

  // Use camera controls
  const { 
    moveCameraTo, 
    defaultCameraPosition,
    resetCameraView 
  } = useCameraControls();

  // Add a new state in your hook
  const [shouldResetCamera, setShouldResetCamera] = useState(false);

  // When manifestation changes, reset the current level
  useEffect(() => {
    setCurrentLevel(currentManifestation.rootLevel);
    setNavigationStack([]);
  }, [currentManifestation]);

  // Handle running operations for the current level
  useEffect(() => {
    if (operationSettings.isRunning && navigationStack.length > 0) {
      const interval = operationSettings.frequency;
      const startTime = performance.now();

      const animate = (time: number) => {
        if (!operationSettings.isRunning) return;

        const elapsedTime = time - startTime;
        const totalRotation = (elapsedTime / interval) * 360;
        const segmentSize = 360 / currentLevel.orbs.length;
        const activeSegment =
          Math.floor(totalRotation / segmentSize) % currentLevel.orbs.length;

        setOperationSettings((prev) => ({
          ...prev,
          activeOrbId: activeSegment,
        }));

        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    } else {
      setOperationSettings((prev) => ({
        ...prev,
        activeOrbId: null,
      }));
    }
  }, [
    currentLevel.orbs.length,
    operationSettings.isRunning,
    operationSettings.frequency,
    navigationStack.length,
  ]);

  // Handle orb selection
  const handleOrbClick = (orbId: number) => {
    if (isZooming) return;
    const orb = currentLevel.orbs.find((o) => o.id === orbId);
    if (!orb) return;
    
    // Just set the selected orb and show details - camera handled separately
    setSelectedOrb(orbId);
    setIsDetailsOpen(true);
  };

  // Handle orb hover
  const handleOrbHover = (orbId: number | null) => {
    setHoveredOrbId(orbId);
  };

  // Modified enterOrbLevel function
  const enterOrbLevel = (orbId: number) => {
    const orb = currentLevel.orbs.find((o) => o.id === orbId);
    if (!orb || !orb.childLevelId) return;

    const childLevel = currentManifestation.levels[orb.childLevelId];
    if (!childLevel) return;

    setNavigationStack((prev) => [...prev, currentLevel]);
    setCurrentLevel(childLevel);
    setIsDetailsOpen(false);
    setSelectedOrb(null);
    
    // Signal that we need to reset camera (handled in page component)
    setShouldResetCamera(true);
  };

  // Handle navigation back up a level
  const navigateToLevel = (levelIndex: number) => {
    if (levelIndex < 0) {
      setCurrentLevel(currentManifestation.rootLevel);
      setNavigationStack([]);
    } else if (levelIndex < navigationStack.length) {
      const newLevel = navigationStack[levelIndex];
      setCurrentLevel(newLevel);
      setNavigationStack((prev) => prev.slice(0, levelIndex));
    }
    
    setIsDetailsOpen(false);
    setSelectedOrb(null);
    moveCameraTo(defaultCameraPosition);
  };

  // Handler for updating an orb's details
  const updateOrbDetails = (
    orbId: number,
    updates: Partial<Orb>,
  ) => {
    const updatedOrbs = currentLevel.orbs.map((orb) =>
      orb.id === orbId ? { ...orb, ...updates } : orb,
    );

    const updatedLevel = {
      ...currentLevel,
      orbs: updatedOrbs,
    };

    setCurrentLevel(updatedLevel);

    const updatedLevels = {
      ...currentManifestation.levels,
      [updatedLevel.id]: updatedLevel,
    };

    const updatedManifestation = {
      ...currentManifestation,
      levels: updatedLevels,
      ...(navigationStack.length === 0 ? { rootLevel: updatedLevel } : {}),
    };

    setCurrentManifestation(updatedManifestation);
  };

  // Add a new orb to the current level
  const addOrb = () => {
    const maxOrbs = 8;
    if (currentLevel.orbs.length >= maxOrbs) return;
    
    const newOrbId = Math.max(...currentLevel.orbs.map(o => o.id), 0) + 1;
    const newPositions = computeOrbPositions(currentLevel.orbs.length + 1);
    
    const newOrb = {
      id: newOrbId,
      position: new THREE.Vector3(0, 0, 0),
      name: `New Orb ${newOrbId}`,
      description: "Add your description here",
    };
    
    const updatedOrbs = [...currentLevel.orbs, newOrb];
    
    const orbPositionUpdates = updatedOrbs.map((orb, index) => ({
      orb,
      targetPosition: newPositions[index]
    }));
    
    const updatedLevel = {
      ...currentLevel,
      orbs: updatedOrbs,
    };
    
    setCurrentLevel(updatedLevel);
    
    const updatedLevels = {
      ...currentManifestation.levels,
      [updatedLevel.id]: updatedLevel,
    };
    
    const updatedManifestation = {
      ...currentManifestation,
      levels: updatedLevels,
      ...(navigationStack.length === 0 ? { rootLevel: updatedLevel } : {}),
    };
    
    setCurrentManifestation(updatedManifestation);
    
    // Animate orbs to new positions
    orbPositionUpdates.forEach(({ orb, targetPosition }) => {
      gsap.to(orb.position, {
        x: targetPosition.x,
        y: targetPosition.y, 
        z: targetPosition.z,
        duration: 2.5,
        ease: "power2.out",
        onUpdate: () => {
          setCurrentLevel(prev => ({...prev}));
        },
        onComplete: () => {
          if (orb.id === newOrbId) {
            moveCameraTo(defaultCameraPosition, 0.75, true);
          }
        }
      });
    });
  };

  // Reset to the original manifestation state
  const resetManifestation = () => {
    currentLevel.orbs.forEach(orb => {
      gsap.killTweensOf(orb.position);
    });

    const originalManifest = loadManifestation();
    const freshManifest = createFreshManifestationCopy(originalManifest);
    
    setCurrentManifestation(freshManifest);
    setCurrentLevel(freshManifest.rootLevel);
    setNavigationStack([]);
    setIsDetailsOpen(false);
    setSelectedOrb(null);
    setOperationSettings({
      isRunning: false,
      frequency: 1000,
      focus: "balanced",
      activeOrbId: null,
    });
    
    resetCameraView();
  };

  // Toggle the operation state
  const toggleOperation = () => {
    if (navigationStack.length === 0) {
      alert(
        "Operations can only be run on sub-levels. Please navigate into an orb level first."
      );
      return;
    }

    setOperationSettings((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  // Update operation settings
  const updateOperationSettings = (updates: Partial<OperationSettings>) => {
    setOperationSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Add a function to close panel without camera movement
  const zoomOutCamera = () => {
    // Just handle closing the panel, not the camera
    setIsDetailsOpen(false);
    setSelectedOrb(null);
  };

  

  // Check if we're at the root level
  const isRootLevel = navigationStack.length === 0;

  // Create navigation breadcrumbs
  const breadcrumbs = [
    // Only include root manifestation name if we're not at root level
    ...(isRootLevel ? [] : [{
      name: currentManifestation.name,
      onClick: () => navigateToLevel(-1),
    }]),
    // Include intermediate levels, but skip the root level
    ...navigationStack.slice(1).map((level, index) => ({
      name: level.name,
      onClick: () => navigateToLevel(index + 1), // +1 because we skipped the first item
    })),
    // Current level (only if not root)
    ...(isRootLevel ? [{
      name: currentLevel.name,
      onClick: () => {},
    }] : [{
      name: currentLevel.name,
      onClick: () => {},
    }]),
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
        activeOrbId: null,
      },
    };

    return {
      id: "new",
      name: "Untitled Manifestation",
      rootLevel,
      levels: {
        root: rootLevel,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    // States
    currentManifestation,
    currentLevel,
    navigationStack,
    selectedOrb,
    isDetailsOpen,
    hoveredOrbId,
    isZooming,
    operationSettings,
    breadcrumbs,
    isRootLevel,
    shouldResetCamera,
    
    // Actions
    handleOrbClick,
    handleOrbHover,
    enterOrbLevel,
    navigateToLevel,
    updateOrbDetails,
    addOrb,
    resetManifestation,
    toggleOperation,
    updateOperationSettings,
    zoomOutCamera,
    setIsZooming,
    setShouldResetCamera,
  };
} 