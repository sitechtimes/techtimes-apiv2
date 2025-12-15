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
import { getEffectiveTypeParameterDeclarations } from "typescript";

// get categories
async function categories(req: Request, res: Response) {
  const categories = Object.values(Category);
  res.status(200).send(categories);
}

async function deleteArticle(req: Request, res: Response) {
  const draft = await Draft.findById(req.params.id);
  if (!draft) return res.status(404).json({ error: "DRAFT_NOT_FOUND" });

  if (draft.userId !== req.currentUser!.id) return res.sendStatus(401);

  await draft.deleteOne();
  res.sendStatus(204);
}

/** list the user's articles */
async function index(req: Request, res: Response) {
  const { status } = req.query;

  const query = { userId: req.currentUser!.id };
  if (status) Object.assign(query, { status });

  const drafts = await Draft.find(query);
  res.status(200).send(drafts);
}

async function newArticle(req: Request, res: Response) {
  const draft = await Draft.create({
    title: "Untitled",
    content: "This is where you should write the content of your article...",
    userId: req.currentUser!.id,
  });

  draft.save();
  res.status(201).send(draft);
}

async function publish(req: Request, res: Response) {
  const { id } = req.params;
  const draft = await Draft.findById(id);

  if (!draft) return res.status(404).json({ error: "DRAFT_NOT_FOUND" });
  if (!mongoose.connection.db) return res.status(500).json({ error: "KRILL_ISSUE" });

  const user = await User.findById(draft.userId);
  if (!user) return res.status(404).json({ error: "AUTHOR_NOT_FOUND" });

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
  try {
    await article.save();
  } catch (error) {
    // catch invalid categories
    if (error instanceof mongoose.Error.ValidationError)
      if (error.errors.category.kind === "enum" && error.errors.category.path === "category")
        await forceValidCategory(draft.id);
  }

  await Draft.findByIdAndDelete(id);
  // create homepage article
  const isValidPosition = Object.values(Position).includes(req.body.position);

  // TODO: WHAT IS THE HOMEPAGE SYSTEM AUBGOURWNUVJNSD
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

  publishNetlify(req, res);
}

/** force publish an updated version of the site */
async function forcePublish(req: Request, res: Response) {
  publishNetlify(req, res);
}

// get articles in review
async function review(req: Request, res: Response) {
  const drafts = await Draft.find({ status: DraftStatus.Review });
  res.status(200).send(drafts);
}

// get articles that are ready to publish
async function ready(req: Request, res: Response) {
  const drafts = await Draft.find({ status: DraftStatus.Ready });
  res.status(200).send(drafts);
}

// get draft by id
async function show(req: Request, res: Response) {
  const { id } = req.params;
  const draft = await Draft.findById(id);

  if (!draft) return res.status(404).json({ error: "DRAFT_NOT_FOUND" });
  // writers can only see their own articles
  if (draft.userId !== req.currentUser!.id && req.currentUser!.role === Role.Writer)
    return res.sendStatus(401);

  res.status(200).send(draft);
}

// Update a draft. this is really messy good luck
async function update(req: Request, res: Response) {
  const { id } = req.params;
  const draft = await Draft.findById(id);

  if (!draft) return res.status(404).json({ error: "DRAFT_NOT_FOUND" });
  if (!req.currentUser) return res.sendStatus(401);

  // WRITER cannot update other people's DRAFT
  if (draft.userId !== req.currentUser.id && req.currentUser.role === Role.Writer)
    return res.sendStatus(401);

  // USER is updating their own DRAFT
  if (draft.userId === req.currentUser.id) {
    function isEmpty(thing: any) {
      return String(thing).trim().length === 0;
    }

    // these are required!!!! do not let them be empty!!
    const title = isEmpty(req.body.title) ? draft.title : sanitize(req.body.title);
    const content = isEmpty(req.body.content)
      ? draft.content
      : sanitize(req.body.content, {
          allowedTags: sanitize.defaults.allowedTags.concat(["img", "del"]),
          allowedAttributes: {
            span: ["style"],
          },
          allowedSchemes: sanitize.defaults.allowedSchemes.concat(["data", "http", "https"]),
        });
    const customAuthor = isEmpty(req.body.customAuthor)
      ? draft.customAuthor
      : req.body.customAuthor;

    // WRITER can send article to REVIEW
    const status = req.body.status === DraftStatus.Review ? req.body.status : draft.status;

    // WRITER can change article category
    // will CRASH AND BURN if it's not valid enum. just kinda ignore them if it's invalid
    const category =
      req.body.category === undefined || !Object.values(Category).includes(req.body.category)
        ? draft.category
        : req.body.category;

    // not required whatever
    const imageUrl = req.body.imageUrl === undefined ? draft.imageUrl : req.body.imageUrl;
    const imageAlt = req.body.imageAlt === undefined ? draft.imageAlt : req.body.imageAlt;

    const editorResponses =
      req.body.editorResponses === undefined ? draft.editorResponses : req.body.editorResponses;

    draft.set({
      title,
      content,
      customAuthor,
      status,
      editorResponses,
      imageUrl,
      imageAlt,
      category,
    });
  }

  // EDITOR/ADMIN - can move to ready and back to draft
  if ([Role.Editor, Role.Admin].includes(req.currentUser.role as Role)) {
    draft.set({
      status: req.body.status,
      editorResponses: req.body.editorResponses,
    });
  }

  try {
    await draft.save();
  } catch (error) {
    // catch invalid categories
    if (error instanceof mongoose.Error.ValidationError)
      if (error instanceof mongoose.Error.ValidationError) {
        if (
          error.errors.category &&
          error.errors.category.kind === "enum" &&
          error.errors.category.path === "category"
        ) {
          await forceValidCategory(draft.id);
        }
      }
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
