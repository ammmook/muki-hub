import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { F } from '../forest.js';
import { reorder } from '../lib/reorder.js';

/* Drag-to-reorder board that works with mouse, touch and pen (pointer events).
   - Mouse: press and move a few pixels to lift a card.
   - Touch / pen: press and hold ~0.25s, then drag. Moving before that scrolls the page.
   - Keyboard / screen reader: arrow keys on the grip button, or the star to make a card main.
   Other cards slide into place (FLIP). The order is saved once, on drop; if the browser
   cancels the gesture (for example it took over scrolling) the order snaps back.
   `projects` is the source of truth: when it changes (another tab, an undo) the board follows. */

const HOLD_MS = 250,
  SLOP = 8,
  MOUSE_SLOP = 5,
  EDGE = 90,
  INSET = 0.2;

export default function SortableBoard({ projects, onChange, readOnly = false }) {
  const [items, setItems] = useState(projects);
  const [liftId, setLiftId] = useState(null);
  const [announce, setAnnounce] = useState('');
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const slots = useRef({}),
    cards = useRef({});
  const snap = useRef(null);
  const press = useRef(null); // pointer is down, drag not started yet
  const drag = useRef(null); // drag in progress
  const justDragged = useRef(false);
  const raf = useRef(0);
  const cleanup = useRef(() => {});

  // follow external changes, but never while the user is holding a card
  useEffect(() => {
    if (!drag.current && !press.current) setItems(projects);
  }, [projects]);

  /* ---- layout helpers ---- */
  const takeSnapshot = (skipId) => {
    const s = {};
    for (const id in slots.current) {
      const el = slots.current[id];
      if (el && id !== skipId) s[id] = el.getBoundingClientRect();
    }
    snap.current = s;
  };

  const place = () => {
    const d = drag.current;
    if (!d) return;
    const card = cards.current[d.id],
      slot = slots.current[d.id];
    if (!card || !slot) return;
    const r = slot.getBoundingClientRect();
    card.style.transform = `translate(${d.px - d.ox - r.left}px, ${d.py - d.oy - r.top}px) scale(1.04) rotate(-1.2deg)`;
  };

  useLayoutEffect(() => {
    const s = snap.current;
    if (s) {
      snap.current = null;
      for (const id in slots.current) {
        const el = slots.current[id],
          old = s[id];
        if (!el || !old) continue;
        const now = el.getBoundingClientRect();
        const dx = old.left - now.left,
          dy = old.top - now.top;
        if (!dx && !dy) continue;
        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            el.style.transition = 'transform var(--dur-base, 320ms) var(--ease-out, ease)';
            el.style.transform = '';
          })
        );
      }
    }
    place();
  }, [items]);

  const say = (list, id) => {
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) setAnnounce(`${list[i].title} moved to position ${i + 1} of ${list.length}`);
  };

  /** Reorder in local state (animated). Returns the new list or null. */
  const moveTo = (id, to, keepDragged) => {
    const next = reorder(itemsRef.current, id, to);
    if (!next) return null;
    takeSnapshot(keepDragged ? id : null);
    itemsRef.current = next; // later calls in the same gesture must see the new order
    setItems(next);
    return next;
  };
  const commit = (next, id) => {
    if (next) {
      onChange?.(next);
      if (id) say(next, id);
    }
  };

  /* ---- drag lifecycle ---- */
  const begin = (st) => {
    const slot = slots.current[st.id];
    if (!slot) return;
    const r = slot.getBoundingClientRect();
    drag.current = { id: st.id, px: st.x, py: st.y, ox: st.x - r.left, oy: st.y - r.top, lastSwap: 0, startItems: itemsRef.current };
    press.current = null;
    setLiftId(st.id);
    document.body.classList.add('is-sorting');
    navigator.vibrate?.(12);
    const t = itemsRef.current.find((x) => x.id === st.id);
    if (t) setAnnounce(`${t.title} picked up`);
    place();
    const tick = () => {
      const d = drag.current;
      if (!d) return;
      const dy = d.py < EDGE ? -14 : d.py > innerHeight - EDGE ? 14 : 0;
      if (dy) {
        scrollBy(0, dy);
        place();
        hit(performance.now());
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  /* swap when the pointer is inside the middle of another card (not its edge), so a
     card that changes size after the swap can't make the pair flip back and forth */
  const hit = (now) => {
    const d = drag.current;
    if (!d) return;
    if (now - d.lastSwap < 220) return;
    const cur = itemsRef.current;
    for (let i = 0; i < cur.length; i++) {
      if (cur[i].id === d.id) continue;
      const r = slots.current[cur[i].id]?.getBoundingClientRect();
      if (!r) continue;
      const ix = r.width * INSET,
        iy = r.height * INSET;
      if (d.px >= r.left + ix && d.px <= r.right - ix && d.py >= r.top + iy && d.py <= r.bottom - iy) {
        if (moveTo(d.id, i, true)) d.lastSwap = now;
        return;
      }
    }
  };

  const finish = (save) => {
    const d = drag.current;
    clearTimeout(press.current?.timer);
    press.current = null;
    if (!d) return;
    cancelAnimationFrame(raf.current);
    const card = cards.current[d.id];
    if (card) {
      card.style.transition = 'transform var(--dur-base, 320ms) var(--ease-spring, ease)';
      card.style.transform = '';
      setTimeout(() => {
        card.style.transition = '';
      }, 360);
    }
    drag.current = null;
    setLiftId(null);
    document.body.classList.remove('is-sorting');
    justDragged.current = true;
    setTimeout(() => {
      justDragged.current = false;
    }, 350);
    if (save) commit(itemsRef.current, d.id);
    else {
      takeSnapshot(null);
      setItems(d.startItems);
      setAnnounce('Move cancelled');
    } // browser took the gesture: undo
  };

  const onPointerDown = (e, id) => {
    if (e.button > 0 || drag.current) return;
    if (e.target.closest('.fh-tile__star, .fh-tile__grip')) return;
    const st = { id, x: e.clientX, y: e.clientY, type: e.pointerType, timer: 0 };
    press.current = st;
    if (e.pointerType !== 'mouse')
      st.timer = setTimeout(() => {
        if (press.current === st) begin(st);
      }, HOLD_MS);

    const move = (ev) => {
      const d = drag.current;
      if (d) {
        d.px = ev.clientX;
        d.py = ev.clientY;
        place();
        hit(ev.timeStamp);
        return;
      }
      const p = press.current;
      if (!p) return;
      const dist = Math.hypot(ev.clientX - p.x, ev.clientY - p.y);
      if (p.type === 'mouse') {
        if (dist > MOUSE_SLOP) begin({ ...p, x: ev.clientX, y: ev.clientY });
      } else if (dist > SLOP) {
        clearTimeout(p.timer);
        press.current = null;
      } // user is scrolling
    };
    const up = () => {
      finish(true);
      stop();
    };
    const cancel = () => {
      finish(false);
      stop();
    };
    const touchMove = (ev) => {
      if (drag.current) ev.preventDefault();
    }; // keep the page still while dragging
    const stop = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', cancel);
      removeEventListener('touchmove', touchMove);
      cleanup.current = () => {};
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', cancel);
    addEventListener('touchmove', touchMove, { passive: false });
    cleanup.current = () => {
      clearTimeout(st.timer);
      cancelAnimationFrame(raf.current);
      document.body.classList.remove('is-sorting');
      stop();
    };
  };

  useEffect(() => () => cleanup.current(), []);

  const keyMove = (id, delta) => {
    const i = itemsRef.current.findIndex((x) => x.id === id);
    commit(moveTo(id, i + delta, false), id);
  };

  return (
    <>
      <div
        className="fh-board sb-board"
        role="list"
        onClickCapture={(e) => {
          if (justDragged.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onContextMenu={(e) => {
          if (press.current || drag.current) e.preventDefault();
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {items.map((it, i) => (
          <div
            key={it.id}
            role="listitem"
            ref={(el) => {
              slots.current[it.id] = el;
            }}
            className={'fh-slot sb-slot' + (i === 0 ? ' fh-slot--featured' : '') + (liftId === it.id ? ' is-lifted' : '')}
            onPointerDown={readOnly ? undefined : (e) => onPointerDown(e, it.id)}
          >
            <div
              className="sb-card"
              ref={(el) => {
                cards.current[it.id] = el;
              }}
            >
              <F.ProjectTile
                title={it.title}
                description={it.description}
                href={it.href}
                status={it.status}
                tags={it.tags}
                tone={it.tone}
                featured={i === 0}
                index={i}
                grip={!readOnly}
                openLabel="Open"
                onMakeMain={readOnly ? undefined : () => commit(moveTo(it.id, 0, false), it.id)}
                onGripKey={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    keyMove(it.id, 1);
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    keyMove(it.id, -1);
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {announce}
      </div>
    </>
  );
}
