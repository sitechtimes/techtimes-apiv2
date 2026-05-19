import express from "express";
import { requireAuth } from "../middleware/requireAuth";
const router = express.Router();

const crosswordController = require("../controllers/crosswordController");

router.post("/crosswords", requireAuth, crosswordController.createCrossword);
router.get("/crosswords", crosswordController.getCrosswordForToday);
