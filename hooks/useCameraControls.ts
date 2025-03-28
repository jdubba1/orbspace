import { useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export function useCameraControls() {
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  
  // Default camera position
  const defaultCameraPosition = new THREE.Vector3(6, 2.5, 10);
  
  // Function to smoothly move the camera to a target position
  const moveCameraTo = (
    target: THREE.Vector3, 
    duration: number = 1.5, 
    lookAtCenter: boolean = false, 
    onComplete?: () => void
  ) => {
    if (orbitControlsRef.current) {
      gsap.to(orbitControlsRef.current.target, {
        x: lookAtCenter ? 0 : target.x,
        y: lookAtCenter ? 0 : target.y,
        z: lookAtCenter ? 0 : target.z,
        duration,
        ease: "power2.inOut",
        onComplete,
      });
      
      gsap.to(orbitControlsRef.current.object.position, {
        x: target.x,
        y: target.y,
        z: target.z + 4.5,
        duration,
        ease: "power2.inOut",
      });
    }
  };
  
  // Center camera on a set of orbs
  const centerCameraOnOrbs = (orbs: { position: THREE.Vector3 }[]) => {
    if (!orbs.length || !orbitControlsRef.current) return;
    
    // Calculate center
    const center = new THREE.Vector3();
    orbs.forEach(orb => {
      center.add(orb.position);
    });
    center.divideScalar(orbs.length);
    
    // Set orbit controls target
    gsap.to(orbitControlsRef.current.target, {
      x: center.x,
      y: center.y,
      z: center.z,
      duration: 1.5,
      ease: "power2.inOut",
    });
  };
  
  // Updated resetCameraView function without setupCameraConstraints
  const resetCameraView = (onComplete?: () => void) => {
    if (orbitControlsRef.current) {
      // Reset target to origin
      orbitControlsRef.current.target.set(0, 0, 0);
      
      // Get camera
      const camera = orbitControlsRef.current.object;
      
      // Kill any existing animations to prevent conflicts
      gsap.killTweensOf(camera.position);
      
      // Simple, direct animation to default position
      gsap.to(camera.position, {
        x: defaultCameraPosition.x,
        y: defaultCameraPosition.y, 
        z: defaultCameraPosition.z,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          orbitControlsRef.current?.update();
        },
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });
    } else {
      if (onComplete) onComplete();
    }
  };
  
  return {
    orbitControlsRef,
    defaultCameraPosition,
    moveCameraTo,
    centerCameraOnOrbs,
    resetCameraView
  };
} 