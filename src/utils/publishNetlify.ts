import { Request, Response } from "express";
import { spawn } from "child_process";

export const publishNetlify = (req: Request, res: Response) => {
  console.log("deploying...");

  if (process.env.NETLIFY_SITE && process.env.NETLIFY_TOKEN) {
    let output = "";
    let error = "";

    res.sendStatus(202); // so user doesn't have to wait

    const deployCommand = [
      "deploy",
      "--build",
      "--prod",
      `--site=${process.env.NETLIFY_SITE}`,
      `--auth=${process.env.NETLIFY_TOKEN}`,
    ];

    const deployProcess = spawn("netlify", deployCommand, {
      shell: true,
      cwd: "../sitechtimes/",
    });

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
};
