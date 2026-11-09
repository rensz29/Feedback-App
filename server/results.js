// Turns stored responses into the results page data and the CSV export.

import { NOT_TRIED, QUESTIONS, SECTIONS } from "../shared/questions.js";

const TZ = process.env.APP_TIMEZONE ?? "Asia/Manila";

const displayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h12",
});

const numericFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function dateParts(format, date) {
  return Object.fromEntries(format.formatToParts(date).map((part) => [part.type, part.value]));
}

/** "Nov 09, 02:14 PM" in the app's time zone. */
function displayTime(date) {
  const p = dateParts(displayFormat, date);
  return `${p.month} ${p.day}, ${p.hour}:${p.minute} ${p.dayPeriod}`;
}

// ---------------------------------------------------------------- summary

function average(values) {
  const nums = values.filter((v) => Number.isInteger(v));
  if (nums.length === 0) return null;
  return Math.round((100 * nums.reduce((a, b) => a + b, 0)) / nums.length) / 100;
}

function isBlank(value) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

/** Non-empty answers stored under `key`, newest first. */
function textAnswers(responses, key) {
  return responses
    .filter((r) => r.answers[key])
    .map((r) => ({ when: displayTime(r.when), text: r.answers[key] }))
    .reverse();
}

function tally(q, responses) {
  const values = responses.map((r) => r.answers[q.id]);
  const counts = new Map();
  let answered = 0;
  for (const value of values) {
    if (isBlank(value)) continue;
    answered += 1;
    for (const x of Array.isArray(value) ? value : [value]) {
      counts.set(String(x), (counts.get(String(x)) ?? 0) + 1);
    }
  }

  const item = { q, answered };
  let keys = q.options;
  if (q.type === "scale") {
    keys = ["1", "2", "3", "4", "5", ...(q.notTried ? [NOT_TRIED] : [])];
    item.average = average(values);
  }
  item.rows = keys.map((label) => {
    const count = counts.get(label) ?? 0;
    return { label, count, pct: answered ? Math.round((100 * count) / answered) : 0 };
  });
  if (q.otherText) item.other = textAnswers(responses, `${q.id}_other`);
  return item;
}

export function buildSummary(responses) {
  return {
    total: responses.length,
    latest: responses.length ? displayTime(responses.at(-1).when) : null,
    overallAvg: average(responses.map((r) => r.answers.q16_overall)),
    summary: SECTIONS.map((section) => ({
      title: section.title,
      results: section.questions.map((q) =>
        q.type === "text" ? { q, texts: textAnswers(responses, q.id) } : tally(q, responses),
      ),
    })),
  };
}

// -------------------------------------------------------------- CSV export

/** Stop spreadsheet apps from treating typed answers as formulas. */
function csvSafe(value) {
  return typeof value === "string" && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvRow(fields) {
  const cells = fields.map((field) => {
    const text = String(field);
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  });
  return `${cells.join(",")}\r\n`;
}

export function buildCsv(responses) {
  const header = ["ID", `Submitted (${TZ})`];
  const keys = [];
  for (const q of QUESTIONS) {
    header.push(`${q.num}. ${q.label}`);
    keys.push(q.id);
    if (q.otherText) {
      header.push(`${q.num}. Iba pa (sagot)`);
      keys.push(`${q.id}_other`);
    }
  }

  let csv = `﻿${csvRow(header)}`; // BOM so Excel reads Tagalog characters and emoji correctly
  for (const r of responses) {
    const p = dateParts(numericFormat, r.when);
    const row = [r.id, `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`];
    for (const key of keys) {
      const value = r.answers[key] ?? "";
      row.push(csvSafe(Array.isArray(value) ? value.join("; ") : value));
    }
    csv += csvRow(row);
  }
  return csv;
}

export function csvFilename() {
  const p = dateParts(numericFormat, new Date());
  return `zy-feedback-${p.year}${p.month}${p.day}-${p.hour}${p.minute}.csv`;
}
