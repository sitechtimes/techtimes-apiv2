import express from "express";
const router = express.Router();

const crosswordController = require("../controllers/crosswordController");

router.post("/crosswords", crosswordController.createCrossword);
router.get("/crosswords", crosswordController.getCrosswordForToday);
