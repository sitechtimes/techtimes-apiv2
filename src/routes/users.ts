import express from "express";
const router = express.Router();
const userController = require("../controllers/userController");
import { requireAuth } from "../middleware/requireAuth";
import { Role } from "../models/role";
import { roles } from "../utils/roles";

router.get("/", requireAuth, roles([Role.Admin]), userController.index);
router.get("/:id", requireAuth, userController.show);
router.put("/:id", requireAuth, userController.update);
router.delete("/:id", requireAuth, userController.deleteUser);

module.exports = router;
