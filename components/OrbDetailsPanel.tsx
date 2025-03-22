// * Orb Details Panel Component
// ? This component displays and manages the details of a selected orb
// ! Critical for orb information management and navigation

import { X } from 'lucide-react';
import type { Orb } from '@/lib/manifestationData';

// * Interface Definition
// ? Define the component's props
interface OrbDetailsPanelProps {
  orb: Orb;
  isRootLevel: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Orb>) => void;
  onEnterLevel: () => void;
}

// * Main OrbDetailsPanel Component
// ? Provides interface for viewing and editing orb details
export function OrbDetailsPanel({
  orb,
  isRootLevel,
  onClose,
  onUpdate,
  onEnterLevel
}: OrbDetailsPanelProps) {
  return (
    // * Panel Container
    // ? Fixed position panel with backdrop blur and animations
    <div className="fixed right-0 top-0 h-full w-80 bg-black bg-opacity-80 backdrop-blur-sm p-6 text-white shadow-xl border-l border-white/10">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Orb Details</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Orb Name Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Name</label>
        <input
          type="text"
          value={orb.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30"
        />
      </div>

      {/* Orb Description Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea
          value={orb.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full h-32 bg-black/50 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30 resize-none"
        />
      </div>

      {/* Navigation Button */}
      {/* ? Only show enter level button if not at root level */}
      {!isRootLevel && (
        <button
          onClick={onEnterLevel}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
        >
          {orb.childLevelId ? 'Enter Level' : 'Create Sub-Level'}
        </button>
      )}
    </div>
  );
} 