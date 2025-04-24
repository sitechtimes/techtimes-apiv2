import { Request, Response } from "express";
import { spawn } from "child_process";

export const publishNetlify = (res: Response, req: Request) => {
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

  let output = "";
  let error = "";
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
};
