import { Article } from "../models/article";
import { resetDone, resetDay, resetMonthlyViews } from "./monthlyViewReset";
export let newMonthRankings = null;
const { DateTime } = require("luxon");

export async function test(X?: any) {
  const today = DateTime.now().toObject().day;
  if (resetDone === false && today === resetDay) {
    if (X.length) {
      for (let i: number = 0; i < X.length; i++) {
        const rank: number = i + 1;
        await Article.updateOne(
          { slug: X[i].slug },
          { $set: { prevMonthTrendingRank: rank } }
        ).exec();
      }
      await resetMonthlyViews();
    }
  }
  if (today === resetDay && resetDone === true) {
    let Y = await Article.find()
      .select("-content")
      .sort({ prevMonthTrendingRank: 1 })
      .lean()
      .exec();

    return Y;

    // make x = y and return it to so if it fixes?
  }
}
