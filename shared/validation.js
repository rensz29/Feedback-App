// The form's rules, used on both sides: the browser for instant messages and
// the server as the final check.

import { NOT_TRIED, OTHER, QUESTIONS } from "./questions.js";

export const MAX_TEXT = 2000;
export const MAX_SHORT_TEXT = 120;
export const MAX_OTHER_TEXT = 200;

const MSG_REQUIRED = "Pakisagot ang tanong na ito.";
const MSG_PHONE = "Pangalan lang po. Huwag ilagay ang phone number.";
const MSG_TOO_LONG = "Masyadong mahaba. Paikliin nang kaunti.";
const msgExclusive = (option) => `"${option}" ay hindi puwedeng isabay sa ibang sagot.`;

const asText = (value) => (typeof value === "string" ? value : "");

function looksLikePhone(text) {
  return text.replace(/\P{Nd}/gu, "").length >= 7;
}

export function pickedOther(value) {
  return value === OTHER || (Array.isArray(value) && value.includes(OTHER));
}

/** Return { answers, errors }. Both are objects keyed by question id. */
export function parseForm(form) {
  const answers = {};
  const errors = {};

  for (const q of QUESTIONS) {
    const raw = form[q.id];

    if (q.type === "single") {
      if (!q.options.includes(raw)) {
        errors[q.id] = MSG_REQUIRED;
        continue;
      }
      answers[q.id] = raw;
    } else if (q.type === "multi") {
      // keep the order of the options, drop duplicates
      const values = q.options.filter((o) => Array.isArray(raw) && raw.includes(o));
      if (values.length === 0) {
        errors[q.id] = MSG_REQUIRED;
        continue;
      }
      if (values.includes(q.exclusive) && values.length > 1) {
        errors[q.id] = msgExclusive(q.exclusive);
      }
      answers[q.id] = values;
    } else if (q.type === "scale") {
      if (["1", "2", "3", "4", "5"].includes(raw)) {
        answers[q.id] = Number(raw);
      } else if (q.notTried && raw === NOT_TRIED) {
        answers[q.id] = NOT_TRIED;
      } else {
        errors[q.id] = MSG_REQUIRED;
        continue;
      }
    } else if (q.type === "text") {
      const value = asText(raw).trim();
      const limit = q.short ? MAX_SHORT_TEXT : MAX_TEXT;
      if (!value && !q.optional) {
        errors[q.id] = MSG_REQUIRED;
      } else if (value.length > limit) {
        errors[q.id] = MSG_TOO_LONG;
      } else if (value && q.noPhone && looksLikePhone(value)) {
        errors[q.id] = MSG_PHONE;
      }
      answers[q.id] = value;
    }

    // Optional "Iba pa" free text for questions that offer it
    if (q.otherText) {
      const other = Array.from(asText(form[`${q.id}_other`]).trim()).slice(0, MAX_OTHER_TEXT).join("");
      answers[`${q.id}_other`] = pickedOther(answers[q.id]) ? other : "";
    }
  }

  return { answers, errors };
}
