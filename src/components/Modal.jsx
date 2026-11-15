import { useEffect, useId, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* Same look as the design-system Dialog (reuses its classes) plus:
   - a close button at the top right (stays put while the form scrolls)
   - focus moves into the dialog, Tab stays inside, and focus returns to the trigger on close
   - the page behind doesn't scroll; Escape closes
   Pass `onSubmit` to render the content as a <form> so Enter submits. */
export default function Modal({ title, onClose, onSubmit, footer, children }) {
  const panel = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const el = panel.current,
      body = document.body;
    const prevFocus = document.activeElement;
    const prev = { overflow: body.style.overflow, pad: body.style.paddingRight };
    const bar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (bar > 0) body.style.paddingRight = bar + 'px'; // no layout jump when the scrollbar disappears

    (el.querySelector('.fh-dialog__body input') || el).focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const first = list[0],
        last = list[list.length - 1],
        at = document.activeElement;
      if (e.shiftKey && (at === first || at === el)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && at === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.pad;
      prevFocus?.focus?.();
    };
  }, []);

  const Wrap = onSubmit ? 'form' : 'div';
  const wrapProps = onSubmit
    ? {
        noValidate: true,
        onSubmit: (e) => {
          e.preventDefault();
          onSubmit();
        }
      }
    : {};

  return (
    <div className="fh-dialog">
      <div className="fh-dialog__scrim" onClick={onClose} />
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className="fh-dialog__panel modal">
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
        <Wrap className="modal__scroll" {...wrapProps}>
          <h2 id={titleId} className="fh-dialog__title">
            {title}
          </h2>
          <div className="fh-dialog__body">{children}</div>
          {footer && <div className="fh-dialog__foot">{footer}</div>}
        </Wrap>
      </div>
    </div>
  );
}
