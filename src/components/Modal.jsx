import { useEffect, useRef } from 'react';

/* Same look as the design-system Dialog (reuses its classes) plus a close
   button at the top right. The scrolling happens inside, so the button stays put. */
export default function Modal({ title, onClose, footer, children }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="fh-dialog">
      <div className="fh-dialog__scrim" onClick={onClose} />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className="fh-dialog__panel modal" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
        <div className="modal__scroll">
          <h2 className="fh-dialog__title">{title}</h2>
          <div className="fh-dialog__body">{children}</div>
          {footer && <div className="fh-dialog__foot">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
