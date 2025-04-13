/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { MdCloudUpload, MdMusicNote } from 'react-icons/md';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface AudioUploaderProps {
  onFileUploaded: (file: File, sessionId: string) => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, []);
  
  const handleFile = async (file: File) => {
    // Check if file is audio
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (MP3, WAV, etc.)');
      return;
    }
    
    // Check size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.session_id) {
        onFileUploaded(file, response.data.session_id);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full max-w-2xl fade-in">
      <div 
        className={`glass-panel p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 upload-area ${
          isDragging ? 'active scale-105' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="audio/*"
          className="hidden" 
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center text-center p-10">
            <div className="relative h-16 w-16 mb-4">
              <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin"></div>
              <div className="absolute inset-3 rounded-full bg-indigo-500 opacity-30 animate-pulse"></div>
            </div>
            <p className="text-xl font-medium text-white">Processing audio file...</p>
            <p className="text-gray-400 mt-2">This might take a moment</p>
          </div>
        ) : (
          <>
            <div className="relative h-24 w-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <MdCloudUpload className="text-5xl text-indigo-500" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2 text-white">Upload Audio File</h3>
            <p className="text-center text-gray-400 mb-6 max-w-md">
              Drag and drop an audio file or click to browse your files
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-lg">
              <AudioFormatBadge format="MP3" />
              <AudioFormatBadge format="WAV" />
              <AudioFormatBadge format="FLAC" />
              <AudioFormatBadge format="OGG" />
              <div className="px-3 py-1 bg-gray-800 rounded-full text-gray-400 text-sm flex items-center">
                <span>Max: 10MB</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 flex items-center gap-3 fade-in">
          <div className="bg-red-800/60 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Helper component for audio format badges
const AudioFormatBadge = ({ format }: { format: string }) => (
  <div className="px-3 py-1 bg-indigo-900/40 border border-indigo-700/30 rounded-full text-indigo-300 text-sm flex items-center gap-1">
    <MdMusicNote className="text-xs" />
    <span>{format}</span>
  </div>
);

export default AudioUploader; 