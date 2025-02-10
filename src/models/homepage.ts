import mongoose from "mongoose";
import { Category } from "./category";
import { Position } from "./position";
import { Document } from "mongoose";

interface HomepageAttrs {
  title: string;
  content: string;
  imageUrl: string;
  category: Category;
  user: {
    id: string;
    name: string;
    imageUrl: string;
  };
  position: Position;
  slug?: string;
}

interface HomepageModel extends mongoose.Model<HomepageDoc> {
  build(attrs: HomepageAttrs): HomepageDoc;
}

export interface HomepageDoc extends HomepageAttrs, Document {}

const homepageSchema = new mongoose.Schema(
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

const Homepage = mongoose.model<HomepageDoc, HomepageModel>("Homepage", homepageSchema);

export { homepageSchema, Homepage };
