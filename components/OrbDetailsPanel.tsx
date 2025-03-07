import { X, ArrowLeft } from 'lucide-react';
import { Orb } from '@/lib/manifestationData';

interface OrbDetailsPanelProps {
  orb: Orb;
  isRootLevel: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Orb>) => void;
  onEnterLevel: () => void;
}

export function OrbDetailsPanel({ 
  orb, 
  isRootLevel, 
  onClose, 
  onUpdate, 
  onEnterLevel 
}: OrbDetailsPanelProps) {
  // Generate a random number for the orb
  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 1000);
  };

  // Sample sigils (in a real app these would be loaded from the server)
  const sampleSigils = [
    "sigil1", "sigil2", "sigil3", "sigil4", "sigil5", "sigil6"
  ];

  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-80 p-6 rounded-lg text-white w-72 shadow-xl border border-gray-700">
      <button 
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
        onClick={onClose}
      >
        <X size={16} />
      </button>
      
      <h3 className="text-xl font-bold mb-4">Orb Details</h3>
      
      <div className="space-y-4">
        {/* Orb Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Name</label>
          <input 
            type="text" 
            value={orb.name || ''}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-gray-800 text-white p-2 rounded"
          />
        </div>
        
        {/* Orb Description */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea 
            value={orb.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full bg-gray-800 text-white p-2 rounded h-20"
          />
        </div>
        
        {/* Advanced features only shown for non-root levels */}
        {!isRootLevel && (
          <>
            {/* Random Number Generator */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Generated Number</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={orb.randomNumber || ''}
                  readOnly
                  className="w-full bg-gray-800 text-white p-2 rounded"
                />
                <button 
                  onClick={() => onUpdate({ randomNumber: generateRandomNumber() })}
                  className="bg-indigo-600 text-white px-2 py-1 rounded"
                >
                  Generate
                </button>
              </div>
            </div>
            
            {/* Sigil Selection */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Select Sigil</label>
              <div className="grid grid-cols-3 gap-2">
                {sampleSigils.map((sigil, index) => (
                  <div 
                    key={sigil}
                    className={`bg-gray-800 p-2 rounded flex items-center justify-center cursor-pointer ${orb.sigil === sigil ? 'ring-2 ring-yellow-500' : ''}`}
                    onClick={() => onUpdate({ sigil })}
                  >
                    {/* Placeholder for sigil graphics */}
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Enter Level Button (only if orb has children) */}
        {orb.childLevelId && (
          <button 
            onClick={onEnterLevel}
            className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded flex items-center justify-center space-x-2"
          >
            <span>Enter {orb.name || 'Orb'} Space</span>
            <ArrowLeft className="transform rotate-180" size={16} />
          </button>
        )}
      </div>
    </div>
  );
} 