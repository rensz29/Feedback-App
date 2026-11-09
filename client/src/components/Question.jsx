import { NOT_TRIED } from "../../../shared/questions.js";
import { MAX_OTHER_TEXT, MAX_SHORT_TEXT, MAX_TEXT, pickedOther } from "../../../shared/validation.js";

function Choice({ type, name, option, checked, exclusive, onChange }) {
  return (
    <label className={`choice${exclusive ? " choice-exclusive" : ""}`}>
      <input type={type} name={name} value={option} checked={checked} onChange={onChange} />
      <span className={`mark${type === "checkbox" ? " mark-box" : ""}`} />
      <span className="text">{option}</span>
    </label>
  );
}

function SingleInput({ q, value, onChange }) {
  return (
    <div className="choices">
      {q.options.map((option) => (
        <Choice key={option} type="radio" name={q.id} option={option} checked={value === option} onChange={() => onChange(option)} />
      ))}
    </div>
  );
}

// "Wala akong naranasang problema" can't be combined with other problems
function toggle(chosen, option, checked, exclusive) {
  if (!checked) return chosen.filter((o) => o !== option);
  if (option === exclusive) return [option];
  return [...chosen.filter((o) => o !== exclusive), option];
}

function MultiInput({ q, value = [], onChange }) {
  return (
    <div className="choices">
      {q.options.map((option) => (
        <Choice
          key={option}
          type="checkbox"
          name={q.id}
          option={option}
          checked={value.includes(option)}
          exclusive={option === q.exclusive}
          onChange={(e) => onChange(toggle(value, option, e.target.checked, q.exclusive))}
        />
      ))}
    </div>
  );
}

function ScaleInput({ q, value, onChange }) {
  return (
    <div className="scale">
      <div className="scale-row">
        {["1", "2", "3", "4", "5"].map((n) => (
          <label className="step" key={n}>
            <input
              type="radio"
              name={q.id}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              aria-label={n === "1" ? `1 – ${q.low}` : n === "5" ? `5 – ${q.high}` : n}
            />
            <span>{n}</span>
          </label>
        ))}
      </div>
      <div className="scale-ends" aria-hidden="true">
        <span>1 = {q.low}</span>
        <span>5 = {q.high}</span>
      </div>
      {q.notTried && (
        <div className="choices">
          <Choice type="radio" name={q.id} option={NOT_TRIED} checked={value === NOT_TRIED} onChange={() => onChange(NOT_TRIED)} />
        </div>
      )}
    </div>
  );
}

function TextInput({ q, value = "", onChange }) {
  const change = (e) => onChange(e.target.value);
  return (
    <>
      <label className="sr-only" htmlFor={q.id}>{q.label}</label>
      {q.short ? (
        <input type="text" id={q.id} name={q.id} maxLength={MAX_SHORT_TEXT} autoComplete="name" value={value} onChange={change} />
      ) : (
        <textarea id={q.id} name={q.id} rows={3} maxLength={MAX_TEXT} value={value} onChange={change} />
      )}
    </>
  );
}

function OtherInput({ q, value = "", onChange }) {
  const id = `${q.id}_other`;
  return (
    <div className="other">
      <label htmlFor={id}>Ano ito? <span className="opt">(optional)</span></label>
      <input type="text" id={id} name={id} maxLength={MAX_OTHER_TEXT} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const INPUTS = { single: SingleInput, multi: MultiInput, scale: ScaleInput, text: TextInput };

export default function Question({ q, value, other, error, onChange, onOtherChange }) {
  const Input = INPUTS[q.type];
  return (
    <fieldset className={`q${error ? " has-error" : ""}`} id={`${q.id}-block`}>
      <legend>
        <span className="num">{q.num}</span>
        <span className="label">
          {q.label}
          {q.optional && <> <span className="opt">(optional)</span></>}
        </span>
      </legend>
      {q.hint && <p className="hint">{q.hint}</p>}

      <Input q={q} value={value} onChange={onChange} />
      {q.otherText && pickedOther(value) && <OtherInput q={q} value={other} onChange={onOtherChange} />}

      <p className="error" id={`${q.id}-error`} role="status">{error}</p>
    </fieldset>
  );
}
