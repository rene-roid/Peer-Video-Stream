import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';

import '../App.css';

const API_URL = 'http://localhost:8000';

interface VideoFile {
  _id: string;
  filename: string;
  path: string;
  size: number;
  uploadedAt: string;
}

const Session: React.FC = () => {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState<string>('');
  const [isLeader, setIsLeader] = useState(false);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Fetch available videos from the server
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/mongo/files`);
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  const createSession = async () => {
    if (!selectedVideoId) {
      alert('Please select a video before creating a session');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/v1/session/create`, {
        videoId: selectedVideoId, // Send selected video ID to backend
      });
      setSessionCode(response.data.sessionCode);
      setIsLeader(true);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const joinSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/session/join/${inputCode}`);
      if (response.data.sessionCode) {
        setSessionCode(response.data.sessionCode);
        setSelectedVideoId(response.data.videoId); // Get video ID when joining
        setIsLeader(false);
      }
    } catch (error) {
      console.error('Session not found', error);
    }
  };

  const handleVideoSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVideoId(event.target.value);
  };

  if (sessionCode) {
    return (
      <div>
        <VideoPlayer sessionCode={sessionCode} isLeader={isLeader} videoId={selectedVideoId} />
      </div>
    );
  }

  return (
    <div className="session-container">
      {sessionCode ? (
        <div className="session-info">
          <VideoPlayer sessionCode={sessionCode} isLeader={isLeader} videoId={selectedVideoId} />
          <p className="session-code">Session code: {sessionCode}</p>
          <button
            className="copy-button"
            onClick={() =>
              navigator.clipboard.writeText(sessionCode ?? '').then(() => console.log('Copied!'))
            }
          >
            Copy
          </button>
        </div>
      ) : (
        <div className="session-setup">
          <h2 className="video-select-title">Select a Video:</h2>
          <select className="video-select" onChange={handleVideoSelection}>
            <option value="">-- Select a video --</option>
            {videos.map((video) => (
              <option key={video._id} value={video._id}>
                {video.filename}
              </option>
            ))}
          </select>
  
          <button className="create-session-button" onClick={createSession}>Create Session</button>
          <div className="session-code-container">
            <input
              className="session-code-input"
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter session code"
            />
            <button className="join-session-button" onClick={joinSession}>Join Session</button>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default Session;