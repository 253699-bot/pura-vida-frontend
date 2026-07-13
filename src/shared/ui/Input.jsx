export function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;

  return (
    <label className={`field ${className}`.trim()} htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input id={inputId} className="input" {...props} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
