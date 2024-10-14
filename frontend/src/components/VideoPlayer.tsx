import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import debounce from 'lodash.debounce';

const API_URL = 'http://localhost:8000';

const socket = io(API_URL);

interface VideoPlayerProps {
  sessionCode: string;
  isLeader: boolean;
  videoId: string | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ sessionCode, isLeader, videoId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    console.log('Selected video ID:', videoId);
  }, [videoId]);

  const debouncedPlay = useRef(debounce(() => {
    if (videoRef.current && !isEnded) {
      socket.emit('control', { sessionCode, action: 'play', timestamp: videoRef.current.currentTime });
      console.log('Play command sent');
    }
  }, 100));

  const debouncedPause = useRef(debounce(() => {
    if (videoRef.current && !isEnded) {
      socket.emit('control', { sessionCode, action: 'pause' });
      console.log('Pause command sent');
    }
  }, 100));

  useEffect(() => {
    socket.emit('join-session', sessionCode);

    const handleSync = ({ action, timestamp }: { action: string; timestamp: number }) => {
      if (videoRef.current) {
        if (action === 'play') {
          videoRef.current.currentTime = timestamp;
          videoRef.current.play().catch(error => console.error('Play error:', error));
          setIsPlaying(true);
          setIsEnded(false);
        } else if (action === 'pause') {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    socket.on('sync', handleSync);

    return () => {
      socket.off('sync', handleSync);
    };
  }, [sessionCode]);

  useEffect(() => {
    const updateTime = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', updateTime);
    }

    return () => {
      if (videoRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoRef.current.removeEventListener('timeupdate', updateTime);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const handleFullScreenToggle = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handlePlay = () => debouncedPlay.current();
  const handlePause = () => debouncedPause.current();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleError = () => {
    setError('Failed to load the video. Please try again later.');
  };

  const handleEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
    setError(null);
  };

  return (
    <div className="video-player-container">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <video
            ref={videoRef}
            controls={isLeader}
            onPlay={isLeader ? handlePlay : undefined}
            onPause={isLeader ? handlePause : undefined}
            onError={handleError}
            onEnded={handleEnded}
            className="video-element"
          >
            {videoId && (
              <source src={`${API_URL}/api/v1/stream/video/${videoId}`} type="video/mp4" />
            )}
            Your browser does not support the video tag.
          </video>
          <div className="controls-container">
            <div className="video-player-title">
              <div className="session-code-container">
                <span>Session code: {sessionCode}</span>
                <button
                  className="copy-button"
                  onClick={() =>
                    navigator.clipboard.writeText(sessionCode ?? '').then(() => console.log('Copied!'))
                  }
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="video-controls">
              <button className="fullscreen-toggle" onClick={handleFullScreenToggle}>
                Full Screen
              </button>
              <p className="current-time">Current Time: {currentTime.toFixed(2)}s</p>
              <label className="volume-label">
                Volume:
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );

};

export default VideoPlayer;