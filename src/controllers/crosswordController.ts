import { Request, Response } from "express";
import { Crossword } from "../models/games/crossword";
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
    const newCrossword = await Crossword.create({
      ...crosswordData,
      user: req.currentUser!.id,
      status: GamesStatus.Draft });
    res.status(201).json(await newCrossword.populate("user", "name imageUrl"));
  } catch (error) {
    res.status(500).json({ error: "Failed to Create Crossword" });
  }
}

async function getMostRecentCrossword(req: Request, res: Response) {
  try {
    // const today = new Date().toLocaleDateString();
    // To Do: In the Future Edit this if tech times are going to create one daily
    const mostRecent = await Crossword
      .findOne({ status: GamesStatus.Published })
      .sort({ creationDate: -1 })
      .populate("user", "name imageUrl");
    if (!mostRecent) return res.status(404).json({ error: "No crossword found" });

    res.status(200).json(mostRecent);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve crossword" });
  }
}

async function crosswordUnderReview(req: Request, res:Response) {
  const crosswords = await Crossword.find({ status: GamesStatus.Review }).populate("user", "name imageUrl");
  if (crosswords.length === 0) return res.status(204)
  res.status(200).json(crosswords);
}

async function crosswordStatusUpdate(req: Request, res:Response) {
  const crosswordToUpdate = await Crossword.findById(req.params.id);
  if (!crosswordToUpdate) return res.status(404).json({ error: "No crossword found" })

  if (crosswordToUpdate.user!.equals(req.currentUser!.id) && req.currentUser!.role === Role.Writer) {
    const status = crosswordToUpdate.status === GamesStatus.Review ? GamesStatus.Draft : GamesStatus.Review;
    crosswordToUpdate.set({ status: status });
  } else if (req.currentUser!.role === Role.Editor || req.currentUser!.role === Role.Admin) {
    const { status } = req.body;
    if (status !== GamesStatus.Draft && status !== GamesStatus.Published) {
      return res.status(400).json({ error: "invalid status" })
    };
    crosswordToUpdate.set({ status: status });
  } else {
      return res.status(403).json({ error: "Forbidden" });
  }
  await crosswordToUpdate.save();
  res.status(200).json(await crosswordToUpdate.populate("user", "name imageUrl"));
}

async function crosswordDataUpdate(req: Request, res: Response) {
  const crosswordToUpdate = await Crossword.findById(req.params.id);
  if (!crosswordToUpdate) return res.status(404).json({ error: "No crossword found" })

  const { gridSize, data, clues } = req.body;
  const updates: Record<string, unknown> = {};
  if (gridSize !== undefined) updates.gridSize = gridSize;
  if (data !== undefined) updates.data = data;
  if (clues !== undefined) updates.clues = clues;
  
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: "provide a field" });
  // These two functions are spagetti code but who cares it works
  
  if (crosswordToUpdate.user!.equals(req.currentUser!.id) && req.currentUser!.role === Role.Writer) {
    crosswordToUpdate.set(updates);
  } else {
      return res.status(403).json({ error: "Forbidden"});
  }

  
  await crosswordToUpdate.save();
  res.status(200).json(await crosswordToUpdate.populate("user", "name imageUrl"));
}

async function crosswordDelete(req: Request, res: Response) {
  const crosswordToDelete = await Crossword.findById(req.params.id);
  if (!crosswordToDelete) return res.status(404).json({ error: "No crossword found" })

  if (crosswordToDelete.user!.equals(req.currentUser!.id) && req.currentUser!.role === Role.Writer) {
    await crosswordToDelete.deleteOne();
  } else if (req.currentUser!.role === Role.Editor || req.currentUser!.role === Role.Admin) {
    await crosswordToDelete.deleteOne();
  } else {
      return res.status(403).json({ error: "Forbidden"});
  }
  

  res.status(204).json({ status: "deleted" });

}

module.exports = { createCrossword, getMostRecentCrossword, crosswordUnderReview, crosswordStatusUpdate, crosswordDataUpdate, crosswordDelete }
// idk if we want to track history, but this is what it is
