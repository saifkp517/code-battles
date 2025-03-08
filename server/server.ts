import express from "express";
import { Server } from "socket.io"
import { createServer } from "http"
import { v4 as uuidv4 } from "uuid"
import cors from "cors"

const app = express();
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
})

type Player = {
    socketId: string,
    userId: string
}

type Room = {
    players: Player[],
    // code: string
};

type ActiveRooms = {
    [key: string]: Room
};


const activeRooms: ActiveRooms = {};

io.on('connection', (socket) => {

    socket.on('joinRoom', (userid) => {
        console.log('user has joined room')
        const roomId = findOrCreateRoom(userid, socket.id);
        socket.join(roomId);

        const players = activeRooms[roomId].players;
        console.log(players)
        socket.emit('roomAssigned', { roomId });

        io.to(roomId).emit('updatePlayers', players);

        if (players.length === 2) {
            io.to(roomId).emit('startBattle', { roomId, players })
        }
    })

    //sync code across both players
    socket.on('codeUpdate', ({ roomId, code }) => {

        socket.to(roomId).emit('opponentCode', {
            code,
            from: socket.id,
        });
    });

    socket.on('disconnect', () => {
        removePlayer(socket.id);
    })
})

function findOrCreateRoom(userId: string, socketId: string) {

    console.log(activeRooms)

    const openRoom = Object.keys(activeRooms).find((roomId) => activeRooms[roomId].players.length < 2 && !activeRooms[roomId].players.some(p => p.userId === userId))

    const roomId = openRoom || `room=${uuidv4()}`

    if (!activeRooms[roomId]) {
        activeRooms[roomId] = { players: [] }
    }

    activeRooms[roomId].players.push({ userId: userId, socketId: socketId })
    return roomId;
}


function removePlayer(socketId: string) {
    for (const roomId in activeRooms) {
        activeRooms[roomId].players = activeRooms[roomId].players.filter(
            (player) => player.socketId !== socketId
        );

        if (activeRooms[roomId].players.length === 0) {
            delete activeRooms[roomId]; // Cleanup empty rooms
        }
    }
}


console.log(activeRooms)

httpServer.listen(4000, () => console.log("Websocket server running on port 4000"))

