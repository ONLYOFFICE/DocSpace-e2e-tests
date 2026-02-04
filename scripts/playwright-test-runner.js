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

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function writeLastRun(lastRunPath, lastRunData) {
  fs.writeFileSync(lastRunPath, JSON.stringify(lastRunData, null, 2));
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

// We get all test files and return the path from the category (/e2e/... or /api/...)
function getSpecFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getSpecFiles(fullPath, files);
    } else if (file.endsWith(".spec.ts")) {
      const relPath = path.relative("./src/tests", fullPath);
      files.push("/" + relPath.split(path.sep).join("/"));
    }
  });
  return files;
}

// Select the top level (category or All tests)
async function getTopLevelAnswer(lastRun) {
  const choices = [
    { name: "All tests", value: "all" },
    { name: "API tests", value: "api" },
    { name: "E2E tests", value: "e2e" },
  ];

  if (lastRun) {
    const dockerInfo = lastRun.useDocker ? " [Docker]" : "";
    choices.unshift({
      name: `🔁 Repeat previous run (${lastRun.category}/${lastRun.answer}${lastRun.playwrightFlags?.join(" ") || ""}${dockerInfo})`,
      value: "last",
    });
  }

  return await select({
    message: "Select test category",
    choices,
    loop: false,
  });
}

// Select test inside category
async function getTestSelectAnswer(category, lastRun) {
  const specs = getSpecFiles(`./src/tests/${category}`);
  const testChoices = [
    { name: "All tests", value: "all" },
    ...specs.map((s) => ({ name: s, value: s })),
  ];

  if (lastRun && lastRun.category === category) {
    const dockerInfo = lastRun.useDocker ? " [Docker]" : "";
    testChoices.unshift({
      name: `🔁 Repeat previous run (${lastRun.answer}${lastRun.playwrightFlags?.join(" ") || ""}${dockerInfo})`,
      value: "last",
    });
  }

  return await select({
    message: `Select a ${category.toUpperCase()} test`,
    choices: testChoices,
    loop: false,
  });
}

// Select environment
async function getRunEnvironment(skip) {
  if (skip) return false;
  return await select({
    message: "Run environment",
    choices: [
      { name: "Local", value: false },
      { name: "Docker container", value: true },
    ],
  });
}

// Select Playwright flags (only for e2e)
async function getPlaywrightFlags(skip, isDockerEnv, category) {
  if (skip || category === "api") return [];
  const flags = [
    {
      name: "Update snapshots (--update-snapshots)",
      value: "--update-snapshots",
    },
  ];
  if (!isDockerEnv)
    flags.push({ name: "Headed mode (--headed)", value: "--headed" });
  return await checkbox({ message: "Playwright flags", choices: flags });
}

// Local run
function runPlaywrightLocal(playwrightArgs) {
  const child = spawn("npx", ["playwright", "test", ...playwrightArgs], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => process.exit(code));
}

// Run in Docker
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
  const child = spawn("docker-compose", dockerArgs, { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code));
}

// Repeat last run
function lastAnswerVariant(lastRun) {
  const arg =
    lastRun.answer === "all" ? "" : `^${escapeRegex(lastRun.answer)}$`;
  const runner = lastRun.useDocker ? runPlaywrightDocker : runPlaywrightLocal;
  runner([arg, ...(lastRun.playwrightFlags || [])]);
}

// New run
function newAnswerVariant(
  category,
  answer,
  isDockerEnv,
  playwrightFlags,
  lastRunPath,
) {
  const sel = answer === "all" ? "<all>" : answer;
  console.log(
    `Run: ${isDockerEnv ? "docker-compose run --rm tests-local " : ""}npx playwright test ${sel} ${playwrightFlags.join(" ")}`,
  );
  const arg = answer === "all" ? "" : `^${escapeRegex(answer)}$`;
  const runner = isDockerEnv ? runPlaywrightDocker : runPlaywrightLocal;
  runner([arg, ...playwrightFlags]);
  writeLastRun(lastRunPath, {
    category,
    answer,
    playwrightFlags,
    useDocker: isDockerEnv,
  });
}

// Main function
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

  // Select top level
  const topLevel = await getTopLevelAnswer(lastRun);
  const isLastRun = topLevel === "last";

  if (isLastRun) {
    lastAnswerVariant(lastRun);
    return;
  }

  // If you selected All tests at the top level, then combine all tests
  let category = topLevel;
  let answer;
  if (topLevel === "all") {
    category = "all";
    answer = "all"; // run all tests at once
  } else {
    // Select test inside category
    answer = await getTestSelectAnswer(category, lastRun);
    if (answer === "last") {
      lastAnswerVariant(lastRun);
      return;
    }
  }

  // Select environment and flags
  const isDockerEnv = await getRunEnvironment(false);
  const playwrightFlags = await getPlaywrightFlags(
    false,
    isDockerEnv,
    category,
  );

  // Run
  if (category === "all") {
    // Combine all tests from api and e2e
    const allSpecs = [
      ...getSpecFiles("./src/tests/api"),
      ...getSpecFiles("./src/tests/e2e"),
    ];
    const args = allSpecs.length ? allSpecs : [];
    const runner = isDockerEnv ? runPlaywrightDocker : runPlaywrightLocal;
    runner(args);
    writeLastRun(lastRunPath, {
      category: "all",
      answer: "all",
      playwrightFlags,
      useDocker: isDockerEnv,
    });
  } else {
    newAnswerVariant(
      category,
      answer,
      isDockerEnv,
      playwrightFlags,
      lastRunPath,
    );
  }
};

run();
