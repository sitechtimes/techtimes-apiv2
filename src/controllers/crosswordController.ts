import { Request, Response } from "express";
import { crossword } from "../models/crossword";

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
    const newCrossword = await crossword.create(crosswordData);
    res.status(201).json(newCrossword);
  } catch (error) {
    res.status(500).json({ error: "Failed to create crossword" });
  }

async function getCrosswordForToday(req: Request, res: Response) {
  try {
    const today = new Date().toLocaleDateString();
    // To Do: In the Future Edit this if tech times are going to create one daily
    const mostRecent = await crossword.findOne({ date: -1 });
    if (!mostRecent) {
      return res.status(404).json({ error: "No crossword found" });
    }
    res.status(200).json(mostRecent);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve crossword" });
  }
}

// idk if we want to track history, but this is what it is
