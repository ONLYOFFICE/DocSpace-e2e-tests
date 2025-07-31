/**
 * Playwright Test Runner Script
 *
 * This script provides an interactive CLI interface for running Playwright tests.
 * It allows users to:
 * - Select specific test files or run all tests
 * - Choose between local or Docker execution environments
 * - Configure Playwright flags (headed mode, update snapshots)
 * - Repeat previous test runs with the same configuration
 *
 * The script saves the last run configuration to a JSON file for easy reuse.
 */

import { checkbox, select } from "@inquirer/prompts";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

function writeLastRun(lastRunPath, answer, playwrightFlags, useDocker) {
  fs.writeFileSync(
    lastRunPath,
    JSON.stringify({ answer, playwrightFlags, useDocker }, null, 2),
  );
}

function readLastRun(lastRunPath) {
  if (fs.existsSync(lastRunPath)) {
    try {
      return JSON.parse(fs.readFileSync(lastRunPath, "utf-8"));
    } catch {
      console.log("Last run file is corrupted");
    }
  }
  return null;
}

function getSpecFiles(dir, files = []) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getSpecFiles(fullPath, files);
    } else if (file.endsWith(".spec.ts")) {
      files.push(file);
    }
  });
  return files;
}

const getTestSelectAnswer = async (lastRun) => {
  const specs = getSpecFiles("./src/tests/client");
  const testChoices = [
    { name: "All tests", value: "all" },
    ...specs.map((s) => ({ name: s, value: s })),
  ];

  if (lastRun) {
    const dockerInfo = lastRun.useDocker ? " [Docker]" : "";
    testChoices.unshift({
      name: `🔁 Repeat previous run (${lastRun.answer}${lastRun.playwrightFlags.join(" ")}${dockerInfo})`,
      value: "last",
    });
  }

  const answer = await select({
    message: "Select a test",
    choices: testChoices,
    loop: false,
  });

  return answer;
};

const getRunEnvironment = async (skip) => {
  if (skip) {
    return false;
  }

  const answer = await select({
    message: "Run environment",
    choices: [
      { name: "Local", value: false },
      { name: "Docker container", value: true },
    ],
  });

  return answer;
};

const getPlaywrightFlags = async (skip, isDockerEnv) => {
  if (skip) {
    return [];
  }

  const testChoices = [
    {
      name: "Update snapshots (--update-snapshots)",
      value: "--update-snapshots",
    },
  ];

  if (!isDockerEnv) {
    testChoices.push({
      name: "Headed mode (--headed)",
      value: "--headed",
    });
  }

  return await checkbox({
    message: "Playwright flags",
    choices: testChoices,
  });
};

function runPlaywrightLocal(playwrightArgs) {
  const localArgs = ["playwright", "test", ...playwrightArgs];

  const child = spawn("npx", localArgs, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => {
    process.exit(code);
  });
}

function runPlaywrightDocker(playwrightArgs) {
  const dockerArgs = [
    "run",
    "--rm",
    "tests-local",
    "npx",
    "playwright",
    "test",
    ...playwrightArgs,
  ];
  const child = spawn("docker-compose", dockerArgs, {
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    process.exit(code);
  });
}

const lastAnswerVariant = (lastRun) => {
  if (lastRun.useDocker) {
    runPlaywrightDocker([
      lastRun.answer === "all" ? "" : lastRun.answer,
      ...(lastRun?.playwrightFlags || []),
    ]);
  } else {
    runPlaywrightLocal([
      lastRun.answer === "all" ? "" : lastRun.answer,
      ...(lastRun?.playwrightFlags || []),
    ]);
  }
};

const newAnswerVariant = (
  isDockerEnv,
  playwrightFlags,
  runFunction,
  lastRunPath,
  answer,
) => {
  console.log(
    `Run: ${isDockerEnv ? "docker-compose run --rm tests-local" : ""} npx playwright test ${playwrightFlags.join(" ")}`,
  );
  runFunction([answer === "all" ? "" : answer, ...playwrightFlags]);
  writeLastRun(lastRunPath, answer, playwrightFlags, isDockerEnv);
};

const run = async () => {
  process.on("uncaughtException", (error) => {
    if (error instanceof Error && error.name === "ExitPromptError") {
      console.log("👋 until next time!");
    } else {
      throw error;
    }
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const lastRunPath = path.join(__dirname, "last-run.json");

  const lastRun = readLastRun(lastRunPath);
  const answer = await getTestSelectAnswer(lastRun);

  const isLastRun = answer === "last";

  // Skip environment and flag selection if repeating last run
  const isDockerEnv = isLastRun
    ? lastRun.useDocker
    : await getRunEnvironment(false);
  const playwrightFlags = await getPlaywrightFlags(isLastRun, isDockerEnv);

  const runFunction = isDockerEnv ? runPlaywrightDocker : runPlaywrightLocal;

  if (isLastRun) {
    lastAnswerVariant(lastRun);
  } else {
    newAnswerVariant(
      isDockerEnv,
      playwrightFlags,
      runFunction,
      lastRunPath,
      answer,
    );
  }
};

run();
