import * as THREE from 'three';

/**
 * Types of focus for operations
 */
export type OperationFocus = "balanced" | "intense" | "subtle" | "pulsing";

/**
 * Settings for running an operation
 */
export interface OperationSettings {
  isRunning: boolean;
  frequency: number; // milliseconds between activations
  focus: OperationFocus;
  activeOrbId: number | null;
}

/**
 * An orb within a level
 */
export interface Orb {
  id: number;
  position: THREE.Vector3;
  name?: string;
  description?: string;
  image?: string;
  sigil?: string;
  randomNumber?: number;
  childLevelId?: string; // Reference to a child level if this orb has children
}

/**
 * A level within a manifestation
 */
export interface OrbLevel {
  id: string;
  name: string;
  orbs: Orb[];
  operationSettings: OperationSettings;
}

/**
 * A complete manifestation with multiple levels
 */
export interface Manifestation {
  id: string;
  name: string;
  description?: string;
  rootLevel: OrbLevel;
  levels: Record<string, OrbLevel>; // Map of level IDs to levels
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A user of the application
 */
export interface User {
  id: string;
  name: string;
  manifestations: string[]; // IDs of manifestations
}

// Scaling factor for orb positions
const scaleFactor = 2;

// Sample sigil images
export const sampleSigils = [
  "sigil1", "sigil2", "sigil3", "sigil4", "sigil5", "sigil6"
];

// Initialize our prepopulated manifestations
export const prepopulatedManifestations: Record<string, Manifestation> = {
  "1": createLifeAspectsManifestation(),
  "2": createStarManifestation(),
};

/**
 * Create the "Life Aspects" manifestation with nested levels
 */
function createLifeAspectsManifestation(): Manifestation {
  // Create the Work level
  const workLevel: OrbLevel = {
    id: "work",
    name: "Work",
    orbs: [
      { id: 0, position: new THREE.Vector3(0, 1 * scaleFactor, 0), name: "Projects", description: "Current and future work projects" },
      { id: 1, position: new THREE.Vector3((2 * Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, 0), name: "Boss", description: "Relationship with management" },
      { id: 2, position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (Math.sqrt(2 / 3)) * scaleFactor), name: "Growth", description: "Personal and professional development" },
      { id: 3, position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (-Math.sqrt(2 / 3)) * scaleFactor), name: "Promotion", description: "Career advancement opportunities" },
    ],
    operationSettings: {
      isRunning: false,
      frequency: 1000,
      focus: "balanced",
      activeOrbId: null
    }
  };

  // Create the Finance level
  const financeLevel: OrbLevel = {
    id: "finance",
    name: "Finance",
    orbs: [
      { id: 0, position: new THREE.Vector3(0, 1 * scaleFactor, 0), name: "Savings", description: "Building financial security" },
      { id: 1, position: new THREE.Vector3((2 * Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, 0), name: "Investments", description: "Growing your wealth" },
      { id: 2, position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (Math.sqrt(2 / 3)) * scaleFactor), name: "Budget", description: "Managing daily finances" },
    ],
    operationSettings: {
      isRunning: false,
      frequency: 1200,
      focus: "subtle",
      activeOrbId: null
    }
  };

  // Create the Family level
  const familyLevel: OrbLevel = {
    id: "family",
    name: "Family",
    orbs: [
      { id: 0, position: new THREE.Vector3(0, 1 * scaleFactor, 0), name: "Parents", description: "Connection with parents" },
      { id: 1, position: new THREE.Vector3((2 * Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, 0), name: "Siblings", description: "Relations with brothers and sisters" },
      { id: 2, position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (Math.sqrt(2 / 3)) * scaleFactor), name: "Children", description: "Nurturing the next generation" },
    ],
    operationSettings: {
      isRunning: false,
      frequency: 800,
      focus: "intense",
      activeOrbId: null
    }
  };

