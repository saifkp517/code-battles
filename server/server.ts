import express from "express";
import {Server} from "socket.io"
import {createServer} from "http"
import cors from "cors"

const app = express();
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
})

type Room = {
    players: string[],
    code: string  
};

type ActiveRooms = {
    [key: string]: Room
};

const activeRooms: ActiveRooms = {};

io.on('connection', (socket) => {
    console.log("A user has Connected!: ", socket.id);

    socket.on('joinRoom', (roomId: string) => {
        console.log(`User ${socket.id} joined room: ${roomId}`);
        if(!activeRooms[roomId]) activeRooms[roomId] = {players: [], code: 'QWKO@!M'};

        activeRooms[roomId].players.push(socket.id);

        socket.emit('syncCode', activeRooms[roomId].code)

        if(activeRooms[roomId].players.length == 2) {
            io.to(roomId).emit('startBattle');
        }
    })

    //sync code across both players
    socket.on('codeUpdate', ({roomId, code}) => {
        activeRooms[roomId].code = code;
        socket.to(roomId).emit('syncCode', code);
    })

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} has disconnected!`);
    })
})

httpServer.listen(4000, () => console.log("Websocket server running on port 4000"))

