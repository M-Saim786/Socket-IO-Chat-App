const express = require('express');
const http = require('http');
const serverIo = require('socket.io');
const cors = require('cors');
const { copyFileSync } = require('fs');
require("dotenv").config()
const bodyParser = require('body-parser');

const mainRouter = require("./Router/mainRouter")
const mongoose = require("mongoose")
const dbUrl = process.env.dbUrl
console.log(dbUrl)
mongoose.connect(dbUrl).then((res) => {
    console.log("MongoDb Connected")
}).catch((err) => {
    console.log("err:", err)
})

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors())
app.use(mainRouter)

const server = http.createServer(app);

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173'
];

const io = serverIo(server, {
    cors: {
        origin: (origin, callback) => {
            if (allowedOrigins.includes(origin) || !origin) {
                // Allow requests from listed origins or from no origin (e.g., testing or postman)
                callback(null, true);
            } else {
                // Disallow requests from other origins
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
    },
});

// app.use(cors()) // Uncomment only if necessary for cross-origin requests

let messages = []

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id); // Log for debugging

    // Join a chat room
    socket.on('join-room', ({ roomId, user }) => {
        socket.join(roomId);
        console.log(`${user} joined room: ${roomId}`);
        // console.log(`User joined room: ${user}`);
    });

    // Leave a chat room
    socket.on('leaveRoom', ({ roomId }) => {
        socket.leave(roomId);
        console.log(`User left room: ${roomId}`);
    });


    socket.on('user-joined', (username) => {
        console.log('User joined:', username);

        // Broadcast the join message to all connected clients (including the joining user)
        socket.broadcast.emit('cast-user-joined', ` ${username} Joined the chat!`);

        // Optionally, send a welcome message to the joining user
        socket.emit('welcome', `Welcome to the chat, ${username}!`);
    });

    socket.on('chat message', (msg) => {
        io.emit('msg-broadcast', msg); // Broadcast messages to all clients
        console.log(msg)
        messages.push(msg)
        io.emit("get-message", messages)
    });
    console.log(messages)
    socket.on("typing", (username) => {
        // console.log(username)
        io.emit("user-typing", `${username} is typing`)
    })

    // Handle user disconnection (optional)
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id); // Log for debugging
    });
});

server.listen(5000, () => {
    console.log('Socket.IO server listening on http://localhost:5000');
});
