import { Server } from 'socket.io';
import http from 'http';

const socketServer = (httpServer: http.Server) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // Allow all origins
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'], // Allow all common HTTP methods
        },
    });

    // Handle connections
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('join-session', (sessionCode: string) => {
            console.log(`Socket ${socket.id} joined session ${sessionCode}`);
            socket.join(sessionCode);
        });

        socket.on('control', ({ sessionCode, action, timestamp }: { sessionCode: string; action: string; timestamp: number }) => {
            io.to(sessionCode).emit('sync', { action, timestamp });
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });


    return io;
};

export default socketServer;
