export function ComingSoon({ title, description, icon: Icon, children }) {
  return (
    <section className="coming-soon">
      {Icon ? (
        <span className="coming-soon__icon" aria-hidden="true">
          <Icon size={28} strokeWidth={2} />
        </span>
      ) : null}
      <div className="coming-soon__content">
        <p className="coming-soon__eyebrow">Próximamente</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children ? <div className="coming-soon__actions">{children}</div> : null}
    </section>
  );
}
