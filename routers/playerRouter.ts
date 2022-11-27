import express from "express";
import Player from "../controllers/player";

const playerRouter = express.Router();

playerRouter.get("/", Player.Find);

export default playerRouter;
