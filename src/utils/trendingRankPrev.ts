import { Article } from "../models/article";
import { resetDone, resetDay, resetMonthlyViews, resetSorting } from "./monthlyViewReset";
export let newMonthRankings: unknown = null;
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
      const Y = await Article.find()
        .select("-content")
        .sort({ prevMonthTrendingRank: 1 })
        .lean()
        .exec();
      newMonthRankings = Y;
      return newMonthRankings;
    }
  }
}
