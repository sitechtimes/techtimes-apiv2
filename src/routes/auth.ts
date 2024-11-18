import express from "express";
const router = express.Router();
const authController = require("../controllers/authController");
// const authMiddleware = require("../../middleware/auth");
// const adminMiddleware = require("../../middleware/admin");

router.post("/signup", authController.signUp);

// router.post("/login", authController.login);

// router.post("/logout", authController.logout);

// router.post("/refresh", authController.refresh); // auth middleware should be here and in logout

// router.get("/self/", authMiddleware, authController.self);

// router.get("/users/:username", authController.user);

// router.get("/admin", adminMiddleware, (req, res) => {
//   res.json({ message: "Admin Test" });
// });

module.exports = router;