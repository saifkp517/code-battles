import express from "express";
import { PrismaClient } from "@prisma/client";
import { Server, Socket } from "socket.io"
import { createServer } from "http"
import { v4 as uuidv4 } from "uuid"
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";

interface AuthenticatedSocket extends Socket {
    user?: any;
}

const prisma = new PrismaClient();

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

interface Categories {
    [folderName: string]: string[];
}


const activeRooms: ActiveRooms = {};

io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if(!token) {
        return next(new Error("Authentication Error"));
    }

    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "a-string-secret-at-least-256-bits-long");
        socket.user = decoded;
        next();
    } catch (err) {
        console.log("invalid token")
        next(new Error("Invalid token"));
    }
})

io.on('connection', (socket) => {
``
    console.log(`User ${JSON.stringify(socket.user, null, 2)} connected`);

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
        console.log(`User ${socket.user} disconnected`);
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

function categorizeProblems(dir: string) {
    const categories: Categories = {};

    const folders = fs.readdirSync(dir, { withFileTypes: true });

    folders.forEach((folder) => {
        if (folder.isDirectory()) {
            const folderPath = path.join(dir, folder.name);

            const problems = fs.readdirSync(folderPath).filter(file => file.endsWith('.py'));

            categories[folder.name] = problems;

        }


    })

    return categories;
}

const baseDir = '../../coding-problems'

const categorizedData = categorizeProblems(baseDir);


const readFirstFileInCategory = (category: string, categories: Categories) => {
    // const categories = categorizeProblems(baseDir);

    if (!categories[category] || categories[category].length === 0) {
        console.log(`No files found in category: ${category}`);
        return;
    }

    const firstFile = categories[category][0];
    const filePath = path.join(baseDir, category, firstFile);

    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`Contents of ${firstFile} in ${category} category:\n`);
    console.log(content);
};


//db setup
async function main() {
  // ... you will write your Prisma Client queries here
  const allUsers = await prisma.user.findMany()
  console.log(allUsers)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

httpServer.listen(4000, () => console.log("Websocket server running on port 4000"))

