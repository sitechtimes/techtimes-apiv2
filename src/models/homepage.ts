import mongoose from "mongoose";
import { Category } from "./category";
import { Position } from "./position";

const schemaDefinition = {
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: Object.values(Category),
    required: true,
  },
  user: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
  },
  position: {
    type: String,
    enum: Object.values(Position),
    required: true,
  },
  slug: {
    type: String,
  },
} as const;

const homepageSchema = new mongoose.Schema(schemaDefinition, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
});

const Homepage = mongoose.model("Homepage", homepageSchema);

export { Homepage };
