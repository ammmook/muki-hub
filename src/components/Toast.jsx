import { useEffect } from 'react';

/* Small status message with one action (used for "Removed … Undo"). Dismisses itself. */
export default function Toast({ message, actionLabel, onAction, onDismiss, ms = 6000 }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, ms);
    return () => clearTimeout(t);
  }, [message, ms, onDismiss]);
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{message}</span>
      {actionLabel && (
        <button type="button" className="toast__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
