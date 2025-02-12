import express from "express";
const router = express.Router();
const cmsController = require("../controllers/cmsController");
import { requireAuth } from "../utils/requireAuth";
import { Role } from "../models/role";
import { roles } from "../utils/roles";

router.get("/categories", cmsController.categories);
router.delete("/:id", requireAuth, cmsController.deleteArticle);
router.get("/", requireAuth, cmsController.index);
router.post("/", requireAuth, cmsController.newArticle);
router.post("/:id/publish", requireAuth, roles([Role.Admin]), cmsController.publish);
router.post("/force-publish", requireAuth, roles([Role.Admin]), cmsController.forcePublish);
router.get("/ready", requireAuth, roles([Role.Admin]), cmsController.ready);
router.get("/review/", requireAuth, roles([Role.Editor, Role.Admin]), cmsController.review);
router.get("/:id", requireAuth, cmsController.show);
router.put("/:id/", requireAuth, cmsController.update);

module.exports = router;
