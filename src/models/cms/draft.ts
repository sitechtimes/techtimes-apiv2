import mongoose, { InferSchemaType } from "mongoose";
import { DraftStatus } from "./draftStatus";
import { Category } from "../category";

const draftSchema = new mongoose.Schema({
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
    default: null,
    required: false,
    trim: true,
  },
  imageUrl: {
    type: String,
    default: null,
    required: false,
  },
  imageAlt: {
    type: String,
    default: null,
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
});

type DraftType = InferSchemaType<typeof draftSchema>;

const Draft = mongoose.model("Draft", draftSchema);

export { Draft, type DraftType };
