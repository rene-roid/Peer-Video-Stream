import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import http from 'http'; // Import http
import socketServer from './socketServer'; // Import your socket server

// Importing custom modules
import pool from './db';
import { applyServerHardening } from './middleware/middleware';

const app = express();
const port = 8000;  // Change the port if needed

// Create HTTP server
const httpServer = http.createServer(app);

// Apply CORS middleware
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'], // Allow all common HTTP methods
    allowedHeaders: '*', // Allow all headers
}));

// Applying other middleware
applyServerHardening(app);
app.use(express.json()); // Add body parsing middleware
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data

// Function to load routes from a directory
function loadRoutes(folderPath: string, basePath: string = '') {
    fs.readdirSync(folderPath).forEach(file => {
        const filePath = path.join(folderPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            loadRoutes(filePath, `${basePath}/${file}`);
        } else {
            if (fs.existsSync(filePath)) {
                const routeModule = require(filePath).default;
                if (!routeModule) return;

                let routePath = `${basePath}/${file.slice(0, -3)}`;
                const parentFolderName = path.basename(folderPath);

                if (file === 'index.ts' || file === `${parentFolderName}.ts`) {
                    routePath = basePath || '/';
                } else if (file.startsWith('[') && file.endsWith('].ts')) {
                    const paramName = file.slice(1, -4);
                    routePath = `${basePath}/:${paramName}`;
                }

                app.use(`/api/v1${routePath}`, routeModule);
                console.log(`Route loaded: ${routePath}`);
            }
        }
    });
}

// Load routes from the 'routes' directory
const routesPath = path.join(__dirname, 'routes');
loadRoutes(routesPath);

// Set up Socket.io server
const io = socketServer(httpServer);

// Starting the server
httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
