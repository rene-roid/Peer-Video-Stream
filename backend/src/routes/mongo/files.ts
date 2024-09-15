import { Router } from 'express';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI;
const dbName = 'videostream';

// Set up Multer to handle file uploads (file saved temporarily on disk)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure you have an 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save with timestamp
    }
});

const upload = multer({ storage });

// Create a MongoClient
if (!mongoURI) {
    throw new Error('MongoDB connection URI is not defined in environment variables');
}
const client = new MongoClient(mongoURI);

// Route for fetching all documents in the videos collection
router.get('/', async (req, res) => {
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        const videosCollection = db.collection('videos'); // Collection to store file info

        // Fetch all documents
        const files = await videosCollection.find().toArray();

        // Close MongoDB connection
        await client.close();

        res.status(200).send(files);
    } catch (error) {
        await client.close();
        res.status(500).send('Internal server error');
    }
});

export default router;