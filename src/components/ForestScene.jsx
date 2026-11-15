import { useEffect, useRef } from 'react';
import leafUrl from '../assets/3-leaft.png';
import bgUrl from '../assets/bg-forest.png';

/* Forest photo (slightly blurred) + a canvas of leaves drifting down.
   Drop-in replacement for ShaderFog: <ForestScene className="hero">…</ForestScene>

   Leaf motion is a simple flutter model, not a straight fall:
   - horizontal speed = slow shared wind + a side-to-side swing (sinusoid)
   - fall speed peaks mid-swing (glide) and eases at each turn (leaf catches air)
   - the leaf tilts toward its sideways motion and slowly tumbles about its long axis */

// Crop windows (x, y, w, h) of the three leaves inside 3-leaft.png (1536x1024).
const CROPS = [[550, 50, 550, 385], [285, 450, 425, 405], [960, 540, 425, 330]];
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Cut each leaf out of its black background: alpha follows brightness, so the
   black disappears and the leaf keeps its own colour. */
function buildSprites(img) {
  return CROPS.map(([sx, sy, sw, sh]) => {
    const W = 180, H = Math.round((W * sh) / sw);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const m = Math.max(p[i], p[i + 1], p[i + 2]) / 255;
      p[i + 3] = clamp((m - 0.16) / 0.24, 0, 1) * 255;
    }
    x.putImageData(d, 0, 0);
    return c;
  });
}

function makeLeaf(sprites, w, h, scatter) {
  const depth = rand(0.45, 1); // 1 = near: bigger, faster, more opaque
  const width = 30 + 56 * depth;
  const spr = Math.floor(Math.random() * sprites.length);
  return {
    spr, width, depth,
    height: (width * sprites[spr].height) / sprites[spr].width,
    x: rand(-0.1, 1.1) * w,
    y: scatter ? rand(-0.1, 1) * h : -width - rand(0, h * 0.3),
    phase: rand(0, Math.PI * 2), omega: rand(1.0, 1.9),   // swing
    amp: rand(14, 34) * depth,                            // swing width in px
    fall: rand(46, 74) * (0.55 + 0.45 * depth),           // px/s average
    angle: rand(0, Math.PI * 2), spin: rand(-0.25, 0.25),
    flip: rand(0, Math.PI * 2), flipOmega: rand(0.5, 1.3),
    alpha: 0.55 + 0.4 * depth
  };
}

function step(l, dt, wind) {
  l.phase += l.omega * dt;
  l.flip += l.flipOmega * dt;
  l.angle += l.spin * dt;
  const swing = l.amp * l.omega * Math.cos(l.phase);       // sideways speed
  const vx = wind * l.depth + swing;
  const vy = l.fall * (1 + 0.45 * Math.cos(2 * l.phase));  // fastest mid-glide
  l.x += vx * dt; l.y += vy * dt;
  l.vx = vx;
}

export default function ForestScene({ className = '', style, children, blur = 2, density = 1 }) {
  const root = useRef(null), cv = useRef(null);

  useEffect(() => {
    const el = root.current, canvas = cv.current; if (!el || !canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let sprites = null, leaves = [], raf = 0, last = 0, t = 0, w = 0, h = 0, visible = true, dead = false;

    const resize = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (sprites) {
        const n = Math.round(clamp(w / 90, 7, 18) * density);
        while (leaves.length < n) leaves.push(makeLeaf(sprites, w, h, true));
        leaves.length = n;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const l of leaves) {
        const tilt = clamp((l.vx || 0) / 90, -1, 1) * 0.7;
        const flipX = Math.max(0.3, Math.abs(Math.cos(l.flip)));
        ctx.save();
        ctx.globalAlpha = l.alpha;
        ctx.translate(l.x, l.y);
        ctx.rotate(l.angle * 0.35 + tilt);
        ctx.scale(flipX, 1);
        ctx.drawImage(sprites[l.spr], -l.width / 2, -l.height / 2, l.width, l.height);
        ctx.restore();
      }
    };

    const frame = (now) => {
      raf = 0; if (dead || !visible) return;
      const dt = Math.min((now - (last || now)) / 1000, 0.05); last = now; t += dt;
      const wind = 10 + 12 * Math.sin(t * 0.11) + 8 * Math.sin(t * 0.27 + 1); // slow gusts
      for (const l of leaves) {
        step(l, dt, wind);
        if (l.y - l.height > h || l.x < -120 || l.x > w + 120) Object.assign(l, makeLeaf(sprites, w, h, false));
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && !reduce && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };

    const img = new Image();
    img.onload = () => {
      if (dead) return;
      sprites = buildSprites(img); resize(); draw(); start();
    };
    img.src = leafUrl;

    const ro = new ResizeObserver(() => { resize(); if (sprites && (reduce || !raf)) draw(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0 });
    io.observe(el);
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) || (raf = 0) : start());
    document.addEventListener('visibilitychange', onVis);

    return () => { dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, [density]);

  return (
    <div ref={root} className={'forest-scene ' + className} style={style}>
      <div className="forest-scene__bg" style={{ backgroundImage: `url(${bgUrl})`, filter: `blur(${blur}px)` }} aria-hidden="true" />
      <div className="forest-scene__veil" aria-hidden="true" />
      <canvas ref={cv} className="forest-scene__leaves" aria-hidden="true" />
      <div className="forest-scene__content">{children}</div>
    </div>
  );
}
