import { Request, Response } from "express";
import { crossword } from "../models/crossword";

async function createCrossword(req: Request, res: Response) {
  const crosswordData = req.body;
  try {
    const existingCrossword = await crossword.findOne({ date: crosswordData.date });
    if (existingCrossword)
      return res.status(400).json({ error: "Crossword for today already exists" });

    const newCrossword = await crossword.create(crosswordData);
    res.status(201).json(newCrossword);
  } catch (error) {
    res.status(500).json({ error: "Failed to create crossword" });
  }
}

async function getCrosswordForToday(req: Request, res: Response) {
  try {
    const today = new Date();
    const crosswordForToday = await crossword.findOne({ date: today });
    if (!crosswordForToday) {
      return res.status(404).json({ error: "No crossword found for today" });
    }
    res.status(200).json(crosswordForToday);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve crossword" });
  }
}
