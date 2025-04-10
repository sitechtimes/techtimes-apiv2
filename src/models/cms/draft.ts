import mongoose from "mongoose";
import { DraftStatus } from "./draftStatus";
import { Category } from "../category";

const schemaDefinition = {
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  customAuthor: {
    type: String,
    required: false,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  imageAlt: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    enum: Object.values(DraftStatus),
    required: true,
    default: DraftStatus.Draft,
  },
  category: {
    type: String,
    enum: Object.values(Category),
    required: true,
    default: Category.Technology,
  },
} as const;

const draftSchema = new mongoose.Schema(schemaDefinition, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
});

const Draft = mongoose.model("Draft", draftSchema);

export { Draft };
