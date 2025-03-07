import { useState } from 'react';
import { Play, Square, Settings, X } from 'lucide-react';
import { OperationSettings, OperationFocus } from '@/lib/manifestationData';

interface OperationControlsProps {
  isRootLevel: boolean;
  operationSettings: OperationSettings;
  onToggleOperation: () => void;
  onUpdateSettings: (updates: Partial<OperationSettings>) => void;
}

export function OperationControls({
  isRootLevel,
  operationSettings,
  onToggleOperation,
  onUpdateSettings
}: OperationControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

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
    <div className="relative">
      {/* Main Operation Button */}
      <button
        className={`px-4 py-2 ${operationSettings.isRunning ? 'bg-purple-700' : 'bg-purple-500'} text-white rounded flex items-center space-x-1 ${isRootLevel ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onToggleOperation}
        disabled={isRootLevel}
      >
        {operationSettings.isRunning ? (
          <>
            <Square size={16} />
            <span>Stop Operation</span>
          </>
        ) : (
          <>
            <Play size={16} />
            <span>Run Operation</span>
          </>
        )}
      </button>
      
      {/* Settings Button */}
      <button
        className="ml-2 px-2 py-2 bg-gray-700 text-white rounded inline-flex items-center"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings size={16} />
      </button>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-full right-0 mb-2 p-4 bg-black bg-opacity-80 rounded-md w-64 text-white shadow-lg border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Operation Settings</h4>
            <button onClick={() => setShowSettings(false)}>
              <X size={16} className="text-gray-400 hover:text-white" />
            </button>
          </div>
          
          {/* Frequency Setting */}
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Frequency</label>
            <select
              value={operationSettings.frequency}
              onChange={(e) => onUpdateSettings({ frequency: Number(e.target.value) })}
              className="w-full bg-gray-800 text-white p-2 rounded"
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Focus Setting */}
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Focus</label>
            <select
              value={operationSettings.focus}
              onChange={(e) => onUpdateSettings({ focus: e.target.value as OperationFocus })}
              className="w-full bg-gray-800 text-white p-2 rounded"
            >
              {focusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-xs text-gray-400 mt-2">
            Settings will take effect immediately for running operations.
          </div>
        </div>
      )}
    </div>
  );
} 