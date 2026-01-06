import { Article } from "../models/article";
import { Draft } from "../models/cms/draft";
import { Category } from "../models/category";

export const forceValidCategory = async (id: string) => {
  const target = (await Article.findById(id)) || (await Draft.findById(id));
  if (!target) return;

  console.log(`looking at "${target.get("title")}"'s category...`);

  if (!Object.values(Category).includes(target.get("category") as Category)) {
    target.set("category", Object.values(Category)[0]);
    console.log(`category was invalid. changed to ${target.get("category")}`);
  }

  await target.save();
};
