import { Article } from "../models/article";
const { DateTime } = require("luxon"); /* might not need? */

// first make function to sort aticles by monthyltrending views
// then based on that sorted list or whatever assign each article a rank





export async function test(){
    const trendy =  await Article.find().select("-content").sort({ viewCountMonthly: -1 }).lean().exec();
    

if (trendy.length) {
        for (let i = 0; i < trendy.length; i++) // goes through each article, in order of viewCountMonthly
        {
            // assign rank logic below
            console.log(trendy[i].title, trendy[i].viewCountMonthly , trendy[i].prevMonthTrendingRank);
            const rank = i + 1;
             await Article.updateOne({ slug: trendy[i].slug }, { $set: { prevMonthTrendingRank: rank } }).exec();


        }
    }
}