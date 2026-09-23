import express from "express";
const router = express.Router();
import { requireAuth } from "../middleware/requireAuth";
import { Role } from "../models/role";
import { roles } from "../utils/roles";

const crosswordController = require("../controllers/crosswordController");

router.post("/crosswords", requireAuth, crosswordController.createCrossword);
router.get("/crosswords", crosswordController.getMostRecentCrossword);
router.get("/crosswords/review", requireAuth, roles([Role.Editor, Role.Admin]), crosswordController.crosswordUnderReview);
router.put("/crosswords/update-status", requireAuth, crosswordController.crosswordStatusUpdate)
module.exports = router;
