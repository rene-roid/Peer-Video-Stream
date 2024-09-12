import React, { useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';

const API_URL = 'http://192.168.1.142:8000';

const Session: React.FC = () => {
    const [sessionCode, setSessionCode] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState<string>('');
    const [isLeader, setIsLeader] = useState(false);

    const createSession = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/v1/session/create`);
            setSessionCode(response.data.sessionCode);
            setIsLeader(true);
        } catch (error) {
            console.error('Error creating session', error);
        }
    };

    const joinSession = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/session/join/${inputCode}`);
            if (response.data.sessionCode) {
                setSessionCode(response.data.sessionCode);
                setIsLeader(false);
            }
        } catch (error) {
            console.error('Session not found', error);
        }
    };

    const handleCopy = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            // Use Clipboard API if available
            navigator.clipboard.writeText(sessionCode as string)
                .then(() => console.log('Session code copied to clipboard'))
                .catch(err => console.error('Failed to copy session code', err));
        } else if (document.execCommand) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = sessionCode as string;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                const successful = document.execCommand('copy');
                const msg = successful ? 'Session code copied to clipboard' : 'Failed to copy session code';
                console.log(msg);
            } catch (err) {
                console.error('Failed to copy session code', err);
            }
            document.body.removeChild(textarea);
        } else {
            console.error('Clipboard API not supported');
        }
    };

    if (sessionCode) {
        return (
            <div>
                Session code: {sessionCode}
                <button onClick={handleCopy}>Copy</button>
                <VideoPlayer sessionCode={sessionCode} isLeader={isLeader} />
            </div>
        )
    }

    return (
        <div>
            <button onClick={createSession}>Create Session</button>
            <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter session code"
            />
            <button onClick={joinSession}>Join Session</button>
        </div>
    );
};

export default Session;