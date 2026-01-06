import { Article } from "../models/article";
import { resetDone, resetDay, resetMonthlyViews } from "./monthlyViewReset";
export let newMonthRankings = null;
const { DateTime } = require("luxon");
const today = DateTime.now().toObject().day;

export async function test(X?: any) {
  if (resetDone === false && today === resetDay) {
    console.log(X);
    if (X.length) {
      for (let i: number = 0; i < X.length; i++) {
        const rank: number = i + 1;
        console.log(rank);

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
  }
}
