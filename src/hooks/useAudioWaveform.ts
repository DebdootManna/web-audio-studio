import { useRef, useState, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';

interface UseAudioWaveformProps {
  audioFile: File | null;
  container: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  barWidth?: number;
}

// Define region interface
interface Region {
  start: number;
  end: number;
  color?: string;
}

const useAudioWaveform = ({
  audioFile,
  container,
  height = 120,
  waveColor = '#4f46e5',
  progressColor = '#818cf8',
  cursorColor = '#ffffff',
  barWidth = 2,
}: UseAudioWaveformProps) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  
  // Initialize WaveSurfer
  useEffect(() => {
    if (!audioFile) return;
    
    const wavesurfer = WaveSurfer.create({
      container: `#${container}`,
      height,
      waveColor,
      progressColor,
      cursorColor,
      barWidth,
      barRadius: 2,
      cursorWidth: 1,
      normalize: true,
    });
    
    wavesurfer.on('ready', () => {
      wavesurferRef.current = wavesurfer;
      setIsReady(true);
      setDuration(wavesurfer.getDuration());
    });
    
    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });
    
    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));
    
    // Load audio file
    const fileURL = URL.createObjectURL(audioFile);
    wavesurfer.load(fileURL);
    
    return () => {
      URL.revokeObjectURL(fileURL);
      // Check if wavesurfer still exists and isn't already destroyed
      if (wavesurfer) {
        try {
          // Pause playback before destroying to avoid race conditions
          wavesurfer.pause();
          // Remove all event listeners
          wavesurfer.unAll();
          // Destroy after a small delay to avoid race conditions
          setTimeout(() => {
            wavesurfer.destroy();
          }, 100);
        } catch (err) {
          console.error('Error during wavesurfer cleanup:', err);
        }
      }
      wavesurferRef.current = null;
    };
  }, [audioFile, container, height, waveColor, progressColor, cursorColor, barWidth]);
  
  // Play/Pause control
  const togglePlayPause = useCallback(() => {
    if (!wavesurferRef.current) return;
    
    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
  }, [isPlaying]);
  
  // Create region for selection
  const createRegion = useCallback(({ start, end, color = 'rgba(0, 123, 255, 0.3)' }: Region) => {
    if (!wavesurferRef.current) return null;
    
    const regionsPlugin = wavesurferRef.current.getActivePlugins()[0] as RegionsPlugin;
    if (!regionsPlugin) return null;
    
    // Clear previous regions
    regionsPlugin.clearRegions();
    
    const region = {
      start,
      end,
      color,
      drag: true,
      resize: true,
    };
    
    // Add region and track it
    setActiveRegion(region);
    return region;
  }, []);
  
  // Clear all regions
  const clearRegions = useCallback(() => {
    if (!wavesurferRef.current) return;
    
    const regionsPlugin = wavesurferRef.current.getActivePlugins()[0] as RegionsPlugin;
    if (regionsPlugin) {
      regionsPlugin.clearRegions();
      setActiveRegion(null);
    }
  }, []);
  
  // Jump to specific time
  const seekTo = useCallback((time: number) => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.seekTo(time / duration);
    setCurrentTime(time);
  }, [duration]);
  
  // Set zoom level
  const zoom = useCallback((level: number) => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.zoom(level);
  }, []);
  
  return {
    wavesurfer: wavesurferRef.current,
    isReady,
    isPlaying,
    duration,
    currentTime,
    activeRegion,
    togglePlayPause,
    createRegion,
    clearRegions,
    seekTo,
    zoom,
  };
};

export default useAudioWaveform; 