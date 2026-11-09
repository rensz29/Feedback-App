// Zy WhatsApp Beta Test feedback form.
//
// A small Express app: an endpoint for the form, the built React pages, and a
// password-protected results page with CSV export.

import { createHash, timingSafeEqual } from "node:crypto";
import { STATUS_CODES } from "node:http";
import path from "node:path";

import express from "express";

import { parseForm } from "../shared/validation.js";
import { closeDb, loadResponses, pingDb, saveResponse } from "./db.js";
import { buildCsv, buildSummary, csvFilename } from "./results.js";

const PORT = Number(process.env.PORT ?? 6080);
const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const DIST = path.resolve(import.meta.dirname, "../dist");

const app = express();
app.disable("x-powered-by");
// The browser picks the page by exact URL, so only exact URLs may reach it
app.set("strict routing", true);
app.set("case sensitive routing", true);

app.use((req, res, next) => {
  res.on("finish", () => console.log(`${req.ip} "${req.method} ${req.originalUrl}" ${res.statusCode}`));
  next();
});

// ------------------------------------------------------------- form + health

// The form is small; reject huge posts
app.post("/api/responses", express.json({ limit: "64kb" }), (req, res) => {
  const form = req.body ?? {};
  if (form.website) return res.status(201).json({ ok: true }); // hidden honeypot field; people never fill it

  const { answers, errors } = parseForm(form);
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  saveResponse(answers);
  res.status(201).json({ ok: true });
});

app.get("/health", (req, res) => {
  pingDb();
  res.json({ status: "ok" });
});

// --------------------------------------------------------------------- admin

const digest = (text) => createHash("sha256").update(text).digest();
const sameText = (a, b) => timingSafeEqual(digest(a), digest(b));

function requireAdmin(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res
      .status(503)
      .type("text/plain")
      .send("The results page is turned off. Set ADMIN_PASSWORD in your .env file and restart.");
  }

  const [scheme, encoded = ""] = (req.get("authorization") ?? "").split(" ");
  const decoded = scheme.toLowerCase() === "basic" ? Buffer.from(encoded, "base64").toString() : "";
  const colon = decoded.indexOf(":");
  if (colon !== -1 && sameText(decoded.slice(0, colon), ADMIN_USER) && sameText(decoded.slice(colon + 1), ADMIN_PASSWORD)) {
    return next();
  }

  res.status(401).set("WWW-Authenticate", 'Basic realm="Zy feedback results"').type("text/plain").send("Login required.");
}

app.use("/admin", requireAdmin);

app.get("/admin/summary.json", (req, res) => {
  res.json(buildSummary(loadResponses()));
});

app.get("/admin/export.csv", (req, res) => {
  res
    .type("text/csv; charset=utf-8")
    .set("Content-Disposition", `attachment; filename="${csvFilename()}"`)
    .send(buildCsv(loadResponses()));
});

// --------------------------------------------------------------------- pages

app.use("/assets", express.static(path.join(DIST, "assets"), { immutable: true, maxAge: "1y" }));
app.use(express.static(DIST, { index: false }));

app.get(["/", "/salamat", "/admin"], (req, res) => {
  res.sendFile("index.html", { root: DIST });
});

app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: STATUS_CODES[status] });
});

const server = app.listen(PORT, "0.0.0.0", () => console.log(`Listening on port ${PORT}`));

// Node ignores SIGTERM when it runs as PID 1, so `docker stop` needs this
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close(() => {
      closeDb();
      process.exit(0);
    });
  });
}
