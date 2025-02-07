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
import { spawn } from "child_process";
import { User } from "../models/user";
import { forceValidCategory } from "../utils/forceValidCategory";

async function categories(req: Request, res: Response) {
  const categories = Object.values(Category);

  res.status(200).send(categories);
}

async function deleteArticle(req: Request, res: Response) {
  const draft = await Draft.findByIdAndDelete(req.params.id);

  if (!draft) return res.status(404).json({ message: "draft not found" });

  if (draft.userId !== req.currentUser!.id)
    return res.status(401).json({ message: "Unauthorized" });

  res.sendStatus(204);
}

async function index(req: Request, res: Response) {
  const drafts = await Draft.find({ userId: req.currentUser!.id });

  res.send(drafts);
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
  const draft = await Draft.findById(req.params.id);

  if (!draft) return res.status(404).json({ message: "draft not found" });

  if (!mongoose.connection.db) return res.status(500).json({ message: "krill issue" });

  const db = mongoose.connection.db.collection("users");

  const users = await db.find({ _id: new mongoose.Types.ObjectId(draft.userId) }).toArray();

  if (!users[0]) return res.status(404).json({ message: "author not found" });

  const attrs = {
    title: draft.title,
    content: draft.content,
    customAuthor: draft.customAuthor,
    imageUrl: draft.imageUrl,
    imageAlt: draft.imageAlt,
    category: draft.category,
    user: {
      id: draft.userId,
      name: users[0].name,
      imageUrl: users[0].imageUrl,
    },
  };

  const article = await Article.create(attrs);
  // express validates stuff in a pre-save hook
  // catch invalid categories
  try {
    await article.save();
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) await forceValidCategory(draft.id);
  }

  await Draft.findByIdAndDelete(req.params.id);

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

    // await homepage.save();
  }

  console.log("deploying...");

  let output = "";
  let error = "";
  if (process.env.NETLIFY_SITE && process.env.NETLIFY_TOKEN) {
    res.sendStatus(200); // so user doesn't have to wait

    const deployCommand = [
      "deploy",
      "--build", // build site locally
      "--prod",
      `--site=${process.env.NETLIFY_SITE}`,
      `--auth=${process.env.NETLIFY_TOKEN}`,
    ];

    // deploy to netlify. insane tomfoolery in that cwd but whatever
    const deployProcess = spawn("netlify", deployCommand, { shell: true, cwd: "../sitechtimes/" });

    deployProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    deployProcess.stderr.on("data", (data) => {
      error += data.toString();
    });
    deployProcess.on("close", (code) => {
      if (code === 0) console.log("deployed!");
      else console.log(output, error);
    });
  } else {
    console.log("deploy failed!!");
    return res.sendStatus(500);
  }
}

async function ready(req: Request, res: Response) {
  const drafts = await Draft.find({ status: DraftStatus.Ready });

  res.send(drafts);
}

async function review(req: Request, res: Response) {
  const drafts = await Draft.find({ status: DraftStatus.Review });

  res.send(drafts);
}

async function show(req: Request, res: Response) {
  const { id } = req.params;

  const draft = await Draft.findById(id);

  if (!draft) return res.status(404).json({ message: "draft not found" });

  if (draft.userId !== req.currentUser!.id && req.currentUser!.role === Role.Writer) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.send(draft);
}

async function update(req: Request, res: Response) {
  const draft = await Draft.findById(req.params.id);

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

    // editors can only send to review
    const status = req.body.status == DraftStatus.Review ? req.body.status : draft.status;

    // editors can change article category
    // will CRASH AND BURN if it's not valid enum. just kinda ignore them if it's invalid
    const category =
      req.body.category == undefined || !Object.values(Category).includes(req.body.category)
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
    if (error instanceof mongoose.Error.ValidationError) await forceValidCategory(draft.id);
  }

  res.send(draft);
}

module.exports = {
  categories,
  deleteArticle,
  index,
  newArticle,
  publish,
  ready,
  review,
  show,
  update,
};
