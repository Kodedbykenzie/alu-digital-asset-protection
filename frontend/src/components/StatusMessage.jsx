export default function StatusMessage({ type = "info", title, children }) {
  if (!children && !title) return null;

  const icon = {
    success: "✓",
    error: "!",
    warning: "⚠",
    info: "i",
  }[type];

  return (
    <div className={`status-message status-${type}`} role="status">
      <span className="status-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        {title ? <strong>{title}</strong> : null}
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}
