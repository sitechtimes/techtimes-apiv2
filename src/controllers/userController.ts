import { Request, Response } from "express";
import { User } from "../models/user";
import { Role } from "../models/role";

async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  if (req.currentUser!.role !== Role.Admin)
    return res.status(401).json({ message: "Unauthorized" });

  await User.findByIdAndDelete(id);
  res.sendStatus(204);
}

async function index(req: Request, res: Response) {
  const users = await User.find({ role: { $ne: Role.Admin } });
  res.send(users);
}

async function show(req: Request, res: Response) {
  const user = await User.findById(req.params.id);
  // chat is this user real
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
  res.send(user);
}

async function update(req: Request, res: Response) {
  const { imageUrl, role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user || !req.currentUser) return res.status(404).json({ error: "USER_NOT_FOUND" });

  if (user.id === req.currentUser.id || req.currentUser.role === Role.Admin) {
    const image = imageUrl === undefined ? user.imageUrl : imageUrl;
    user.set({ imageUrl: image });
  }
  // don't change other people's things!!
  else return res.sendStatus(401);

  // only admins can update roles!!
  if (role && user.role !== role) {
    if (req.currentUser!.role === Role.Admin) {
      const updatedRole = role === undefined ? user.role : role;
      user.set({ role: updatedRole });
    } else return res.sendStatus(401);
  }

  await user.save();

  res.send(user);
}

module.exports = { deleteUser, index, show, update };
