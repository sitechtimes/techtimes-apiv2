import mongoose from "mongoose";
import { GamesStatus } from "./gamesStatus";

const schemaDefinition = {
  title: {
    type: String,
    required: true,
  },
  gridSize: {
    // Size of the crossword grid, aka a square grid so 10 means 10x10 grid
    type: Number,
    required: true,
  },
  data: {
    // This is gonna be where the actual data is
    // It is going to look like
    // [["null", "null", "null", "e"],
    //  ["null", "null", "null", "a"]]
    // so on and so forth
    type: [[String]],
    required: true
  },
  // Clues for all words
  clues: {
    type: [{
      number: { type: Number }, // Word
      clue: { type: String }, // the actual Clue
      direction: { type: String, enum: ['Across', 'Vertical']}, // Which word direction cuz word can share the same number
    }]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(GamesStatus),
    required: true,
    default: GamesStatus.Draft,
  },
};


const crosswordSchema = new mongoose.Schema(schemaDefinition, {
  timestamps: true,
  toJSON: {
    transform(doc, ret: any, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },

  },

});

const Crossword = mongoose.model("Crossword", crosswordSchema);

export { Crossword };
