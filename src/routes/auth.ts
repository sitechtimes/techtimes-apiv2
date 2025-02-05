import express from "express";
const router = express.Router();
const authController = require("../controllers/authController");
import { body } from "express-validator";
import { validateRequest } from "../utils/requestValidator";

router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name can't be empty"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 8, max: 24 })
      .withMessage("Password must be between 8 and 24 characters"),
  ],
  validateRequest,
  authController.signUp
);

router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must supply a password"),
  ],
  validateRequest,
  authController.signIn
);

router.post("/logout", authController.logout);

router.post("/verify", authController.sendVerification);

router.get("/verify/:token", authController.verify);

module.exports = router;
