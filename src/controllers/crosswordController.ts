import { Request, Response } from "express";
import { crossword } from "../models/games/crossword";
import { GamesStatus } from "../models/games/gamesStatus";
import { Role } from "../models/role";

async function createCrossword(req: Request, res: Response) {
  const crosswordData = req.body;
  // Uncomment This line if they are going to do a daily puzzle
/*  try {
    const existingCrossword = await crossword.findOne({
      date: crosswordData.date,
    });
    if (existingCrossword)
      return res.status(400).json({ error: "Crossword for today already exists" });

    const newCrossword = await crossword.create(crosswordData);
    res.status(201).json(newCrossword);
  } catch (error) {
    res.status(500).json({ error: "Failed to create crossword" });
  }
}
*/
  try {
    const newCrossword = await crossword.create({
      ...crosswordData,
      user: { id: req.currentUser!.id },
      status: GamesStatus.Draft });
    res.status(201).json(newCrossword);
  } catch (error) {
    res.status(500).json({ error: "Failed to Create Crossword" });
  }
}

async function getMostRecentCrossword(req: Request, res: Response) {
  try {
    // const today = new Date().toLocaleDateString();
    // To Do: In the Future Edit this if tech times are going to create one daily
    const mostRecent = await crossword
      .findOne({ status: GamesStatus.Published })
      .sort({ creationDate: -1 });
    if (!mostRecent) return res.status(404).json({ error: "No crossword found" });

    res.status(200).json(mostRecent);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve crossword" });
  }
}

async function crosswordUnderReview(req: Request, res:Response) {
  const crosswords = await crossword.find({ status: GamesStatus.Review });
  if (!crosswords) return res.status(404).json({ error: "No crossword found" })
  res.send(crosswords);
}

async function crosswordStatusUpdate(req: Request, res:Response) {
  const crosswordToUpdate = await crossword.findById(req.params.id);
  if (!crosswordToUpdate) return res.status(404).json({ error: "No crossword found" })

  if (crosswordToUpdate.user!.id === req.currentUser!.id && req.currentUser!.role === Role.Writer) {
    const status = crosswordToUpdate.status === GamesStatus.Review ? GamesStatus.Draft : GamesStatus.Review;
    crosswordToUpdate.set({ status: status });
  } else if (req.currentUser!.role === Role.Editor || req.currentUser!.role === Role.Admin) {
    const status = crosswordToUpdate.status === GamesStatus.Draft ? GamesStatus.Published : GamesStatus.Draft;
    crosswordToUpdate.set({ status: status });
  } else {
      return res.status(403).json({ error: "Forbidden"});
  }

  
  await crosswordToUpdate.save();
  res.send(crosswordToUpdate);
}

async function crosswordDataUpdate(req: Request, res: Response) {
  const crosswordToUpdate = await crossword.findById(req.params.id);
  if (!crosswordToUpdate) return res.status(404).json({ error: "No crossword found" })
  
  // These two functions are spagetti code but who cares it works

  if (crosswordToUpdate.user!.id === req.currentUser!.id && req.currentUser!.role === Role.Writer) {
    crosswordToUpdate.set({ data: req.body.data });
  } else if (req.currentUser!.role === Role.Editor || req.currentUser!.role === Role.Admin) {
    crosswordToUpdate.set({ data: req.body.data });
  } else {
      return res.status(403).json({ error: "Forbidden"});
  }

  
  await crosswordToUpdate.save();
  res.send(crosswordToUpdate);
}

async function crosswordDelete(req: Request, res: Response) {
  const crosswordToDelete = await crossword.findById(req.params.id);
  if (!crosswordToDelete) return res.status(404).json({ error: "No crossword found" })

  if (crosswordToDelete.user!.id === req.currentUser!.id && req.currentUser!.role === Role.Writer) {
    await crosswordToDelete.deleteOne();
  } else if (req.currentUser!.role === Role.Editor || req.currentUser!.role === Role.Admin) {
    await crosswordToDelete.deleteOne();
  } else {
      return res.status(403).json({ error: "Forbidden"});
  }
  

  res.send(crosswordToDelete);

}

module.exports = { createCrossword, getMostRecentCrossword, crosswordUnderReview, crosswordStatusUpdate, crosswordDataUpdate, crosswordDelete }
// idk if we want to track history, but this is what it is
