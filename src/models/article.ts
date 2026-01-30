import mongoose from "mongoose";
import { Category } from "./category";
const mongooseSlugPlugin = require("mongoose-slug-plugin");

const schemaDefinition = {
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  customAuthor: {
    type: String,
    required: false,
    trim: true,
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
  imageUrl: {
    type: String,
    required: false,
  },
  imageAlt: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    enum: Object.values(Category),
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  viewCountMonthly: {
    type: Number,
    required: true,
    default: 0,
  },
  viewCountTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  prevMonthTrendingRank: {
    type: Number,
    required: true,
    default: 0,
  },
} as const;

const articleSchema = new mongoose.Schema(schemaDefinition, {
  timestamps: true,
  toJSON: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.slug_history;
    },
  },
});

articleSchema.plugin(mongooseSlugPlugin, { tmpl: "<%=title%>" });

const Article = mongoose.model("Article", articleSchema);

export { Article };
