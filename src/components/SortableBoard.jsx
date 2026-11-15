import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { F } from '../forest.js';

/* Drag-to-reorder board that works with mouse, touch and pen (pointer events).
   - Mouse: press and move a few pixels to lift a card.
   - Touch / pen: press and hold ~0.25s, then drag. Moving before that scrolls the page.
   - Keyboard: arrow keys on the grip button, or the star to make a card main.
   Other cards slide into place (FLIP); the order is saved once, on drop. */

const HOLD_MS = 250, SLOP = 8, MOUSE_SLOP = 5, EDGE = 90;

export default function SortableBoard({ projects, onChange }) {
  const [items, setItems] = useState(projects);
  const [liftId, setLiftId] = useState(null);
  const itemsRef = useRef(items); itemsRef.current = items;
  const slots = useRef({}), cards = useRef({});
  const snap = useRef(null);
  const press = useRef(null);   // finger/mouse is down, drag not started yet
  const drag = useRef(null);    // drag in progress
  const justDragged = useRef(false);
  const raf = useRef(0);
  const cleanup = useRef(() => {});

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
    const d = drag.current; if (!d) return;
    const card = cards.current[d.id], slot = slots.current[d.id];
    if (!card || !slot) return;
    const r = slot.getBoundingClientRect();
    card.style.transform = `translate(${d.px - d.ox - r.left}px, ${d.py - d.oy - r.top}px) scale(1.04) rotate(-1.2deg)`;
  };

  useLayoutEffect(() => {
    const s = snap.current;
    if (s) {
      snap.current = null;
      for (const id in slots.current) {
        const el = slots.current[id], old = s[id];
        if (!el || !old) continue;
        const now = el.getBoundingClientRect();
        const dx = old.left - now.left, dy = old.top - now.top;
        if (!dx && !dy) continue;
        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.transition = 'transform var(--dur-base, 320ms) var(--ease-out, ease)';
          el.style.transform = '';
        }));
      }
    }
    place();
  }, [items]);

  const moveTo = (id, to, keepDragged) => {
    const cur = itemsRef.current, from = cur.findIndex((x) => x.id === id);
    if (from < 0 || to < 0 || to >= cur.length || from === to) return false;
    takeSnapshot(keepDragged ? id : null);
    const next = cur.slice(); next.splice(to, 0, next.splice(from, 1)[0]);
    setItems(next);
    return next;
  };
  const commit = (next) => { if (next) onChange?.(next); };

  /* ---- drag lifecycle ---- */
  const begin = (st) => {
    const slot = slots.current[st.id]; if (!slot) return;
    const r = slot.getBoundingClientRect();
    drag.current = { id: st.id, px: st.x, py: st.y, ox: st.x - r.left, oy: st.y - r.top, lastSwap: 0 };
    press.current = null;
    setLiftId(st.id);
    document.body.classList.add('is-sorting');
    navigator.vibrate?.(12);
    place();
    const tick = () => {
      const d = drag.current; if (!d) return;
      const dy = d.py < EDGE ? -14 : d.py > innerHeight - EDGE ? 14 : 0;
      if (dy) { scrollBy(0, dy); place(); hit(); }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const hit = () => {
    const d = drag.current; if (!d) return;
    const now = performance.now();
    if (now - d.lastSwap < 220) return;
    const cur = itemsRef.current;
    for (let i = 0; i < cur.length; i++) {
      if (cur[i].id === d.id) continue;
      const r = slots.current[cur[i].id]?.getBoundingClientRect(); if (!r) continue;
      if (d.px >= r.left && d.px <= r.right && d.py >= r.top && d.py <= r.bottom) {
        if (moveTo(d.id, i, true)) d.lastSwap = now;
        return;
      }
    }
  };

  const finish = () => {
    const d = drag.current;
    clearTimeout(press.current?.timer); press.current = null;
    if (!d) return;
    cancelAnimationFrame(raf.current);
    const card = cards.current[d.id];
    if (card) {
      card.style.transition = 'transform var(--dur-base, 320ms) var(--ease-spring, ease)';
      card.style.transform = '';
      setTimeout(() => { if (card) card.style.transition = ''; }, 360);
    }
    drag.current = null;
    setLiftId(null);
    document.body.classList.remove('is-sorting');
    justDragged.current = true; setTimeout(() => { justDragged.current = false; }, 350);
    commit(itemsRef.current);
  };

  const onPointerDown = (e, id) => {
    if (e.button > 0 || drag.current) return;
    if (e.target.closest('.fh-tile__star, .fh-tile__grip')) return;
    const st = { id, x: e.clientX, y: e.clientY, type: e.pointerType, timer: 0 };
    press.current = st;
    if (e.pointerType !== 'mouse') st.timer = setTimeout(() => { if (press.current === st) begin(st); }, HOLD_MS);

    const move = (ev) => {
      const d = drag.current;
      if (d) { d.px = ev.clientX; d.py = ev.clientY; place(); hit(); return; }
      const p = press.current; if (!p) return;
      const dist = Math.hypot(ev.clientX - p.x, ev.clientY - p.y);
      if (p.type === 'mouse') { if (dist > MOUSE_SLOP) begin({ ...p, x: ev.clientX, y: ev.clientY }); }
      else if (dist > SLOP) { clearTimeout(p.timer); press.current = null; } // user is scrolling
    };
    const up = () => { finish(); stop(); };
    const touchMove = (ev) => { if (drag.current) ev.preventDefault(); }; // keep the page still while dragging
    const stop = () => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up); removeEventListener('touchmove', touchMove);
      cleanup.current = () => {};
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
    addEventListener('pointercancel', up); addEventListener('touchmove', touchMove, { passive: false });
    cleanup.current = () => { clearTimeout(st.timer); cancelAnimationFrame(raf.current); document.body.classList.remove('is-sorting'); stop(); };
  };

  useEffect(() => () => cleanup.current(), []);

  const keyMove = (id, delta) => {
    const i = itemsRef.current.findIndex((x) => x.id === id);
    commit(moveTo(id, i + delta, false));
  };

  return (
    <div className="fh-board sb-board" role="list"
      onClickCapture={(e) => { if (justDragged.current) { e.preventDefault(); e.stopPropagation(); } }}
      onContextMenu={(e) => { if (press.current || drag.current) e.preventDefault(); }}
      onDragStart={(e) => e.preventDefault()}>
      {items.map((it, i) => (
        <div key={it.id} role="listitem"
          ref={(el) => { slots.current[it.id] = el; }}
          className={'fh-slot sb-slot' + (i === 0 ? ' fh-slot--featured' : '') + (liftId === it.id ? ' is-lifted' : '')}
          onPointerDown={(e) => onPointerDown(e, it.id)}>
          <div className="sb-card" ref={(el) => { cards.current[it.id] = el; }}>
            <F.ProjectTile
              title={it.title} description={it.description} href={it.href} status={it.status} tags={it.tags} tone={it.tone}
              featured={i === 0} index={i} grip openLabel="Open"
              onMakeMain={() => commit(moveTo(it.id, 0, false))}
              onGripKey={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); keyMove(it.id, 1); }
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); keyMove(it.id, -1); }
              }} />
          </div>
        </div>
      ))}
    </div>
  );
}
