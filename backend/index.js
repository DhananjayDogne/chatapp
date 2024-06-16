const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Use CORS middleware
app.use(cors({
    origin: '*',
}));

const broadcasters = {}; // Store broadcaster sockets
const watchers = {}; // Store watcher sockets

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('hello', () => {
        socket.emit('helloback', 'Hello from server');
        });

        socket.on('message', (data) => {
        io.emit('getmessage', data);
    });

    socket.on('file-chunk', (data) => {
        const { id, filename, chunk, currentChunk, totalChunks } = data;
        const uploadDir = path.join(__dirname, 'uploads');
        const filepath = path.join(uploadDir, filename);

        // Create uploads directory if it does not exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        fs.appendFile(filepath, Buffer.from(chunk), (err) => {
            if (err) {
                console.error('Error writing chunk:', err);
                return;
            }

            if (currentChunk + 1 === totalChunks) {
                console.log('File upload completed');
                
                // Read the file and send as Base64 string
                fs.readFile(filepath, (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                        }
                        
                        const base64Data = data.toString('base64');
                        io.emit('getfile', { id, filename, base64Data });
                        
                        // Clean up the uploads directory
                        fs.rm(uploadDir, { recursive: true, force: true }, (err) => {
                            if (err) {
                                console.error('Error deleting uploads directory:', err);
                                } else {
                                    console.log('Uploads directory deleted successfully');
                                    }
                                    });
                        });
            }
        });
    });
    
    
    // for live video
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Client joined room ${room}`);
        
        socket.on('offer', (offer) => {
            socket.to(room).emit('offer', offer);
            });
            
        socket.on('answer', (answer) => {
            socket.to(room).emit('answer', answer);
        });
        
        socket.on('candidate', (candidate) => {
            socket.to(room).emit('candidate', candidate);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected from room ${room}`);
            socket.leave(room);
        });
    });
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
