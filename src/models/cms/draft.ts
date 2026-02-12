import mongoose from "mongoose";
import { DraftStatus } from "./draftStatus";
import { Category } from "../category";

interface DraftAttrs {
  title: string;
  content: string;
  userId: string;
  customAuthor?: string;
  imageUrl?: string;
  imageAlt?: string;
  editorResponses?: string[];
  status?: DraftStatus;
  category?: Category;
}

export interface DraftDoc extends mongoose.Document {
  title: string;
  content: string;
  userId: string;
  customAuthor?: string;
  imageUrl: string;
  imageAlt: string;
  editorResponses: Array<{"name": string, "text": string}>;
  status: DraftStatus;
  category: Category;
}

interface DraftModel extends mongoose.Model<DraftDoc> {
  build(attrs: DraftAttrs): DraftDoc;
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
    editorResponses: {
      type: Array<{"name": string, "text": string}>,
      default: [],
      required: false,
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
  },
  {
    timestamps: true,
  }
);

// optional: add build function if you want
draftSchema.statics.build = (attrs: DraftAttrs) => {
  return new Draft(attrs);
};

const Draft = mongoose.model<DraftDoc, DraftModel>("Draft", draftSchema);

export { Draft };
