import express from "express";
import http from "http";
import { Server } from "socket.io";

import cors from "cors";
import * as dotenv from "dotenv";
import roomRouter from "./routers/roomRouter";
import gameHandler from "./socket/gameHandler";
import roomHandler from "./socket/roomHandler";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

// Config dotenv
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routers
app.use("/api/room", roomRouter);

io.on("connection", (socket) => {
	console.log(socket.rooms);
	console.log("A user connected");

	roomHandler(io, socket);
	gameHandler(io, socket);
});

server.listen(process.env.PORT, () => {
	console.log(`listening on *:${process.env.PORT}`);
});
