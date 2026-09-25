import express from "express";
const router = express.Router();
import { requireAuth } from "../middleware/requireAuth";
import { Role } from "../models/role";
import { roles } from "../utils/roles";

const crosswordController = require("../controllers/crosswordController");
// These role check might be redundant but it works
router.post("/crosswords", requireAuth, roles([Role.Writer, Role.Editor, Role.Admin]), crosswordController.createCrossword);
router.get("/crosswords", crosswordController.getMostRecentCrossword);
router.get("/crosswords/review", requireAuth, roles([Role.Editor, Role.Admin]), crosswordController.crosswordUnderReview);
router.patch("/crosswords/update-status/:id", requireAuth, roles([Role.Writer, Role.Editor, Role.Admin]), crosswordController.crosswordStatusUpdate);
router.patch("/crosswords/update-data/:id", requireAuth, roles([Role.Writer, Role.Editor, Role.Admin]), crosswordController.crosswordDataUpdate);
router.delete("/crosswords/delete/:id", requireAuth, roles([Role.Writer, Role.Editor, Role.Admin]), crosswordController.crosswordDelete);
module.exports = router;
