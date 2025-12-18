import { Article } from "../models/article";
import { resetTime, resetDone, resetDay, resetMonthlyViews } from "./monthlyViewReset";
export let newMonthRankings = null;
const { DateTime } = require("luxon");
const today = DateTime.now().toObject().day;
// first make function to sort aticles by monthyltrending views
// then based on that sorted list or whatever assign each article a rank

export async function test(X?: object) {
  if (resetDone === false && today === resetDay) {
    const trendy = await Article.find()
      .select("-content")
      .sort({ viewCountMonthly: -1 })
      .lean()
      .exec();

    if (trendy.length) {
      for (let i: number = 0; i < trendy.length; i++) {
        const rank: number = i + 1;
        await Article.updateOne(
          { slug: trendy[i].slug },
          { $set: { prevMonthTrendingRank: rank } }
        ).exec();
        console.log(trendy[i].title, trendy[i].viewCountMonthly, trendy[i].prevMonthTrendingRank);
      }
      await resetMonthlyViews();
      // only sory by the prevmonthranking when it is the reset time/day
    }
  }

  if (today === resetDay && resetDone === true) {
    let X = await Article.find()
      .select("-content")
      .sort({ prevMonthTrendingRank: 1 })
      .lean()
      .exec();
    return X;
  }
}
