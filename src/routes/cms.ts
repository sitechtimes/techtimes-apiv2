import express from "express";
const router = express.Router();
const cmsController = require("../controllers/cmsController");
import { requireAuth } from "../middleware/requireAuth";
import { Role } from "../models/role";
import { roles } from "../utils/roles";

// Fetch articles based on their status
router.get("/", requireAuth, cmsController.index); // The existing route, now it will handle status filtering

router.post("/", requireAuth, cmsController.newArticle);
router.get("/review/", requireAuth, roles([Role.Editor, Role.Admin]), cmsController.review);
router.get("/ready", requireAuth, roles([Role.Admin]), cmsController.ready);
router.get("/categories", cmsController.categories);
router.post("/force-publish", requireAuth, roles([Role.Admin]), cmsController.forcePublish);
router.get("/:id", requireAuth, cmsController.show);
router.put("/:id/", requireAuth, cmsController.update);
router.delete("/:id", requireAuth, cmsController.deleteArticle);
router.post("/:id/publish", requireAuth, roles([Role.Admin]), cmsController.publish);

module.exports = router;
