import mongoose from "mongoose";
import { DraftStatus } from "./draftStatus";
import { Category } from "../category";

interface DraftAttrs {
  title: string;
  content: string;
  userId: string;
}

interface DraftModel extends mongoose.Model<DraftDoc> {
  build(attrs: DraftAttrs): DraftDoc;
}

export interface DraftDoc extends mongoose.Document {
  title: string;
  content: string;
  userId: string;
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
    imageUrl: {
      type: String,
      default: null,
      required: false,
    },
    imageAlt: {
      type: String,
      default: null,
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(DraftStatus),
      required: true,
      default: DraftStatus.Draft,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(Category),
      default: Category.Technology,
      required: true,
    },
    userId: {
      type: String,
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

draftSchema.statics.build = (attrs: DraftAttrs) => {
  return new Draft(attrs);
};

const Draft = mongoose.model<DraftDoc, DraftModel>("Draft", draftSchema);

export { draftSchema, Draft };
