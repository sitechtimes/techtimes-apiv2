import express from "express";
const router = express.Router();
const articlesController = require("../controllers/articlesController");

router.get("/", articlesController.index);
router.get("/homepage", articlesController.homepage);
router.get("/popular", articlesController.popular);
router.get("/trending", articlesController.trending);
router.get("/:slug", articlesController.show);

module.exports = router;
