import { useEffect, useState } from "react";

import { TITLE } from "../../../shared/questions.js";

// 4 shows as 4.0, 4.33 stays 4.33
const showAverage = (n) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

function Stats({ total, latest, overallAvg }) {
  return (
    <>
      <dl className="stats">
        <div><dt>Responses</dt><dd>{total}</dd></div>
        <div><dt>Average rating (Q16)</dt><dd>{overallAvg === null ? "–" : showAverage(overallAvg)}<small> / 5</small></dd></div>
        <div><dt>Latest response</dt><dd className="dd-small">{latest ?? "None yet"}</dd></div>
      </dl>
      <p className="admin-actions">
        <a className="btn" href="/admin/export.csv" download>Download all responses (CSV)</a>
        <a className="link-light" href="/" target="_blank" rel="noopener">Open the form</a>
      </p>
    </>
  );
}

function TextItems({ items }) {
  return items.map((t, i) => <li key={i}><time>{t.when}</time>{t.text}</li>);
}

function Counts({ item }) {
  const { q, answered, average, rows, other } = item;
  return (
    <>
      <p className="meta">
        {answered} answered
        {q.type === "multi" && " · could pick more than one, so % is of people who answered"}
        {average != null && <> · <strong>average {showAverage(average)} / 5</strong></>}
      </p>
      <table className="bars">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td className="bar-cell"><span className="bar" style={{ "--w": `${row.pct}%` }} /></td>
              <td className="n">{row.count}</td>
              <td className="pct">{row.pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {other?.length > 0 && (
        <details className="texts">
          <summary>"Iba pa" answers ({other.length})</summary>
          <ul><TextItems items={other} /></ul>
        </details>
      )}
    </>
  );
}

function Texts({ texts }) {
  return (
    <>
      <p className="meta">{texts.length} answered</p>
      {texts.length > 0 && <ul className="texts-list"><TextItems items={texts} /></ul>}
    </>
  );
}

function Results({ total, summary }) {
  if (total === 0) {
    return (
      <div className="sheet empty">
        <h2>No responses yet</h2>
        <p>Share the form link in the beta test WhatsApp group. Answers will show up here as soon as people send them.</p>
      </div>
    );
  }
  return summary.map((section) => (
    <section className="sheet" key={section.title}>
      <h2>{section.title}</h2>
      {section.results.map((item) => (
        <div className="result" key={item.q.id}>
          <h3><span className="num">{item.q.num}</span><span className="label">{item.q.label}</span></h3>
          {item.rows ? <Counts item={item} /> : <Texts texts={item.texts} />}
        </div>
      ))}
    </section>
  ));
}

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/admin/summary.json")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setData, (err) => setError(err.message));
  }, []);

  return (
    <>
      <header className="masthead masthead-admin">
        <div className="wrap wrap-wide">
          <p className="tag"><span className="tag-hole" />Results</p>
          <h1>{TITLE}</h1>
          {data ? <Stats {...data} /> : <p className="note">{error || "Loading…"}</p>}
        </div>
      </header>
      {data && <main className="wrap wrap-wide"><Results {...data} /></main>}
    </>
  );
}
