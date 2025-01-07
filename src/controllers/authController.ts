import { Request, Response } from "express";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

async function signUp(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (await User.findOne({ email }))
    return res.status(409).json({ message: "user already exists" });

  try {
    const verificationToken = jwt.sign({ email }, process.env.JWT_KEY!, { expiresIn: "20m" });

    const newUser = await User.create({
      name,
      email,
      password,
      verified: false,
      verificationCode: verificationToken,
    });
    await newUser.save();

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      // TODO: is this supposed to be false??
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.toString(),
      subject: "TechTimes Email confirmation",
      html: `Hello there, click the following link to verify your email: <a href="${process.env.URL}:8000/auth/verify/${verificationToken}">Verify Email</a>`,
    };

    await transport.sendMail(mailOptions);

    res.status(201).json({ message: "verify email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error" });
  }
}

async function signIn(req: Request, res: Response) {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) return res.status(401).json({ message: "Invalid credentials" });

  if (!(await bcrypt.compare(password, existingUser.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const payload = {
    id: existingUser.id,
    email: existingUser.email,
    role: existingUser.role,
  };

  const userJWT = jwt.sign(payload, process.env.JWT_KEY!, { expiresIn: "6h" });

  req.session = {
    jwt: userJWT,
  };

  res.status(200).send({
    ...existingUser.toJSON(),
    token: userJWT,
  });
}

async function logout(req: Request, res: Response) {
  req.session = null;
  res.status(204).send({});
}

async function verify(req: Request, res: Response) {
  const { token } = req.params;

  let user = await User.findOne({ verificationCode: token });

  if (!user) return res.status(401).json({ message: "Invalid token" });

  if (!process.env.JWT_KEY) return res.status(500).json({ message: "krill issue" });

  try {
    jwt.verify(token, process.env.JWT_KEY);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
  user.verified = true;
  await user.save();

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const userJWT = jwt.sign(payload, process.env.JWT_KEY!, { expiresIn: "6h" });

  req.session = {
    jwt: userJWT,
  };

  res.status(200).send({ ...user.toJSON(), token: userJWT });
}

async function currentUser(req: Request, res: Response) {
  res.send({ ...(req.currentUser || null) });
}

module.exports = { signUp, signIn, logout, verify, currentUser };
