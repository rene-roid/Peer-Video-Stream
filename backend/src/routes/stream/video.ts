import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI;
const dbName = 'videostream';

// Create a MongoClient
if (!mongoURI) {
    throw new Error('MongoDB connection URI is not defined in environment variables');
}
const client = new MongoClient(mongoURI);

const CHUNK_SIZE = 10 ** 6; // 1MB per chunk for streaming

router.get('/:id', async (req, res) => {
    const videoId = req.params.id;
    console.log(`Received request for video ID: ${videoId}`);

    let db;
    try {
        // Connect to MongoDB
        await client.connect();
        db = client.db(dbName);
        const videosCollection = db.collection('videos');

        // Find the video metadata by ID
        const fileMetadata = await videosCollection.findOne({ _id: new ObjectId(videoId) });
        console.log(`File metadata found: ${fileMetadata}`);
        if (!fileMetadata) {
            return res.status(404).send('File not found');
        }

        const videoPath = path.resolve(fileMetadata.path); // Get the path to the file
        const fileSize = fs.statSync(videoPath).size; // Get the file size

        // Handle range requests for partial content (video streaming)
        const range = req.headers.range;
        if (!range) {
            return res.status(400).send('Requires Range header');
        }

        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;

        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);

        // Create a stream for the video file
        const videoStream = fs.createReadStream(videoPath, { start, end });

        videoStream.pipe(res);

        videoStream.on('error', (err) => {
            console.error('Streaming error:', err);
            res.status(500).send('Error streaming video');
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    } finally {
        await client.close();
    }
});

export default router;