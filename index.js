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
        socket.chatRoomId = roomId;
        const room = await chatRoomSchema.findById(roomId);
        if (room) {
            if (!room.users.includes(user?._id)) {
                room.users.push(user?._id);
                await room.save();
                socket.join(roomId);
                io.in(roomId).emit("user-joined-room", `${user?.name} joined room`);
                // console.log(`${user?.name} joined room: ${roomId}`);
            } else {
                console.log(`${user?.name} is already in room: ${roomId}`);
                socket.emit("user-already-in-room", `${user?.name} is already in the room`);
            }
            // await room.save();
        }

        // socket.join(roomId);
        const messages = await getMessage(roomId);
        // console.log('Messages:', messages);

        io.to(roomId).emit('get-message', messages);

        // console.log(`${user?.name} joined room: ${roomId}`);
    });


    // Leave a chat room
    // Leave a chat room
    socket.on('leave-room', async ({ roomId, user }) => {
        console.log('leave-room event received:', { roomId, user });

        const room = await chatRoomSchema.findById(roomId);
        console.log('Room found:', room);

        if (room) {
            if (room.users.includes(user?._id)) {
                console.log(`${user?.name} is in room: ${roomId}, proceeding to remove`);
                room.users = room.users.filter(userId => userId.toString() !== user?._id.toString());
                console.log('Updated room.users after removal:', room.users);
                await room.save();
                socket.leave(roomId);
                console.log(`Socket left room: ${roomId}`);
                io.in(roomId).emit("user-leave-room", `${user?.name} left the room`);
                console.log(`${user?.name} left room: ${roomId} and user-leave-room event emitted`);
            } else {
                console.log(`${user?.name} is not in room: ${roomId}`);
                socket.emit("user-not-in-room", `${user?.name} is not in the room`);
            }
        } else {
            console.log(`Room not found: ${roomId}`);
            socket.emit("room-not-found", `Room not found: ${roomId}`);
        }
    });


    socket.on('user-joined', (username) => {
        // console.log('User joined:', username);

        // Broadcast the join message to all connected clients (including the joining user)
        socket.broadcast.emit('cast-user-joined', ` ${username} Joined the chat!`);

        // socket.emit('welcome', `Welcome to the chat, ${username}!`);
    });

    socket.on('chat-message', async ({ roomId, sender, message, type }) => {
        if (!roomId) {
            console.error('User is not in a room');
            return;
        }

        await messageSchema({ chatRoom: roomId, sender: sender, message: message, type: type }).save();

        const messages = await getMessage(roomId);
        // console.log('Messages:', messages); // Verify messages is an array

        io.to(roomId).emit("get-message", messages);
    });

    socket.emit("get-message", async () => {
        const roomId = socket.chatRoomId;
        if (!roomId) {
            console.error('User is not in a room');
            return;
        }

        const messages = await getMessage(roomId);
        console.log('Messages:', messages); // Verify messages is an array

        io.to(roomId).emit('get-message', messages);
    })

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