  // Create the Love level
  const loveLevel: OrbLevel = {
    id: "love",
    name: "Love",
    orbs: [
      { id: 0, position: new THREE.Vector3(0, 1 * scaleFactor, 0), name: "Dating", description: "Meeting new people" },
      { id: 1, position: new THREE.Vector3((2 * Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, 0), name: "Partnership", description: "Long-term commitment" },
    ],
    operationSettings: {
      isRunning: false,
      frequency: 900,
      focus: "pulsing",
      activeOrbId: null
    }
  };

  // Create the root level with references to child levels
  const rootLevel: OrbLevel = {
    id: "root",
    name: "Life Aspects",
    orbs: [
      { 
        id: 0, 
        position: new THREE.Vector3(0, 1 * scaleFactor, 0),
        name: "Work",
        description: "Your professional life and career aspirations",
        childLevelId: "work",
      },
      { 
        id: 1, 
        position: new THREE.Vector3((2 * Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, 0),
        name: "Finance",
        description: "Your financial well-being and goals",
        childLevelId: "finance",
      },
      { 
        id: 2, 
        position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (Math.sqrt(2 / 3)) * scaleFactor),
        name: "Family",
        description: "Your relationships with family members",
        childLevelId: "family",
      },
      { 
        id: 3, 
        position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (-Math.sqrt(2 / 3)) * scaleFactor),
        name: "Love",
        description: "Your romantic relationships and connections",
        childLevelId: "love",
      },
    ],
    operationSettings: {
      isRunning: false,
      frequency: 1000,
      focus: "balanced",
      activeOrbId: null
    }
  };

  // Create a nested level within Projects for more depth
  const projectsLevel: OrbLevel = {
    id: "projects",
    name: "Projects",
    orbs: [
      { id: 0, position: new THREE.Vector3(0, 1 * scaleFactor, 0), name: "App Development", description: "Building mobile and web applications" },
      { id: 1, position: new THREE.Vector3((2 * Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, 0), name: "Design", description: "Visual and UX design tasks" },
      { id: 2, position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (Math.sqrt(2 / 3)) * scaleFactor), name: "Documentation", description: "Creating technical and user documentation" },
    ],
    operationSettings: {
      isRunning: false,
      frequency: 700,
      focus: "intense",
      activeOrbId: null
    }
  };

  // Link Projects orb to projects level
  workLevel.orbs[0].childLevelId = "projects";

  return {
    id: "1",
    name: "Life Aspects",
    description: "A comprehensive view of your life's important areas",
    rootLevel,
    levels: {
      root: rootLevel,
      work: workLevel,
      finance: financeLevel,
      family: familyLevel,
      love: loveLevel,
      projects: projectsLevel,
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Create the "Star Manifestation" with minimal nesting
 */
function createStarManifestation(): Manifestation {
  const rootLevel: OrbLevel = {
    id: "root",
    name: "Star Manifestation",
    orbs: [
      { id: 0, position: new THREE.Vector3(0, 1 * scaleFactor, 0), name: "North", description: "Direction of wisdom" },
      { id: 1, position: new THREE.Vector3((2 * Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, 0), name: "East", description: "Direction of new beginnings" },
      { id: 2, position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (Math.sqrt(2 / 3)) * scaleFactor), name: "South", description: "Direction of passion" },
      { id: 3, position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (-Math.sqrt(2 / 3)) * scaleFactor), name: "West", description: "Direction of introspection" },
      { id: 4, position: new THREE.Vector3(0, 0, 0), name: "Center", description: "Core of your being" },
    ],
    operationSettings: {
      isRunning: false,
      frequency: 1000,
      focus: "balanced",
      activeOrbId: null
    }
  };

  // Create North level
  const northLevel: OrbLevel = {
    id: "north",
    name: "North",
    orbs: [
      { id: 0, position: new THREE.Vector3(0, 1 * scaleFactor, 0), name: "Meditation", description: "Practices for mindfulness" },
      { id: 1, position: new THREE.Vector3((2 * Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, 0), name: "Study", description: "Learning and personal education" },
      { id: 2, position: new THREE.Vector3((-Math.sqrt(2) / 3) * scaleFactor, (-1 / 3) * scaleFactor, (Math.sqrt(2 / 3)) * scaleFactor), name: "Guidance", description: "Mentorship and advice" },
    ],
    operationSettings: {
      isRunning: false,
      frequency: 1100,
      focus: "subtle",
      activeOrbId: null
    }
  };

  // Link North orb to north level
  rootLevel.orbs[0].childLevelId = "north";

  return {
    id: "2",
    name: "Star Manifestation",
    description: "A directional approach to manifestation",
    rootLevel,
    levels: {
      root: rootLevel,
      north: northLevel,
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
} 