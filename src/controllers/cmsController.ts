import { Request, Response } from "express";
import { Category } from "../models/category";
import { Draft } from "../models/cms/draft";
import mongoose from "mongoose";
import { Article } from "../models/article";
import { Position } from "../models/position";
import { Homepage } from "../models/homepage";
import { DraftStatus } from "../models/cms/draftStatus";
import { Role } from "../models/role";
import sanitize from "sanitize-html";
import { forceValidCategory } from "../utils/forceValidCategory";
import { publishNetlify } from "../utils/publishNetlify";
import { User } from "../models/user";

async function categories(req: Request, res: Response) {
  const categories = Object.values(Category);

  res.status(200).send(categories);
}

async function deleteArticle(req: Request, res: Response) {
  const draft = await Draft.findById(req.params.id);

  if (!draft) return res.status(404).json({ message: "Draft not found" });

  if (draft.userId !== req.currentUser!.id)
    return res.status(401).json({ message: "Unauthorized" });

  await draft.deleteOne();
  res.sendStatus(204);
}

async function index(req: Request, res: Response) {
  const { status } = req.query; 
  let drafts;

  if (status) {
    drafts = await Draft.find({ userId: req.currentUser!.id, status });
  } else {
    drafts = await Draft.find({ userId: req.currentUser!.id });
  }

  res.status(200).send(drafts);
}


async function newArticle(req: Request, res: Response) {
  const draft = await Draft.create({
    title: "Untitled",
    content: "This is where you should write the content of your article ...",
    userId: req.currentUser!.id,
  });

  draft.save();

  res.status(201).send(draft);
}

async function publish(req: Request, res: Response) {
  const { id } = req.params;

  const draft = await Draft.findById(id);

  if (!draft) return res.status(404).json({ message: "draft not found" });

  if (!mongoose.connection.db) return res.status(500).json({ message: "krill issue" });

  const user = await User.findById(draft.userId);

  if (!user) return res.status(404).json({ message: "author not found" });

  const attrs = {
    title: draft.title,
    content: draft.content,
    customAuthor: draft.customAuthor,
    imageUrl: draft.imageUrl,
    imageAlt: draft.imageAlt,
    category: draft.category,
    user: {
      id: draft.userId,
      name: user.name,
      imageUrl: user.imageUrl,
    },
  };

  const article = await Article.create(attrs);
  // express validates stuff in a pre-save hook
  // catch invalid categories
  try {
    await article.save();
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      if (error.errors.category.kind === "enum" && error.errors.category.path === "category")
        await forceValidCategory(draft.id);
  }

  await Draft.findByIdAndDelete(id);

  // create homepage article
  const isValidPosition = Object.values(Position).includes(req.body.position);

  if (isValidPosition) {
    await Homepage.findOneAndDelete({ position: req.body.position, category: draft.category });

    Homepage.create({
      ...attrs,
      position: req.body.position,
      slug: article.slug,
    })
      .then((homepage) => {
        homepage.save();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  publishNetlify(res, req);
}

async function forcePublish(req: Request, res: Response) {
  publishNetlify(res, req);
}

async function ready(req: Request, res: Response) {
  const drafts = await Draft.find({ status: DraftStatus.Ready });

  res.status(200).send(drafts);
}

async function review(req: Request, res: Response) {
  const drafts = await Draft.find({ status: DraftStatus.Review });

  res.status(200).send(drafts);
}

async function show(req: Request, res: Response) {
  const { id } = req.params;

  const draft = await Draft.findById(id);

  if (!draft) return res.status(404).json({ message: "draft not found" });

  // writers can only see their own articles
  if (draft.userId !== req.currentUser!.id && req.currentUser!.role === Role.Writer)
    return res.status(401).json({ message: "Unauthorized" });

  res.status(200).send(draft);
}

async function update(req: Request, res: Response) {
  const { id } = req.params;

  const draft = await Draft.findById(id);

  if (!draft) return res.status(404).json({ message: "draft not found" });

  if (draft.userId !== req.currentUser!.id && req.currentUser!.role === Role.Writer)
    return res.status(401).json({ message: "Unauthorized" });

  // draft - for writer
  if (draft.userId == req.currentUser!.id) {
    // TODO - refactor update logic
    function isEmpty(thing: any) {
      return String(thing).trim().length === 0;
    }

    // these are required!!!! do not let them be empty!!
    const title = isEmpty(req.body.title) ? draft.title : sanitize(req.body.title);
    const content = isEmpty(req.body.content) ? draft.content : sanitize(req.body.content);
    const customAuthor = isEmpty(req.body.customAuthor)
      ? draft.customAuthor
      : req.body.customAuthor;

    // writers can only send to review
    const status = req.body.status === DraftStatus.Review ? req.body.status : draft.status;

    // writers can change article category
    // will CRASH AND BURN if it's not valid enum. just kinda ignore them if it's invalid
    const category =
      req.body.category === undefined || !Object.values(Category).includes(req.body.category)
        ? draft.category
        : req.body.category;

    // not required whatever
    const imageUrl = req.body.imageUrl == undefined ? draft.imageUrl : req.body.imageUrl; // cms doesn't actually support removing an image?
    const imageAlt = req.body.imageAlt == undefined ? draft.imageAlt : req.body.imageAlt; // alt can be nuked though

    draft.set({ title, content, customAuthor, status, imageUrl, imageAlt, category });
  }

  // editor - can move to ready and back to draft
  if (
    req.currentUser!.role == Role.Editor ||
    (req.currentUser!.role == Role.Admin && draft.status == DraftStatus.Review)
  ) {
    if (req.body.status == DraftStatus.Ready || DraftStatus.Draft) {
      draft.set({
        status: req.body.status,
      });
    }
  }

  // admin
  if (req.currentUser!.role == Role.Admin && draft.status == DraftStatus.Ready) {
    if (req.body.status == DraftStatus.Draft) {
      draft.set({
        status: req.body.status,
      });
    }
  }

  try {
    await draft.save();
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      if (error.errors.category.kind === "enum" && error.errors.category.path === "category")
        await forceValidCategory(draft.id);
  }

  res.send(draft);
}

module.exports = {
  categories,
  deleteArticle,
  index,
  newArticle,
  publish,
  forcePublish,
  ready,
  review,
  show,
  update,
};
