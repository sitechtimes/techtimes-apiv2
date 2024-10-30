import { connectToDatabase } from "../index";
import { NotFoundError, requireAuth, roles } from "@sitechtimes/shared";
import express from "express";
import mongoose from "mongoose";

import { Article } from "../../models/cms/article";
import { Draft } from "../../models/cms/draft";
import { Homepage } from "../../models/cms/homepage";
import { Position } from "../../models/cms/position";

const router = express.Router();

router.post(
  "/cms/:id/publish",
  requireAuth,
  roles(["admin"]),
  async (req, res) => {
    await connectToDatabase();

    const draft = await Draft.findById(req.params.id);

    if (!draft) {
      throw new NotFoundError();
    }

    const db = mongoose.connection.db.collection("users");

    const users = await db
      .find({ _id: mongoose.Types.ObjectId(draft.userId) })
      .toArray();

    if (!users[0]) {
      throw new NotFoundError();
    }

    const attrs = {
      title: draft.title,
      content: draft.content,
      imageUrl: draft.imageUrl,
      imageAlt: draft.imageAlt,
      category: draft.category,
      user: {
        id: draft.userId,
        name: users[0].name,
        imageUrl: users[0].imageUrl,
      },
    };

    const article = Article.build({ ...attrs });

    await article.save();
    await Draft.findByIdAndDelete(req.params.id);

    // create homepage article
    const isValidPosition = Object.values(Position).includes(req.body.position);

    if (isValidPosition) {
      await Homepage.findOneAndRemove({
        position: req.body.position,
        category: draft.category,
      });

      const homepage = Homepage.build({
        ...attrs,
        position: req.body.position,
        slug: article.slug,
      });

      await homepage.save();
    }

    res.sendStatus(200);
  }
);

export { router as publishDraftRouter };
