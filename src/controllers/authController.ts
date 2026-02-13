import { Request, Response } from "express";
import { User } from "../models/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const emailCooldown = 60; // email verification cooldown in seconds

async function signUp(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (await User.findOne({ email })) return res.status(409).json({ error: "USER_ALREADY_EXISTS" });

  try {
    const newUser = await User.create({
      name,
      email,
      password,
    });
    await newUser.save();

    return res.sendStatus(200);
  } catch {
    return res.status(500).json({ error: "SIGN_UP_FAILED" });
  }
}

async function signIn(req: Request, res: Response) {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  if (!(await bcrypt.compare(password, existingUser.password)))
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });

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

  res.sendStatus(204);
}

async function verify(req: Request, res: Response) {
  const { token } = req.query;
  if (typeof token !== "string") return res.status(401).json({ error: "EVIL_TOKEN" });

  const user = await User.findOne({ verificationCode: token });

  if (!user) return res.status(401).json({ error: "INVALID_TOKEN" });

  if (!process.env.JWT_KEY) return res.status(500).json({ error: "KRILL_ISSUE" });

  try {
    jwt.verify(token, process.env.JWT_KEY);
  } catch {
    return res.status(401).json({ message: "INVALID_TOKEN" });
  }

  user.verificationCode = undefined;
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

async function sendVerification(req: Request, res: Response) {
  if (!req.currentUser) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const { email } = req.currentUser;
  const existingUser = await User.findOne({ email });
  if (!existingUser) return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  if (existingUser.verified) return res.status(200).json({ verified: true });

  // I'VE SENT THIS CODE BEFORE!!
  if (existingUser.verificationCode) {
    const existingCode = jwt.decode(existingUser.verificationCode) as JwtPayload;
    existingCode.iat ??= 0;
    const cooledDown = (existingCode.iat + emailCooldown) * 1000; // timestamp of when the cooldown ends. adjusted to work with date.now

    // send just the timestamp for updating countdown
    if (!req.body.newToken)
      return res.status(201).json({ message: "checking in", time: cooledDown });

    // return if on cooldown
    if (Date.now() / 1000 - existingCode.iat < emailCooldown)
      return res.status(429).json({
        message: "email machine on cooldown",
        time: cooledDown,
      });
  } else {
    const verificationToken = jwt.sign({ email }, process.env.JWT_KEY!, {
      expiresIn: "20m",
    });

    existingUser.verificationCode = verificationToken;
    await existingUser.save();

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.toString(),
      subject: "Tech Times — Verify your email",
      html: `Hello there, click the following link to verify your email: <a href="${process.env.URL}:8000/auth/verify/${verificationToken}">Verify Email</a>`,
    };

    await transport.sendMail(mailOptions);

    return res
      .status(201)
      .json({ message: "verification sent", time: Date.now() + emailCooldown * 1000 });
  }
  // if newToken is false but the user doesn't have a verification code, send it anyway

  const verificationToken = jwt.sign({ email }, process.env.JWT_KEY!, {
    expiresIn: "20m",
  });

  existingUser.verificationCode = verificationToken;
  await existingUser.save();

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

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email.toString(),
    subject: "TechTimes Email confirmation",
    html: `Hello there, click the following link to verify your email: <a href="${process.env.URL}:8000/auth/verify?token=${verificationToken}">Verify Email</a>`,
  };

  await transport.sendMail(mailOptions);

  return res.status(201).json({ message: "verify email", time: Date.now() + emailCooldown * 1000 });
}

module.exports = { signUp, signIn, logout, verify, sendVerification };
