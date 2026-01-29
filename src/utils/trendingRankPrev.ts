import { Article } from "../models/article";
import { resetDone, resetDay, resetMonthlyViews } from "./monthlyViewReset";
export let newMonthRankings: unknown = null;
const { DateTime } = require("luxon");

export async function givePrevMonthOrder(X?: { slug: string }[]) {
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
      const sortedRankings = await Article.find()
        .select("-content")
        .sort({ prevMonthTrendingRank: 1 })
        .lean()
        .exec();
      newMonthRankings = sortedRankings;
      return newMonthRankings;
    }
  }
}
