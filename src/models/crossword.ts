import mongoose from "mongoose";

const schemaDefinition = {
  word: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    enum: ["across", "down"],
    required: true,
  },
  position: {
    type: [Number, Number],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  grid_size: {
    // Size of the crossword grid, aka a square grid
    type: Number,
    required: true,
  },
  date: {
    //assigned to which date
    type: Date,
    required: true,
  },
};

const crosswordSchema = new mongoose.Schema(schemaDefinition);

const crossword = mongoose.model("Crossword", crosswordSchema);

export { crossword };
