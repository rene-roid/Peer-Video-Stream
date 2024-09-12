import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const router = express.Router();

const sessions: { [key: string]: { timestamp: number } } = {};

// Create a session
router.post('/create', (req, res) => {
    const sessionCode = Math.random().toString(36).substring(2, 8); // Generate random session code
    console.log(`Creating session with code: ${sessionCode}`);
    sessions[sessionCode] = { timestamp: 0 };
    console.log(`Current sessions: ${JSON.stringify(sessions)}`);
    res.json({ sessionCode });
});

// Join a session
router.get('/join/:code', (req, res) => {
    const sessionCode = req.params.code;
    console.log(`Attempting to join session with code: ${sessionCode}`);
    if (sessions[sessionCode]) {
        console.log(`Session ${sessionCode} found`);
        res.json({ message: 'Session joined', sessionCode });
    } else {
        console.log(`Session ${sessionCode} not found`);
        res.status(404).json({ error: 'Session not found' });
    }
});


export default router;