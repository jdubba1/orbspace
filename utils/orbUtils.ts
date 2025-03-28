import * as THREE from "three";
import { Manifestation, OrbLevel } from "@/lib/manifestationData";

/**
 * Compute optimal positions for orbs based on count
 */
export function computeOrbPositions(n: number): THREE.Vector3[] {
  switch(n) {
    case 2: {
      const d = 4;
      return [
        new THREE.Vector3(-d/2, 0, 0),
        new THREE.Vector3(d/2, 0, 0)
      ];
    }
    case 3: {
      const r = 3;
      return [
        new THREE.Vector3(r * Math.cos(0), r * Math.sin(0), 0),
        new THREE.Vector3(r * Math.cos((2 * Math.PI) / 3), r * Math.sin((2 * Math.PI) / 3), 0),
        new THREE.Vector3(r * Math.cos((4 * Math.PI) / 3), r * Math.sin((4 * Math.PI) / 3), 0)
      ];
    }
    case 4: {
      const scale = 1.5;
      return [
        new THREE.Vector3(1, 1, 1).multiplyScalar(scale),
        new THREE.Vector3(1, -1, -1).multiplyScalar(scale),
        new THREE.Vector3(-1, 1, -1).multiplyScalar(scale),
        new THREE.Vector3(-1, -1, 1).multiplyScalar(scale)
      ];
    }
    case 5: {
      const r = 2.5, h = 3;
      return [
        new THREE.Vector3(0, h, 0),
        new THREE.Vector3(r * Math.cos(0), 0, r * Math.sin(0)),
        new THREE.Vector3(r * Math.cos((2 * Math.PI) / 3), 0, r * Math.sin((2 * Math.PI) / 3)),
        new THREE.Vector3(r * Math.cos((4 * Math.PI) / 3), 0, r * Math.sin((4 * Math.PI) / 3)),
        new THREE.Vector3(0, -h, 0)
      ];
    }
    case 6: {
      const d = 3;
      return [
        new THREE.Vector3(d, 0, 0),
        new THREE.Vector3(-d, 0, 0),
        new THREE.Vector3(0, d, 0),
        new THREE.Vector3(0, -d, 0),
        new THREE.Vector3(0, 0, d),
        new THREE.Vector3(0, 0, -d)
      ];
    }
    case 7: {
      const r = 2.5, h = 3;
      const positions = [];
      positions.push(new THREE.Vector3(0, h, 0));
      for (let i = 0; i < 5; i++) {
        const angle = (2 * Math.PI * i) / 5;
        positions.push(new THREE.Vector3(r * Math.cos(angle), 0, r * Math.sin(angle)));
      }
      positions.push(new THREE.Vector3(0, -h, 0));
      return positions;
    }
    case 8: {
      // Approximate stellated octahedron using cube vertices, rotated to appear pointy side up
      const a = 2;
      const positions = [];
      const rotationX = new THREE.Matrix4().makeRotationX(Math.PI / 4); // 45° rotation around x-axis
      const rotationZ = new THREE.Matrix4().makeRotationZ(Math.PI / 4); // 45° rotation around z-axis
      const rotationMatrix = new THREE.Matrix4().multiplyMatrices(rotationZ, rotationX);
      for (const x of [-a, a]) {
        for (const y of [-a, a]) {
          for (const z of [-a, a]) {
            const vec = new THREE.Vector3(x, y, z);
            vec.applyMatrix4(rotationMatrix);
            positions.push(vec);
          }
        }
      }
      return positions;
    }
    default: {
      const r = 3;
      const positions = [];
      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;
        positions.push(new THREE.Vector3(r * Math.cos(angle), r * Math.sin(angle), 0));
      }
      return positions;
    }
  }
}

/**
 * Create a deep copy of a manifestation with fresh Vector3 objects
 */
export function createFreshManifestationCopy(manifestation: Manifestation): Manifestation {
  return {
    ...manifestation,
    rootLevel: {
      ...manifestation.rootLevel,
      orbs: manifestation.rootLevel.orbs.map(orb => ({
        ...orb,
        position: new THREE.Vector3(orb.position.x, orb.position.y, orb.position.z)
      }))
    },
    levels: Object.entries(manifestation.levels).reduce<Record<string, OrbLevel>>((acc, [key, level]) => {
      acc[key] = {
        ...level,
        orbs: level.orbs.map(orb => ({
          ...orb,
          position: new THREE.Vector3(orb.position.x, orb.position.y, orb.position.z)
        }))
      };
      return acc;
    }, {})
  };
} 