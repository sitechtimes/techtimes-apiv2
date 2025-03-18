import mongoose from "mongoose";
import { DraftStatus } from "./draftStatus";
import { Category } from "../category";

interface DraftAttrs {
  title: string;
  content: string;
  userId: string;
  customAuthor?: string;
}

interface DraftModel extends mongoose.Model<DraftDoc> {
  build(attrs: DraftAttrs): DraftDoc;
}

export interface DraftDoc extends mongoose.Document {
  title: string;
  content: string;
  userId: string;
  customAuthor?: string;
  imageUrl: string;
  imageAlt: string;
  status: DraftStatus;
  category: Category;
}

const draftSchema = new mongoose.Schema(
  {
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
      default: Category.Technology,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Draft = mongoose.model<DraftDoc, DraftModel>("Draft", draftSchema);

export { draftSchema, Draft };
