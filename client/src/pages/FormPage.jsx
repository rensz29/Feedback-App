import { useEffect, useRef, useState } from "react";

import { INTRO, QUESTIONS, REQUIRED_NOTE, SECTIONS, TITLE } from "../../../shared/questions.js";
import { parseForm } from "../../../shared/validation.js";
import Question from "../components/Question.jsx";

const MSG_SEND_FAILED = "Hindi naipadala ang feedback. Pakisubukan ulit.";
const REQUIRED = QUESTIONS.filter((q) => !q.optional);

function focusQuestion(q) {
  const block = document.getElementById(`${q.id}-block`);
  block.scrollIntoView({ behavior: "smooth", block: "start" });
  block.querySelector("input, textarea")?.focus({ preventScroll: true });
}

export default function FormPage() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const alertRef = useRef(null);

  useEffect(() => {
    if (alert) alertRef.current.focus();
  }, [alert]);

  // Back/forward cache: re-enable the button if the page is shown again
  useEffect(() => {
    const reset = () => setSubmitting(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  function setAnswer(q, key, answer) {
    const next = { ...values, [key]: answer };
    setValues(next);
    if (errors[q.id]) setErrors({ ...errors, [q.id]: parseForm(next).errors[q.id] });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const website = e.currentTarget.elements.website.value;

    const found = parseForm(values).errors;
    setErrors(found);
    const firstBad = QUESTIONS.find((q) => found[q.id]);
    if (firstBad) {
      focusQuestion(firstBad);
      return;
    }

    setAlert("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      if (res.ok) {
        window.location.assign("/salamat");
        return;
      }
      const body = res.status === 400 ? await res.json() : {};
      if (body.errors) {
        setErrors(body.errors);
        setAlert(`May ${Object.keys(body.errors).length} tanong na kailangan pang ayusin. Tingnan ang mga naka-highlight sa ibaba.`);
      } else {
        setAlert(MSG_SEND_FAILED);
      }
    } catch {
      setAlert(MSG_SEND_FAILED);
    }
    setSubmitting(false);
  }

  const missing = parseForm(values).errors;
  const done = REQUIRED.filter((q) => !missing[q.id]).length;
  const total = REQUIRED.length;

  return (
    <>
      <div className="progress" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${(100 * done) / total}%` }} />
      </div>

      <header className="masthead">
        <div className="wrap">
          <p className="tag"><span className="tag-hole" />Beta test</p>
          <h1>{TITLE}</h1>
          <p className="intro">{INTRO}</p>
          <p className="note">{REQUIRED_NOTE}</p>
        </div>
      </header>

      <main className="wrap">
        {alert && <div className="alert" role="alert" tabIndex={-1} ref={alertRef}>{alert}</div>}

        <form id="feedback" onSubmit={handleSubmit} noValidate>
          <div className="hp" aria-hidden="true">
            <label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>

          {SECTIONS.map((section) => (
            <section className="sheet" key={section.title}>
              <h2>{section.title}</h2>
              {section.questions.map((q) => (
                <Question
                  key={q.id}
                  q={q}
                  value={values[q.id]}
                  other={values[`${q.id}_other`]}
                  error={errors[q.id]}
                  onChange={(answer) => setAnswer(q, q.id, answer)}
                  onOtherChange={(text) => setAnswer(q, `${q.id}_other`, text)}
                />
              ))}
            </section>
          ))}

          <div className="submit-bar">
            <button type="submit" id="submit-btn" disabled={submitting}>
              {submitting ? "Ipinapadala…" : "Ipadala ang feedback"}
            </button>
            <p className="count" id="answer-count" aria-live="polite">
              {done === total
                ? "Kumpleto na ang mga required na tanong."
                : `${done} sa ${total} na required na tanong ang nasagot.`}
            </p>
          </div>
        </form>
      </main>
    </>
  );
}
