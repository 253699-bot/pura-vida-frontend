export function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;

  return (
    <label className={`field ${className}`.trim()} htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input
        id={inputId}
        className="input"
        {...props}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : props['aria-describedby']}
      />
      {error ? (
        <span className="field__error" id={`${inputId}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
