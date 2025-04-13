import React, { useState } from 'react';
import { MdSave } from 'react-icons/md';

// Frequency bands for the 8-band equalizer
const EQ_BANDS = [
  { freq: '60Hz', label: 'Sub Bass' },
  { freq: '150Hz', label: 'Bass' },
  { freq: '400Hz', label: 'Low Mid' },
  { freq: '1kHz', label: 'Mid' },
  { freq: '2.4kHz', label: 'High Mid' },
  { freq: '6kHz', label: 'Presence' },
  { freq: '10kHz', label: 'Brilliance' },
  { freq: '14kHz', label: 'Air' },
];

interface AudioEqualizerProps {
  onApplyEQ: (values: number[]) => void;
  isProcessing: boolean;
}

const AudioEqualizer: React.FC<AudioEqualizerProps> = ({ onApplyEQ, isProcessing }) => {
  // Initialize EQ values to 0dB (no change)
  const [eqValues, setEqValues] = useState<number[]>(new Array(8).fill(0));
  
  // Handle slider change
  const handleSliderChange = (index: number, value: number) => {
    const newValues = [...eqValues];
    newValues[index] = value;
    setEqValues(newValues);
  };
  
  // Reset all sliders to 0dB
  const handleReset = () => {
    setEqValues(new Array(8).fill(0));
  };
  
  // Apply the current EQ settings
  const handleApply = () => {
    onApplyEQ(eqValues);
  };
  
  return (
    <div className="py-4">
      <div className="grid grid-cols-8 gap-3 mb-8">
        {EQ_BANDS.map((band, index) => (
          <div 
            key={band.freq}
            className="flex flex-col items-center"
          >
            <div className="h-52 bg-gray-700 rounded-lg w-16 flex flex-col items-center justify-center relative">
              {/* EQ Value Label */}
              <div className="absolute top-2 text-sm font-medium">
                {eqValues[index] > 0 ? '+' : ''}{eqValues[index]}dB
              </div>
              
              {/* Vertical slider */}
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={eqValues[index]}
                onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                className="h-40 appearance-none bg-transparent cursor-pointer"
                style={{ 
                  writingMode: 'vertical-lr', /* Vertical slider */ 
                  WebkitAppearance: 'slider-vertical',
                  padding: '0 15px' 
                }}
              />
              
              {/* Visual indicator that changes color based on value */}
              <div 
                className="absolute w-4 h-4 rounded-full"
                style={{
                  backgroundColor: 
                    eqValues[index] > 0 
                      ? `rgba(52, 211, 153, ${Math.min(1, eqValues[index] / 10)})` 
                      : eqValues[index] < 0 
                        ? `rgba(248, 113, 113, ${Math.min(1, Math.abs(eqValues[index]) / 10)})` 
                        : 'rgb(156, 163, 175)',
                  bottom: `${((eqValues[index] + 20) / 40) * 100}%`
                }}
              />
            </div>
            
            <div className="mt-2 text-center">
              <div className="text-sm font-medium">{band.freq}</div>
              <div className="text-xs text-gray-400">{band.label}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Reset EQ
        </button>
        
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          disabled={isProcessing}
        >
          <MdSave />
          <span>{isProcessing ? 'Processing...' : 'Apply EQ'}</span>
        </button>
      </div>
    </div>
  );
};

export default AudioEqualizer; 