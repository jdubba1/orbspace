import { useState, useRef, useEffect } from 'react';
import { Play, Square, Settings, X, Plus, RefreshCw, ChevronDown } from 'lucide-react';
import { OperationSettings, OperationFocus } from '@/lib/manifestationData';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showSettings, setShowSettings] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside of settings dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define frequency options
  const frequencyOptions = [
    { value: 500, label: 'Very Fast (0.5s)' },
    { value: 800, label: 'Fast (0.8s)' },
    { value: 1000, label: 'Medium (1s)' },
    { value: 1500, label: 'Slow (1.5s)' },
    { value: 2000, label: 'Very Slow (2s)' },
  ];

  // Define focus options
  const focusOptions: { value: OperationFocus, label: string }[] = [
    { value: 'balanced', label: 'Balanced' },
    { value: 'intense', label: 'Intense' },
    { value: 'subtle', label: 'Subtle' },
    { value: 'pulsing', label: 'Pulsing' },
  ];

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

// Custom Ethereal Button component
interface EtherealButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'green' | 'red' | 'purple' | 'blue';
  className?: string;
}

function EtherealButton({ 
  children, 
  onClick, 
  disabled, 
  variant = 'blue',
  className = ''
}: EtherealButtonProps) {
  // Define base colors based on variant
  const getColors = () => {
    switch (variant) {
      case 'green':
        return {
          base: 'from-emerald-900/80 to-emerald-700/60',
          hover: 'from-emerald-800/90 to-emerald-600/70',
          active: 'from-emerald-700 to-emerald-500/80',
          border: 'border-emerald-500/30',
          glow: 'shadow-emerald-500/30',
          borderHover: 'border-emerald-400/50'
        };
      case 'red':
        return {
          base: 'from-rose-900/80 to-rose-700/60',
          hover: 'from-rose-800/90 to-rose-600/70',
          active: 'from-rose-700 to-rose-500/80',
          border: 'border-rose-500/30',
          glow: 'shadow-rose-500/30',
          borderHover: 'border-rose-400/50'
        };
      case 'purple':
        return {
          base: 'from-purple-900/80 to-purple-700/60',
          hover: 'from-purple-800/90 to-purple-600/70',
          active: 'from-purple-700 to-purple-500/80',
          border: 'border-purple-500/30',
          glow: 'shadow-purple-500/30',
          borderHover: 'border-purple-400/50'
        };
      default: // blue
        return {
          base: 'from-blue-900/80 to-blue-700/60',
          hover: 'from-blue-800/90 to-blue-600/70',
          active: 'from-blue-700 to-blue-500/80',
          border: 'border-blue-500/30',
          glow: 'shadow-blue-500/30',
          borderHover: 'border-blue-400/50'
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-4 py-2 rounded-full flex items-center justify-center
        text-white font-medium
        bg-gradient-to-r ${colors.base}
        border ${colors.border}
        shadow-md shadow-inner ${colors.glow}
        backdrop-blur-sm
        transition-all duration-300
        hover:bg-gradient-to-r ${colors.hover}
        hover:border-opacity-80 hover:${colors.borderHover}
        hover:shadow-lg
        active:bg-gradient-to-r ${colors.active}
        active:shadow-inner
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-opacity-70
        ${className}
      `}
    >
      {/* Inner glow */}
      <span className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.base} opacity-0 hover:opacity-20 transition-opacity duration-300`}></span>
      
      {/* Content */}
      <span className="relative flex items-center justify-center">
        {children}
      </span>
    </button>
  );
} 