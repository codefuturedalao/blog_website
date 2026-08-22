#!/usr/bin/env node

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);

function option(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const codexHome = option("--codex-home", path.join(os.homedir(), ".codex"));
const outputPath = option(
  "--output",
  path.resolve("static/uploads/codex-activity.json"),
);
const timezone = option("--timezone", "Asia/Shanghai");
const rangeDays = Number(option("--days", "371"));
const sessionsRoot = path.join(codexHome, "sessions");

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dayKey(date) {
  return dayFormatter.format(date);
}

function shiftDay(key, offset) {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

async function collectJsonlFiles(directory) {
  const files = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsonlFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      files.push(entryPath);
    }
  }

  return files;
}

function calculateStreaks(days, today) {
  const active = new Set(days.filter((day) => day.tokens > 0).map((day) => day.date));
  let longest = 0;
  let running = 0;

  for (let cursor = shiftDay(today, -(rangeDays - 1)); cursor <= today; cursor = shiftDay(cursor, 1)) {
    if (active.has(cursor)) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  let current = 0;
  let cursor = active.has(today) ? today : shiftDay(today, -1);
  while (active.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }

  return { current, longest };
}

async function main() {
  if (!Number.isInteger(rangeDays) || rangeDays < 7) {
    throw new Error("--days must be an integer of at least 7");
  }

  const files = await collectJsonlFiles(sessionsRoot);
  const activity = new Map();

  for (const file of files) {
    const contents = await fs.readFile(file, "utf8");
    let previousTotal = 0;

    for (const line of contents.split("\n")) {
      if (!line || !line.includes('"token_count"')) continue;

      let event;
      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }

      if (event.type !== "event_msg" || event.payload?.type !== "token_count") continue;

      const total = Number(event.payload?.info?.total_token_usage?.total_tokens);
      const timestamp = new Date(event.timestamp);
      if (!Number.isFinite(total) || total < 0 || Number.isNaN(timestamp.getTime())) continue;

      const delta = total >= previousTotal ? total - previousTotal : total;
      previousTotal = total;
      if (delta <= 0) continue;

      const date = dayKey(timestamp);
      const record = activity.get(date) ?? { date, tokens: 0, sessions: new Set() };
      record.tokens += delta;
      record.sessions.add(file);
      activity.set(date, record);
    }
  }

  const today = dayKey(new Date());
  const start = shiftDay(today, -(rangeDays - 1));
  const days = [...activity.values()]
    .filter((day) => day.date >= start && day.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const uniqueSessions = new Set(days.flatMap((day) => [...day.sessions]));
  const streaks = calculateStreaks(days, today);
  const totalTokens = days.reduce((sum, day) => sum + day.tokens, 0);

  const output = {
    generatedAt: new Date().toISOString(),
    timezone,
    range: { start, end: today, days: rangeDays },
    summary: {
      activeDays: days.length,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      totalSessions: uniqueSessions.size,
      totalTokens,
      peakDailyTokens: Math.max(0, ...days.map((day) => day.tokens)),
    },
    days: days.map((day) => ({
      date: day.date,
      tokens: day.tokens,
      sessions: day.sessions.size,
    })),
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  process.stdout.write(
    `Generated ${outputPath} from ${files.length} local Codex sessions (${days.length} active days).\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
