// * Manifestation Controls Component
// ? This component handles all user interactions for controlling the manifestation
// ! This is the main control interface for the entire application

import { useState, useRef, useEffect } from 'react';
import { Play, Square, Settings, X, Plus, RefreshCw, ChevronDown } from 'lucide-react';
import { OperationSettings, OperationFocus } from '@/lib/manifestationData';
import { motion, AnimatePresence } from 'framer-motion';

// * Interface Definition
// ? Defines the required props for the ManifestationControls component
interface ManifestationControlsProps {
  isRootLevel: boolean;
  operationSettings: OperationSettings;
  orbCount: number;
  maxOrbs: number;
  onAddOrb: () => void;
  onReset: () => void;
  onToggleOperation: () => void;
  onUpdateSettings: (updates: Partial<OperationSettings>) => void;
}

// * Custom Button Component
// ? Provides a consistent ethereal button style across the application
// @param props - Standard button props plus variant for different styles
interface EtherealButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'red' | 'purple';
  children: React.ReactNode;
}

// * Ethereal Button Implementation
function EtherealButton({ variant = 'purple', children, className = '', ...props }: EtherealButtonProps) {
  // ? Define color schemes for different button variants
  const variantStyles = {
    green: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
    red: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500',
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
  };

  return (
    <button
      className={`
        ${variantStyles[variant]}
        px-4 py-2 rounded-lg
        text-white font-medium
        flex items-center justify-center
        transition-all duration-300
        shadow-lg shadow-black/25
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// * Main ManifestationControls Component
export function ManifestationControls({
  isRootLevel,
  operationSettings,
  orbCount,
  maxOrbs,
  onAddOrb,
  onReset,
  onToggleOperation,
  onUpdateSettings
}: ManifestationControlsProps) {
  // * State Management
  const [showSettings, setShowSettings] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // * Settings Panel Options
  // ? Define available options for frequency and focus settings
  const frequencyOptions = [
    { value: 500, label: 'Very Fast (0.5s)' },
    { value: 800, label: 'Fast (0.8s)' },
    { value: 1000, label: 'Medium (1s)' },
    { value: 1500, label: 'Slow (1.5s)' },
    { value: 2000, label: 'Very Slow (2s)' },
  ];

  const focusOptions: { value: OperationFocus, label: string }[] = [
    { value: 'balanced', label: 'Balanced' },
    { value: 'intense', label: 'Intense' },
    { value: 'subtle', label: 'Subtle' },
    { value: 'pulsing', label: 'Pulsing' },
  ];

  // * Click Outside Handler
  // ? Closes the settings panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 flex justify-center mb-8 z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div 
        className="flex items-center space-x-4 bg-black bg-opacity-30 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-glow"
        animate={{ 
          scale: isHovering ? 1.02 : 1,
          boxShadow: isHovering 
            ? '0 0 20px 5px rgba(255, 255, 255, 0.2)' 
            : '0 0 10px 2px rgba(255, 255, 255, 0.1)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Add Orb Button */}
        <EtherealButton 
          onClick={onAddOrb}
          disabled={orbCount >= maxOrbs}
          variant="green"
          className="min-w-[140px] border border-white/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          {orbCount >= maxOrbs ? "Max Orbs Reached" : "Add Orb"}
        </EtherealButton>
        
        {/* Reset Button */}
        <EtherealButton 
          onClick={onReset}
          variant="red"
          className="min-w-[100px] border border-white/30"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </EtherealButton>
        
        {/* Operation Button */}
        <EtherealButton 
          onClick={onToggleOperation}
          disabled={isRootLevel}
          variant="purple"
          className="min-w-[160px] border border-white/80"
        >
          {operationSettings.isRunning ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              Stop Operation
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Operation
            </>
          )}
        </EtherealButton>
        
        {/* Settings Button */}
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="h-10 w-10 rounded-full border border-white/25 bg-white hover:text-white transition-all duration-300 flex items-center justify-center"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          {/* Settings Dropdown */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                ref={settingsRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-full right-0 mb-2 p-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg shadow-xl shadow-black/50 text-white overflow-hidden z-50 min-w-[250px]"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-lg text-white">Settings</h4>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Frequency Setting */}
                <div className="mb-4">
                  <label className="block text-sm text-zinc-400 mb-2">Frequency</label>
                  <div className="relative">
                    <select
                      value={operationSettings.frequency}
                      onChange={(e) => onUpdateSettings({ frequency: Number(e.target.value) })}
                      className="w-full bg-black/50 border border-white/10 text-white p-2 pr-8 rounded appearance-none focus:outline-none focus:ring-1 focus:ring-white/30"
                    >
                      {frequencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-white/50" />
                  </div>
                </div>
                
                {/* Focus Setting */}
                <div className="mb-4">
                  <label className="block text-sm text-zinc-400 mb-2">Focus</label>
                  <div className="relative">
                    <select
                      value={operationSettings.focus}
                      onChange={(e) => onUpdateSettings({ focus: e.target.value as OperationFocus })}
                      className="w-full bg-black/50 border border-white/10 text-white p-2 pr-8 rounded appearance-none focus:outline-none focus:ring-1 focus:ring-white/30"
                    >
                      {focusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-white/50" />
                  </div>
                </div>
                
                <div className="text-xs text-zinc-400 mt-4 italic">
                  Settings take effect immediately.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
} 