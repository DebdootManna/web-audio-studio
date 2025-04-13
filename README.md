# WebAudio Studio

A browser-based audio editing application with professional features. Edit audio files with trimming, cutting, splitting, and apply 8-band equalizer adjustments without needing to create an account.

## Features

- **Basic Audio Editing**: Trim, cut, split, and apply cross-fading to audio files
- **Vocal Extraction**: Separate vocals from instrumental audio
- **8-Band Equalizer**: Visually adjust frequency bands with real-time feedback
- **No Account Required**: Process everything in your browser with no login needed
- **Session Management**: Reset on page refresh, but includes history during your editing session

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **Backend**: Python (FastAPI)
- **Audio Processing**: FFmpeg, Spleeter (for vocal extraction)
- **Visualization**: Wavesurfer.js + Web Audio API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- FFmpeg installed on your system

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/webaudio-studio.git
cd webaudio-studio
```

#### 2. Install frontend dependencies

```bash
npm install
```

#### 3. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

#### 1. Start the backend server

```bash
cd backend
python main.py
```

The backend API will be available at http://localhost:8000

#### 2. Start the frontend development server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Usage Guide

1. **Upload Audio File**: Drag and drop your audio file or click to browse
2. **Editing Tools**:
   - **Trim**: Select a region by dragging on the waveform and click "Apply Trim"
   - **Split**: Add split points and click "Apply Split" to divide the audio
   - **Vocal Extraction**: Click "Extract Vocals" to separate vocals from instruments
   - **Equalizer**: Adjust the 8 frequency bands and click "Apply EQ"
3. **Controls**:
   - Play/Pause: Control audio playback
   - Zoom: Adjust zoom level to see more details in the waveform
   - Reset: Start a new project

## Deployment

### Frontend

The Next.js application can be deployed to Vercel:

```bash
npm run build
```

### Backend

For production deployment:

1. Use a proper WSGI server like Gunicorn
2. Set up HTTPS
3. Configure proper CORS settings in the FastAPI application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Wavesurfer.js](https://wavesurfer-js.org/) for audio visualization
- [Spleeter](https://github.com/deezer/spleeter) for vocal extraction
- [FastAPI](https://fastapi.tiangolo.com/) for the backend API
- [Next.js](https://nextjs.org/) for the frontend framework
