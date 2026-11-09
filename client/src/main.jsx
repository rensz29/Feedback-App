import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { TITLE } from "../../shared/questions.js";
import AdminPage from "./pages/AdminPage.jsx";
import FormPage from "./pages/FormPage.jsx";
import ThanksPage from "./pages/ThanksPage.jsx";
import "./style.css";

const PAGES = {
  "/": { Page: FormPage, title: TITLE, bodyClass: "page-form" },
  "/salamat": { Page: ThanksPage, title: `Salamat! – ${TITLE}`, bodyClass: "page-thanks" },
  "/admin": { Page: AdminPage, title: `Results – ${TITLE}`, bodyClass: "page-admin", lang: "en" },
};

const { Page, title, bodyClass, lang = "tl" } = PAGES[window.location.pathname] ?? PAGES["/"];

document.title = title;
document.documentElement.lang = lang;
document.body.className = bodyClass;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
