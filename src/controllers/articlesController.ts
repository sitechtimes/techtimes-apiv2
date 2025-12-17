import { Request, Response } from "express";
import { Article } from "../models/article";
import { SortOrder } from "mongoose";
import { resetMonthlyViews } from "../utils/monthlyViewReset";
import { test, newMonthRankings } from "../utils/trendingRankPrev";

/** get 20 most recent articles */
async function homepage(req: Request, res: Response) {
  const homepages = await Article.find()
    .select("-content")
    .sort({ updatedAt: "descending" })
    .limit(20);

  res.status(200).send(homepages);
}

async function index(req: Request, res: Response) {
  let query: any = {};
  let limit = 20;
  let sortBy = { updatedAt: 1 as SortOrder };

  if (req.query.category) query.category = req.query.category.toString();

  if (req.query.q) limit = Number(req.query.q);

  if (req.query.sort === "dateDes") sortBy = { updatedAt: -1 as SortOrder };

  // check if there are more articles by fetching one more than needed
  const articles = await Article.find(query)
    .sort(sortBy)
    .skip(Number(req.query.skip) ?? 0)
    .limit(limit + 1);
  const isMore = articles.length > limit;
  if (isMore) articles.pop();

  const response = {
    articles: articles,
    isMore: isMore,
  };

  res.status(200).send(response);
}

async function popular(req: Request, res: Response) {
  const popularity = await Article.find().select("-content").sort({ viewCountTotal: -1 });
  res.status(200).send(popularity);
}

async function trending(req: Request, res: Response) {
  const trendy = await Article.find().select("-content").sort({ viewCountMonthly: -1 });
  await test(trendy);
  res.status(200).send(trendy); // need to test out if the function somhow returns the trendy instance from function or from here
}

async function show(req: Request, res: Response) {
  const { slug } = req.params;

  const article = await Article.findOneAndUpdate(
    { slug },
    { $inc: { viewCountMonthly: 1, viewCountTotal: 1 } },
    { new: true }
  );
  if (!article) return res.status(404).json({ error: "ARTICLE_NOT_FOUND" });

  res.status(200).send(article);
}

module.exports = { homepage, index, show, popular, trending };
