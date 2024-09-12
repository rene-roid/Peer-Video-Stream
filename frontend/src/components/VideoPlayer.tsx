import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import debounce from 'lodash.debounce';

const API_URL = 'http://192.168.1.142:8000';

const socket = io(API_URL);

interface VideoPlayerProps {
    sessionCode: string;
    isLeader: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ sessionCode, isLeader }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1); // Volume state

    // Debounced functions to handle play and pause
    const debouncedPlay = useRef(debounce(() => {
        if (videoRef.current) {
            socket.emit('control', { sessionCode, action: 'play', timestamp: videoRef.current.currentTime });
            console.log('Play command sent');
        }
    }, 100));

    const debouncedPause = useRef(debounce(() => {
        if (videoRef.current) {
            socket.emit('control', { sessionCode, action: 'pause', timestamp: videoRef.current.currentTime });
            console.log('Pause command sent');
        }
    }, 100));

    useEffect(() => {
        // Join the session via WebSocket
        socket.emit('join-session', sessionCode);

        // Sync video when control events are received from the leader
        const handleSync = ({ action, timestamp }: { action: string; timestamp: number }) => {
            if (videoRef.current) {
                if (action === 'play') {
                    videoRef.current.currentTime = timestamp;
                    videoRef.current.play().catch(error => console.error('Play error:', error));
                    setIsPlaying(true);
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
        // Update the current time whenever the video time changes
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
                videoRef.current.removeEventListener('timeupdate', updateTime);
            }
        };
    }, []);

    useEffect(() => {
        // Update the volume of the video element
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    }, [volume]);

    // Toggle full-screen mode
    const handleFullScreenToggle = () => {
        if (videoRef.current) {
            if (!isFullScreen) {
                if (videoRef.current.requestFullscreen) {
                    videoRef.current.requestFullscreen();
                }
                setIsFullScreen(true);
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                setIsFullScreen(false);
            }
        }
    };

    // Use debounced functions instead of immediate ones
    const handlePlay = () => debouncedPlay.current();
    const handlePause = () => debouncedPause.current();

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
    };

    return (
        <div>
            <video
                ref={videoRef}
                controls={isLeader}
                onPlay={isLeader ? handlePlay : undefined}
                onPause={isLeader ? handlePause : undefined}
                style={{ width: '100%', height: 'auto' }}
            >
                <source src={`${API_URL}/api/v1/video`} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div>
                <button onClick={handleFullScreenToggle}>
                    {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                </button>
                <p>Current Time: {currentTime.toFixed(2)}s</p>
                <label>
                    Volume:
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>
        </div>
    );
};

export default VideoPlayer;