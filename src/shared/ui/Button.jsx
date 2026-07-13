export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`button button--${variant} button--${size} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
