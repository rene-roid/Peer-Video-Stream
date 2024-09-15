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

// Route for uploading files
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded');
        }

        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        const videosCollection = db.collection('videos'); // Collection to store file info

        // Save file metadata in MongoDB
        const fileData = {
            filename: file.originalname,
            path: file.path, // Path to where the file is stored in the uploads folder
            size: file.size,
            uploadedAt: new Date()
        };

        const result = await videosCollection.insertOne(fileData);

        // Close MongoDB connection
        await client.close();

        res.status(201).send({
            message: 'File uploaded successfully',
            fileId: result.insertedId
        });
    } catch (error) {
        await client.close();
        res.status(500).send('Internal server error');
    }
});

export default router;