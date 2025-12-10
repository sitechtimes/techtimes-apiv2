import express from "express";
const router = express.Router();
const articlesController = require("../controllers/articlesController");

router.get("/", articlesController.index);
router.get("/homepage", articlesController.homepage);
router.get("/:slug", articlesController.show);
router.get("/popular", articlesController.popular);

module.exports = router;
