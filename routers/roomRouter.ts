import express from "express";
import Room from "../controllers/room";

const roomRouter = express.Router();

roomRouter.get("/", Room.Get);

roomRouter.post("/create", Room.Create);

roomRouter.post("/join", Room.Join);

export default roomRouter;
