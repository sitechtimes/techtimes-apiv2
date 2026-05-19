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
    type: Number,
    required: true,
  },
};

const crosswordSchema = new mongoose.Schema(schemaDefinition);

const crossword = mongoose.model("Crossword", crosswordSchema);

export { crossword };
