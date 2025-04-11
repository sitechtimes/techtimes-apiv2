import { Article } from "../models/article";
import { Category } from "../models/category";
import { Draft } from "../models/cms/draft";

function isValidCategory(value: unknown): value is Category {
  return Object.values(Category).includes(value as Category);
}

export const forceValidCategory = async (id: string) => {
  const target = (await Article.findById(id)) || (await Draft.findById(id));
  if (!target) return;

  console.log(`looking at "${target.title}"'s category...`);

  if (!isValidCategory(target.category)) {
    target.category = Object.values(Category)[0];
    console.log(`category was invalid. changed to ${target.category}`);
  }

  await target.save();
};
