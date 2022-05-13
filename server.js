import express from 'express';
import { config } from 'dotenv';
import userRoutes from './Routes/userRoutes.js'
import chatRoutes from './Routes/chatRoutes.js'
import messageRoutes from './Routes/messageRoutes.js'
import mongoose from 'mongoose';
import { notFound, errorHandler } from './middleware/errorMiddlerware.js'
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);
config();
app.use(express.json())

const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000'
    }
});
const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join_chat', (room) => {
        socket.join(room);
        console.log(`User joined the room ${room}`);
    });

    socket.on('new_message', (newMessageReceived) => {
        let chat = newMessageReceived.chat;
        if (!chat.users)
            return console.log('chat.users not defined');

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit('message_received', newMessageReceived);
        });
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));
})

app.get('/', (req, res) => {
    res.send(`Welcome to Let's Chat server!`);
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use(notFound)
app.use(errorHandler)

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => httpServer.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message))

