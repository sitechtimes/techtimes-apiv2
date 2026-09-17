import mongoose from "mongoose";

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
  creationDate: {
    // Data that it was created ( cuz its prob not gonna get updated daily )
    type: Date,
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
      number: { type: Number },
      clue: { type: String },
      direction: { type: String, enum: ['Across', 'Vertical']},
      length : { type: Number },
    }],
    required: true
  },
};

const crosswordSchema = new mongoose.Schema(schemaDefinition);

const crossword = mongoose.model("Crossword", crosswordSchema);

export { crossword };
