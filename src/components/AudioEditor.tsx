import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  MdPlayArrow, MdPause, MdContentCut, 
  MdSave, MdZoomIn, MdZoomOut, MdDelete, MdOutlineRadio
} from 'react-icons/md';
import useAudioWaveform from '@/hooks/useAudioWaveform';
import AudioEqualizer from './AudioEqualizer';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface AudioEditorProps {
  file: File;
  sessionId: string;
}

type EditorTool = 'trim' | 'split' | 'vocals' | 'eq';

const AudioEditor: React.FC<AudioEditorProps> = ({ file, sessionId }) => {
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState<EditorTool>('trim');
  const [zoomLevel, setZoomLevel] = useState(50);
  const [splitPoints, setSplitPoints] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use our custom audio waveform hook
  const {
    wavesurfer,
    isReady,
    isPlaying,
    duration,
    currentTime,
    activeRegion,
    togglePlayPause,
    createRegion,
    clearRegions,
    zoom
  } = useAudioWaveform({
    audioFile: file,
    container: 'waveform-container',
  });
  
  // Format time in mm:ss format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle zoom change
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
    zoom(newZoom);
  };
  
  // Create a region for trimming
  const handleCreateTrimRegion = () => {
    if (!wavesurfer || !isReady) return;
    
    const start = wavesurfer.getCurrentTime();
    const end = Math.min(start + 5, duration);
    
    createRegion({ 
      start, 
      end, 
      color: 'rgba(79, 70, 229, 0.3)' 
    });
  };
  
  // Apply trimming to the audio
  const handleTrim = async () => {
    if (!activeRegion || !sessionId) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('start_time', activeRegion.start.toString());
      formData.append('end_time', activeRegion.end.toString());
      formData.append('crossfade', '0.05'); // 50ms crossfade by default
      
      const response = await axios.post(`${API_BASE_URL}/trim`, formData);
      
      if (response.data && response.data.output_file) {
        // Load the trimmed audio
        const audioResponse = await axios.get(
          `${API_BASE_URL}/download/${sessionId}/trimmed.mp3`, 
          { responseType: 'blob' }
        );
        
        const newAudioFile = new File(
          [audioResponse.data], 
          'trimmed.mp3', 
          { type: 'audio/mpeg' }
        );
        
        // Update the waveform
        const url = URL.createObjectURL(newAudioFile);
        wavesurfer?.load(url);
        
        // Clean up
        clearRegions();
      }
    } catch (err) {
      console.error('Error during trim operation:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Add a split point at current position
  const handleAddSplitPoint = () => {
    if (!wavesurfer) return;
    
    const currentPos = wavesurfer.getCurrentTime();
    setSplitPoints(prev => [...prev, currentPos].sort((a, b) => a - b));
    
    // Visualize split points - using a simple console log for now
    // since wavesurfer.js v6 has different marker handling
    console.log(`Split marker added at ${currentPos}s`);
  };
  
  // Apply split operation
  const handleSplit = async () => {
    if (splitPoints.length === 0 || !sessionId) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('split_points', splitPoints.join(','));
      
      const response = await axios.post(`${API_BASE_URL}/split`, formData);
      
      if (response.data && response.data.output_files) {
        // Implement split file handling here
        console.log('Split successful:', response.data.output_files);
        
        // Clear split points
        setSplitPoints([]);
      }
    } catch (err) {
      console.error('Error during split operation:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle vocal extraction
  const handleExtractVocals = async () => {
    if (!sessionId) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      
      const response = await axios.post(`${API_BASE_URL}/extract-vocals`, formData);
      
      // Handle vocal extraction result
      console.log('Extraction response:', response.data);
      
    } catch (err) {
      console.error('Error during vocal extraction:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Apply equalizer settings
  const handleApplyEQ = async (eqValues: number[]) => {
    if (!sessionId) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('eq_values', eqValues.join(','));
      
      const response = await axios.post(`${API_BASE_URL}/equalize`, formData);
      
      // Handle EQ result
      console.log('EQ applied:', response.data);
      
    } catch (err) {
      console.error('Error applying EQ:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Render content based on selected tool
  const renderToolContent = () => {
    switch (selectedTool) {
      case 'trim':
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Trim Audio</h3>
              <p className="text-sm text-gray-400">
                Select a region to keep and discard the rest
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleCreateTrimRegion}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                disabled={!isReady}
              >
                <MdContentCut />
                <span>Create Trim Region</span>
              </button>
              
              {activeRegion && (
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <div>Start: {formatTime(activeRegion.start)}</div>
                    <div>End: {formatTime(activeRegion.end)}</div>
                    <div>Duration: {formatTime(activeRegion.end - activeRegion.start)}</div>
                  </div>
                  
                  <button
                    onClick={handleTrim}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <MdSave />
                    <span>{isProcessing ? 'Processing...' : 'Apply Trim'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'split':
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Split Audio</h3>
              <p className="text-sm text-gray-400">
                Add split points to divide audio into multiple segments
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddSplitPoint}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                  disabled={!isReady}
                >
                  <MdContentCut />
                  <span>Add Split Point at {formatTime(currentTime)}</span>
                </button>
                
                <button
                  onClick={() => setSplitPoints([])}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
                  disabled={splitPoints.length === 0}
                >
                  <MdDelete />
                  <span>Clear Points</span>
                </button>
              </div>
              
              {splitPoints.length > 0 && (
                <div>
                  <div className="mb-2">
                    <h4 className="text-sm font-medium">Split Points:</h4>
                    <ul className="text-sm text-gray-300">
                      {splitPoints.map((point, index) => (
                        <li key={index}>{index + 1}. {formatTime(point)}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={handleSplit}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <MdSave />
                    <span>{isProcessing ? 'Processing...' : 'Apply Split'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'vocals':
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Vocal Extraction</h3>
              <p className="text-sm text-gray-400">
                Separate vocals from instruments
              </p>
            </div>
            
            <div>
              <button
                onClick={handleExtractVocals}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                disabled={!isReady || isProcessing}
              >
                <MdOutlineRadio />
                <span>{isProcessing ? 'Processing...' : 'Extract Vocals'}</span>
              </button>
              
              <p className="mt-2 text-sm text-yellow-500">
                Note: This operation may take some time depending on the file size and length.
              </p>
            </div>
          </div>
        );
        
      case 'eq':
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">8-Band Equalizer</h3>
              <p className="text-sm text-gray-400">
                Adjust frequency bands to enhance audio quality
              </p>
            </div>
            
            <AudioEqualizer onApplyEQ={handleApplyEQ} isProcessing={isProcessing} />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold mb-4">
          Editing: {file.name}
        </h2>
        
        {/* Audio visualization */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!isReady}
              >
                {isPlaying ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
              </button>
              
              <div className="text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleZoomChange(Math.max(10, zoomLevel - 10))}
                className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                disabled={zoomLevel <= 10}
              >
                <MdZoomOut size={20} />
              </button>
              
              <button
                onClick={() => handleZoomChange(Math.min(200, zoomLevel + 10))}
                className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                disabled={zoomLevel >= 200}
              >
                <MdZoomIn size={20} />
              </button>
            </div>
          </div>
          
          <div className="h-6" id="waveform-container-timeline"></div>
          <div 
            ref={waveformContainerRef} 
            id="waveform-container" 
            className="w-full"
          ></div>
        </div>
      </div>
      
      {/* Tools */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-700 pb-4">
            <button
              onClick={() => setSelectedTool('trim')}
              className={`px-4 py-2 rounded-md ${
                selectedTool === 'trim' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Trim
            </button>
            
            <button
              onClick={() => setSelectedTool('split')}
              className={`px-4 py-2 rounded-md ${
                selectedTool === 'split' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Split
            </button>
            
            <button
              onClick={() => setSelectedTool('vocals')}
              className={`px-4 py-2 rounded-md ${
                selectedTool === 'vocals' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Vocal Extraction
            </button>
            
            <button
              onClick={() => setSelectedTool('eq')}
              className={`px-4 py-2 rounded-md ${
                selectedTool === 'eq' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Equalizer
            </button>
          </div>
        </div>
        
        {renderToolContent()}
      </div>
    </div>
  );
};

export default AudioEditor; 