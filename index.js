const express = require('express');
const http = require('http');
const serverIo = require('socket.io');
const cors = require('cors');
const { copyFileSync } = require('fs');
require("dotenv").config()
const bodyParser = require('body-parser');

const mainRouter = require("./Router/mainRouter")
const mongoose = require("mongoose");
const chatRoomSchema = require('./Model/chatRoomSchema');
const messageSchema = require('./Model/messageSchema');
const userSchema = require('./Model/userSchema');

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
// let roomId;

const getMessage = async (roomId) => {
    console.log("roomId", roomId);
    if (roomId !== "" && roomId !== null) {
        const allMessage = await messageSchema.find({ chatRoom: roomId }).populate("sender", "name").lean();
        console.log(allMessage);
        return allMessage;
    }
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a chat room
    socket.on('join-room', async ({ roomId, user }) => {
        socket.chatRoomId = roomId;  // Store roomId in the socket object
        const room = await chatRoomSchema.findById(roomId);
        if (room) {
            room.users.push(user?._id);
            await room.save();
        }

        socket.join(roomId);
        const messages = await getMessage(roomId);
        console.log('Messages:', messages); // Verify messages is an array

        io.to(roomId).emit('get-message', messages); // Emit messages to the room only

        console.log(`${user?.name} joined room: ${roomId}`);
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

    socket.on('chat-message', async ({ roomId, sender, message }) => {
        // const roomId = socket.chatRoomId;  // Retrieve the stored roomId
        if (!roomId) {
            console.error('User is not in a room');
            return;
        }

        const sendMessage = await messageSchema({ chatRoom: roomId, sender: sender, message: message }).save();
        io.to(roomId).emit('msg-broadcast', message); // Broadcast messages to all clients in room

        const messages = await getMessage(roomId);
        console.log('Messages:', messages); // Verify messages is an array

        io.to(roomId).emit("get-message", messages); // Emit messages to the room only

    });
    // console.log(allMessage)

    socket.emit("get-message", async () => {
        const roomId = socket.chatRoomId;  // Retrieve the stored roomId
        if (!roomId) {
            console.error('User is not in a room');
            return;
        }

        const messages = await getMessage(roomId);
        console.log('Messages:', messages); // Verify messages is an array

        io.to(roomId).emit('get-message', messages); // Emit messages to the room only
    })

    // console.log(messages)
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
