'use client';

import { useState } from 'react';
import AudioUploader from '@/components/AudioUploader';
import AudioEditor from '@/components/AudioEditor';
import Header from '@/components/Header';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const handleFileUploaded = (file: File, id: string) => {
    setAudioFile(file);
    setSessionId(id);
  };
  
  const handleReset = () => {
    setAudioFile(null);
    setSessionId(null);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <Header onReset={handleReset} />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        {!audioFile ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] fade-in">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-heading">
                WebAudio Studio
              </h1>
              <p className="text-xl text-center max-w-2xl mx-auto mb-6 text-gray-300">
                Free online audio editor with professional features.
                No account required.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-400 mb-12">
                <FeatureBadge text="Trim & Split" />
                <FeatureBadge text="Vocal Extraction" />
                <FeatureBadge text="8-Band EQ" />
                <FeatureBadge text="Cross-fading" />
              </div>
            </div>
            
            <AudioUploader onFileUploaded={handleFileUploaded} />
          </div>
        ) : (
          <div className="fade-in">
            <AudioEditor 
              file={audioFile} 
              sessionId={sessionId as string} 
            />
          </div>
        )}
      </div>
      
      <footer className="mt-auto py-6 text-center text-gray-500 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <p>WebAudio Studio © {new Date().getFullYear()} - Built with Next.js, FastAPI & Web Audio API</p>
        </div>
      </footer>
    </main>
  );
}

const FeatureBadge = ({ text }: { text: string }) => (
  <div className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
    {text}
  </div>
);
