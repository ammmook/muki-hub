/* @ds-bundle: {"format":4,"namespace":"ForestHub","components":[{"name":"Button"},{"name":"Chip"},{"name":"FogBackdrop"},{"name":"NavBar"},{"name":"ProjectTile"},{"name":"ProjectBoard"},{"name":"ShaderFog"},{"name":"Tilt"},{"name":"Reveal"},{"name":"DepthRing"},{"name":"Footer"},{"name":"TextField"},{"name":"Segmented"},{"name":"Dialog"},{"name":"SignInCard"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(' ');
  }

  function Arrow(p) {
    var s = p.size || 14;
    return h('svg', { width: s, height: s, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
      h('path', { d: 'M4 10 10 4M4.5 4H10v5.5', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  }

  /* ---- Button ---- */
  function Button(p) {
    var variant = p.variant || 'primary';
    var showArrow = p.arrow !== false;
    var Tag = p.href ? 'a' : 'button';
    var props = {
      className: cx('fh-btn', 'fh-btn--' + variant, p.size === 'sm' && 'fh-btn--sm', !showArrow && variant !== 'link' && 'fh-btn--noarrow', p.className),
      style: p.style,
      onClick: p.onClick
    };
    if (p.href) {
      props.href = p.href;
      if (p.external !== false) { props.target = '_blank'; props.rel = 'noopener noreferrer'; }
    } else {
      props.type = p.type || 'button';
      props.disabled = p.disabled;
    }
    if (p.ariaLabel) props['aria-label'] = p.ariaLabel;
    var kids = [h('span', { key: 'l' }, p.children)];
    if (showArrow) kids.push(h('span', { key: 'i', className: 'fh-btn__icon' }, h(Arrow, { size: variant === 'link' ? 12 : 14 })));
    return h(Tag, props, kids);
  }

  /* ---- Chip ---- */
  function Chip(p) {
    var tone = p.tone || 'neutral';
    var hasDot = p.dot !== undefined ? p.dot : (tone === 'live' || tone === 'wip' || tone === 'paused');
    return h('span', { className: cx('fh-chip', 'fh-chip--' + tone, p.glass && 'fh-chip--glass', p.className) },
      hasDot && h('span', { className: 'fh-chip__dot', 'aria-hidden': 'true' }),
      p.children);
  }

  /* ---- FogBackdrop ---- */
  function FogBackdrop(p) {
    return h('div', { className: cx('fh-fog', p.className), style: p.style },
      h('span', { className: 'fh-fog__blob fh-fog__blob--a', 'aria-hidden': 'true' }),
      h('span', { className: 'fh-fog__blob fh-fog__blob--b', 'aria-hidden': 'true' }),
      h('span', { className: 'fh-fog__blob fh-fog__blob--c', 'aria-hidden': 'true' }),
      h('div', { className: 'fh-fog__content' }, p.children));
  }

  /* ---- NavBar ---- */
  function Mark() {
    // two leaves built from quarter circles
    return h('svg', { className: 'fh-nav__mark', viewBox: '0 0 28 28', 'aria-hidden': 'true' },
      h('path', { d: 'M3 15C3 8.4 8.4 3 15 3V13A10 10 0 0 1 5 23H3Z', fill: 'var(--brand)' }),
      h('path', { d: 'M25 13C25 19.6 19.6 25 13 25V15A10 10 0 0 1 23 5H25Z', fill: 'var(--accent)' }));
  }

  function NavBar(p) {
    var links = p.links || [];
    var user = p.user;
    return h('nav', { className: cx('fh-nav', p.className), 'aria-label': 'Main' },
      h('a', { className: 'fh-nav__brand', href: p.brandHref || '#' }, h(Mark), p.brand || 'Forest', ' ', h('em', null, p.brandAccent || 'Hub')),
      h('ul', { className: 'fh-nav__links' }, links.map(function (l) {
        return h('li', { key: l.label }, h('a', { className: 'fh-nav__link', href: l.href || '#', 'aria-current': l.active ? 'page' : undefined }, l.label));
      })),
      user
        ? h('div', { className: 'fh-nav__user' },
            h('span', { className: 'fh-nav__avatar', 'aria-hidden': 'true' }, (user.name || '?').charAt(0).toUpperCase()),
            h('span', null, user.name),
            h(Button, { variant: 'outline', size: 'sm', arrow: false, onClick: p.onSignOut }, p.signOutLabel || 'Sign out'))
        : h(Button, { variant: 'dark', size: 'sm', arrow: false, onClick: p.onSignIn, className: 'fh-nav__signin' },
            h('span', { className: 'fh-nav__g', 'aria-hidden': 'true' }, 'G'), ' ', p.signInLabel || 'Continue with Google'));
  }

  /* ---- ProjectTile ---- */
  function domainOf(href) {
    try { return new URL(href).host.replace(/^www\./, ''); } catch (e) { return href || ''; }
  }
  var STATUS = { live: 'Live', wip: 'Building', paused: 'Paused' };

  function Star() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
      h('path', { d: 'M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6 4.2 13.6l.7-4.3-3.1-3 4.3-.6L8 1.8z', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' }));
  }
  function Grip() {
    return h('svg', { width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': 'true', fill: 'currentColor' },
      [3, 7, 11].map(function (y) { return [4, 10].map(function (x) { return h('circle', { key: x + '-' + y, cx: x, cy: y, r: 1.2 }); }); }));
  }

  function ProjectTile(p) {
    var tone = p.tone || 'moss';
    var status = p.status || 'live';
    return h('article', { className: cx('fh-tile', 'fh-tile--' + tone, p.featured && 'fh-tile--featured', p.className), style: { '--i': p.index || 0 } },
      h('div', { className: 'fh-tile__art', 'aria-hidden': 'true' },
        h('span', { className: 'fh-tile__orb fh-tile__orb--a' }),
        h('span', { className: 'fh-tile__orb fh-tile__orb--b' })),
      h('div', { className: 'fh-tile__top' },
        h(Chip, { tone: status, glass: true }, p.statusLabel || STATUS[status]),
        p.featured && h(Chip, { tone: 'main' }, p.mainLabel || 'Main'),
        p.onMakeMain && !p.featured && h('button', { type: 'button', className: 'fh-tile__star', style: { marginLeft: 'auto' }, onClick: p.onMakeMain, 'aria-label': 'Make main: ' + p.title }, h(Star)),
        p.grip && h('button', { type: 'button', className: 'fh-tile__grip', style: p.onMakeMain && !p.featured ? { marginLeft: 0 } : undefined, onKeyDown: p.onGripKey, 'aria-label': 'Reorder ' + p.title + ' (arrow keys)' }, h(Grip))),
      h('div', { className: 'fh-tile__body' },
        h('p', { className: 'fh-tile__domain' }, p.domain || domainOf(p.href)),
        h('h3', { className: 'fh-tile__title' }, p.title),
        p.description && h('p', { className: 'fh-tile__desc' }, p.description),
        h('div', { className: 'fh-tile__foot' },
          h('div', { className: 'fh-tile__tags' }, (p.tags || []).map(function (t) { return h(Chip, { key: t, glass: true, dot: false }, t); })),
          h(Button, { href: p.href, variant: 'glass', size: 'sm' }, p.openLabel || 'Open'))));
  }

  /* ---- ProjectBoard ---- */
  function ProjectBoard(p) {
    var st = React.useState(p.projects || []);
    var items = st[0], setItems = st[1];
    var dragRef = React.useRef(null);
    var slots = React.useRef({});
    var snap = React.useRef(null);
    var dropSt = React.useState(null);
    var dropped = dropSt[0], setDropped = dropSt[1];
    var dragSt = React.useState(null);
    var dragging = dragSt[0], setDragging = dragSt[1];

    function takeSnapshot() {
      var s = {};
      Object.keys(slots.current).forEach(function (id) { var el = slots.current[id]; if (el) s[id] = el.getBoundingClientRect(); });
      snap.current = s;
    }
    function commit(next) {
      takeSnapshot();
      setItems(next);
      if (p.onChange) p.onChange(next);
    }
    React.useLayoutEffect(function () {
      var s = snap.current; if (!s) return;
      snap.current = null;
      Object.keys(slots.current).forEach(function (id) {
        var el = slots.current[id], old = s[id]; if (!el || !old) return;
        var now = el.getBoundingClientRect();
        var dx = old.left - now.left, dy = old.top - now.top;
        if (!dx && !dy) return;
        el.style.transition = 'none';
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.transition = 'transform var(--dur-base, 320ms) var(--ease-out, ease)';
            el.style.transform = '';
          });
        });
      });
    }, [items]);

    function move(id, toIndex) {
      var from = items.findIndex(function (x) { return x.id === id; });
      if (from < 0 || from === toIndex || toIndex < 0 || toIndex >= items.length) return;
      var next = items.slice(); var it = next.splice(from, 1)[0]; next.splice(toIndex, 0, it);
      commit(next);
    }

    return h('div', { className: cx('fh-board', p.className), role: 'list' }, items.map(function (it, i) {
      var featured = i === 0;
      return h('div', {
        key: it.id, role: 'listitem',
        ref: function (el) { slots.current[it.id] = el; },
        className: cx('fh-slot', featured && 'fh-slot--featured', dragging === it.id && 'is-dragging', dropped === it.id && 'is-dropped'),
        draggable: true,
        onDragStart: function (e) { dragRef.current = it.id; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', it.id); } catch (x) {} setTimeout(function () { setDragging(it.id); }, 0); },
        onDragOver: function (e) { e.preventDefault(); if (dragRef.current && dragRef.current !== it.id) move(dragRef.current, i); },
        onDrop: function (e) { e.preventDefault(); },
        onDragEnd: function () { var id = dragRef.current; dragRef.current = null; setDragging(null); setDropped(id); setTimeout(function () { setDropped(null); }, 450); }
      }, h(ProjectTile, {
        title: it.title, description: it.description, href: it.href, status: it.status, tags: it.tags, tone: it.tone,
        featured: featured, index: i, grip: true,
        onMakeMain: function () { move(it.id, 0); },
        onGripKey: function (e) {
          var k = e.key;
          if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); move(it.id, i + 1); }
          else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); move(it.id, i - 1); }
        }
      }));
    }));
  }


  /* ======== v2: shaders, 3D scroll, forms, footer ======== */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function parseColor(s) {
    s = (s || '').trim(); var m;
    if ((m = /^#([0-9a-f]{6})/i.exec(s))) return [parseInt(m[1].slice(0, 2), 16) / 255, parseInt(m[1].slice(2, 4), 16) / 255, parseInt(m[1].slice(4, 6), 16) / 255];
    if ((m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(s))) return [parseInt(m[1] + m[1], 16) / 255, parseInt(m[2] + m[2], 16) / 255, parseInt(m[3] + m[3], 16) / 255];
    if ((m = /rgba?\(([^)]+)\)/.exec(s))) { var a = m[1].split(/[ ,\/]+/).map(parseFloat); return [a[0] / 255, a[1] / 255, a[2] / 255]; }
    return [0.9, 0.95, 0.85];
  }
  function useInView(ref, threshold) {
    var st = React.useState(false), seen = st[0], setSeen = st[1];
    React.useEffect(function () {
      var el = ref.current; if (!el) return;
      if (reduced() || typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: threshold || 0.15 });
      io.observe(el);
      return function () { io.disconnect(); };
    }, []);
    return seen;
  }

  /* ---- ShaderFog: WebGL domain-warped fog in token colours ---- */
  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform vec3 c4;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}',
    'void main(){',
    'vec2 uv=gl_FragCoord.xy/u_res;vec2 p=uv*vec2(u_res.x/u_res.y,1.)*2.2;float t=u_time*.06;',
    'vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));',
    'vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*1.5),fbm(p+3.*q+vec2(8.3,2.8)-t));',
    'float f=fbm(p+3.*r);',
    'float m=smoothstep(.45,0.,distance(uv,u_mouse))*.3;',
    'vec3 col=mix(c1,c2,clamp(f*1.7,0.,1.));',
    'col=mix(col,c3,clamp(length(q)*.85,0.,1.));',
    'col=mix(col,c4,clamp(r.x*r.x*1.5+m,0.,1.));',
    'gl_FragColor=vec4(col,1.);}'
  ].join('\n');

  function ShaderFog(p) {
    var root = React.useRef(null), cv = React.useRef(null);
    var fb = React.useState(false), failed = fb[0], setFailed = fb[1];
    React.useEffect(function () {
      var canvas = cv.current, el = root.current; if (!canvas || !el) return;
      var gl = null;
      try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (e) {}
      if (!gl) { setFailed(true); return; }
      function mk(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
      var pr = gl.createProgram();
      gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { setFailed(true); return; }
      gl.useProgram(pr);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var U = {}; ['u_res', 'u_time', 'u_mouse', 'c1', 'c2', 'c3', 'c4'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
      var scale = p.quality || 0.5, speed = p.speed || 1, cols = null, colT = -9999, visible = true, raf = 0, t0 = performance.now();
      var mouse = [0.5, 0.5], tm = [0.5, 0.5];
      function readCols() { var cs = getComputedStyle(el); cols = ['--surface-100', '--fog-mist', '--fog-moss', '--fog-lime'].map(function (n) { return parseColor(cs.getPropertyValue(n)); }); }
      function resize() { var w = el.clientWidth, hh = el.clientHeight; canvas.width = Math.max(2, Math.floor(w * scale)); canvas.height = Math.max(2, Math.floor(hh * scale)); gl.viewport(0, 0, canvas.width, canvas.height); }
      function draw(now) {
        if (!cols || now - colT > 1000) { readCols(); colT = now; }
        tm[0] += (mouse[0] - tm[0]) * 0.05; tm[1] += (mouse[1] - tm[1]) * 0.05;
        gl.uniform2f(U.u_res, canvas.width, canvas.height);
        gl.uniform1f(U.u_time, reduced() ? 20 : (now - t0) / 1000 * speed + 20);
        gl.uniform2f(U.u_mouse, tm[0], tm[1]);
        gl.uniform3f(U.c1, cols[0][0], cols[0][1], cols[0][2]); gl.uniform3f(U.c2, cols[1][0], cols[1][1], cols[1][2]);
        gl.uniform3f(U.c3, cols[2][0], cols[2][1], cols[2][2]); gl.uniform3f(U.c4, cols[3][0], cols[3][1], cols[3][2]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      function frame(now) { raf = 0; if (!visible) return; draw(now); if (!reduced()) raf = requestAnimationFrame(frame); }
      function start() { if (!raf) raf = requestAnimationFrame(frame); }
      resize(); start();
      var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(function () { resize(); draw(performance.now()); }) : null; if (ro) ro.observe(el);
      var io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }) : null; if (io) io.observe(el);
      function move(e) { var r = el.getBoundingClientRect(); mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; }
      el.addEventListener('pointermove', move);
      return function () {
        if (raf) cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); el.removeEventListener('pointermove', move);
        var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext();
      };
    }, []);
    return h('div', { ref: root, className: cx('fh-shader', failed && 'fh-shader--fallback', p.className), style: p.style },
      !failed && h('canvas', { ref: cv, className: 'fh-shader__canvas', 'aria-hidden': 'true' }),
      failed && h('span', { className: 'fh-shader__fb', 'aria-hidden': 'true' }),
      h('div', { className: 'fh-shader__veil', 'aria-hidden': 'true' }),
      h('div', { className: 'fh-shader__content' }, p.children));
  }

  /* ---- Tilt: pointer-linked 3D tilt with glare ---- */
  function Tilt(p) {
    var ref = React.useRef(null);
    function move(e) {
      if (reduced()) return; var el = ref.current; if (!el) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5, m = p.max || 8;
      el.style.setProperty('--rx', (-y * m).toFixed(2) + 'deg'); el.style.setProperty('--ry', (x * m).toFixed(2) + 'deg');
      el.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%'); el.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
      el.classList.add('is-on');
    }
    function leave() { var el = ref.current; if (!el) return; el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); el.classList.remove('is-on'); }
    return h('div', { ref: ref, className: cx('fh-tilt', p.className), style: p.style, onPointerMove: move, onPointerLeave: leave },
      h('div', { className: 'fh-tilt__in' }, p.children, h('span', { className: 'fh-tilt__glare', 'aria-hidden': 'true' })));
  }

  /* ---- Reveal: in-view 3D fade-up ---- */
  function Reveal(p) {
    var ref = React.useRef(null); var seen = useInView(ref, p.threshold);
    return h('div', { ref: ref, className: cx('fh-reveal', 'fh-reveal--' + (p.from || 'up'), seen && 'is-in', p.className), style: Object.assign({ '--d': (p.delay || 0) + 'ms' }, p.style) }, p.children);
  }

  /* ---- DepthRing: scroll-linked 3D cylinder of tiles ---- */
  function DepthRing(p) {
    var items = p.projects || [], n = Math.max(items.length, 1);
    var W = p.tileWidth || 260, T = p.tileHeight || 340;
    var rad = Math.round(Math.max(300, W / 2 / Math.tan(Math.PI / Math.max(n, 3)) + 48));
    var box = p.mode !== 'page', len = p.length || 3, turns = p.turns || 1;
    var root = React.useRef(null), track = React.useRef(null), cyl = React.useRef(null), tiles = React.useRef([]), cap = React.useRef(null), bar = React.useRef(null);
    React.useEffect(function () {
      var scroller = box ? root.current : window, cur = 0, target = 0, raf = 0;
      function measure() {
        var tr = track.current; if (!tr) return;
        if (box) { var max = tr.offsetHeight - root.current.clientHeight; target = max > 0 ? clamp(root.current.scrollTop / max, 0, 1) : 0; }
        else { var r = tr.getBoundingClientRect(), mx = tr.offsetHeight - window.innerHeight; target = mx > 0 ? clamp(-r.top / mx, 0, 1) : 0; }
      }
      function apply() {
        var rot = cur * 360 * turns;
        cyl.current.style.transform = 'translateZ(-' + rad + 'px) rotateX(-6deg) rotateY(' + (-rot).toFixed(2) + 'deg)';
        tiles.current.forEach(function (el, i) {
          if (!el) return;
          var a = ((i * 360 / n - rot) % 360 + 360) % 360, c = (Math.cos(a * Math.PI / 180) + 1) / 2;
          el.style.opacity = (0.25 + 0.75 * c).toFixed(3); el.style.filter = 'blur(' + ((1 - c) * 2.5).toFixed(2) + 'px)'; el.style.pointerEvents = c > 0.85 ? 'auto' : 'none';
        });
        if (cap.current) cap.current.style.opacity = String(1 - clamp(cur * 6, 0, 1));
        if (bar.current) bar.current.style.transform = 'scaleX(' + cur.toFixed(3) + ')';
      }
      function tick() { raf = 0; cur += (target - cur) * (reduced() ? 1 : 0.09); if (Math.abs(target - cur) < 0.0005) cur = target; apply(); if (cur !== target) raf = requestAnimationFrame(tick); }
      function onScroll() { measure(); if (!raf) raf = requestAnimationFrame(tick); }
      measure(); cur = target; apply();
      scroller.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
      return function () { if (raf) cancelAnimationFrame(raf); scroller.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
    }, [n, rad, turns, box]);
    var step = 360 / n;
    return h('div', { ref: root, className: cx('fh-ring', !box && 'fh-ring--page', p.className), style: box ? { height: p.height || 560 } : undefined },
      h('div', { ref: track, className: 'fh-ring__track', style: { height: box ? (len * 100) + '%' : (len * 100) + 'vh' } },
        h('div', { className: 'fh-ring__stage', style: { height: box ? (100 / len) + '%' : '100vh' } },
          h('div', { className: 'fh-ring__scene' },
            h('div', { ref: cyl, className: 'fh-ring__cyl' }, items.map(function (it, i) {
              return h('div', { key: it.id, ref: function (el) { tiles.current[i] = el; }, className: 'fh-ring__slot',
                style: { width: W, height: T, margin: (-T / 2) + 'px 0 0 ' + (-W / 2) + 'px', transform: 'rotateY(' + (i * step) + 'deg) translateZ(' + rad + 'px)' } },
                h(ProjectTile, { title: it.title, description: it.description, href: it.href, status: it.status, tags: it.tags, tone: it.tone, index: i }));
            }))),
          p.children && h('div', { ref: cap, className: 'fh-ring__caption' }, p.children),
          h('div', { className: 'fh-ring__hint', 'aria-hidden': 'true' }, h('span', { className: 'fh-ring__bar' }, h('i', { ref: bar })), p.hint || 'Scroll')))
    );
  }

  /* ---- Footer: big type, marquee, rising letters ---- */
  function Footer(p) {
    var ref = React.useRef(null); var seen = useInView(ref, 0.2);
    var cols = p.columns || [], word = p.word || ['Forest', 'Hub'];
    var marquee = p.marquee || 'Every site you grew, one clearing away';
    function letters(s, off, em) { return s.split('').map(function (ch, i) { return h('span', { key: i, className: 'fh-footer__ch', style: { '--i': off + i } }, ch === ' ' ? ' ' : ch); }); }
    var unit = []; for (var k = 0; k < 4; k++) unit.push(h('span', { key: k, className: 'fh-footer__m' }, marquee, h('i', { 'aria-hidden': 'true' })));
    return h('footer', { ref: ref, className: cx('fh-footer', seen && 'is-in', p.className) },
      h('div', { className: 'fh-marquee', 'aria-hidden': 'true' }, h('div', { className: 'fh-marquee__track' }, unit, unit)),
      h('div', { className: 'fh-footer__cols' },
        h('p', { className: 'fh-footer__note' }, p.note || ''),
        cols.map(function (c) {
          return h('div', { key: c.title, className: 'fh-footer__col' }, h('h4', null, c.title),
            h('ul', null, c.links.map(function (l) { return h('li', { key: l.label }, h('a', { href: l.href || '#' }, l.label)); })));
        })),
      h('div', { className: 'fh-footer__word', 'aria-label': word.join(' ') },
        h('span', { className: 'fh-footer__w' }, letters(word[0], 0)), ' ',
        h('span', { className: 'fh-footer__w fh-footer__w--em' }, letters(word[1] || '', word[0].length))));
  }

  /* ---- TextField ---- */
  function TextField(p) {
    var id = React.useId();
    var hasErr = !!p.error;
    return h('div', { className: cx('fh-field', hasErr && 'is-error', p.className) },
      h('label', { htmlFor: id, className: 'fh-field__label' }, p.label),
      h('div', { className: 'fh-field__box' },
        p.prefix && h('span', { className: 'fh-field__prefix' }, p.prefix),
        h('input', { id: id, type: p.type || 'text', value: p.value, defaultValue: p.defaultValue, placeholder: p.placeholder, onChange: p.onChange, 'aria-invalid': hasErr || undefined, 'aria-describedby': (p.hint || hasErr) ? id + '-d' : undefined })),
      (p.hint || hasErr) && h('p', { id: id + '-d', className: 'fh-field__hint' }, hasErr && h('b', { 'aria-hidden': 'true' }, '! '), hasErr ? p.error : p.hint));
  }

  /* ---- Segmented: radio group of pills, optional tone swatches ---- */
  var SWATCH = { moss: 'linear-gradient(135deg,#1f4a2f,#8fba6a)', lime: 'linear-gradient(135deg,#cdee6b,#5f8a3a)', night: 'linear-gradient(135deg,#0c1a12,#3d7a50)', earth: 'linear-gradient(135deg,#7a5230,#c89a68)' };
  function Segmented(p) {
    return h('div', { className: 'fh-seg', role: 'radiogroup', 'aria-label': p.label }, (p.options || []).map(function (o) {
      var on = p.value === o.value;
      return h('button', { key: o.value, type: 'button', role: 'radio', 'aria-checked': on, className: cx('fh-seg__opt', on && 'is-on'), onClick: function () { p.onChange && p.onChange(o.value); } },
        o.tone && h('span', { className: 'fh-seg__sw', style: { background: SWATCH[o.tone] }, 'aria-hidden': 'true' }),
        o.status && h('span', { className: 'fh-chip__dot', style: { background: 'var(--status-' + o.status + ')' }, 'aria-hidden': 'true' }),
        o.label);
    }));
  }

  /* ---- Dialog ---- */
  function Dialog(p) {
    var ref = React.useRef(null);
    React.useEffect(function () { if (p.open && ref.current) ref.current.focus(); }, [p.open]);
    if (!p.open) return null;
    return h('div', { className: cx('fh-dialog', p.contained && 'fh-dialog--contained') },
      h('div', { className: 'fh-dialog__scrim', onClick: p.onClose }),
      h('div', { ref: ref, tabIndex: -1, role: 'dialog', 'aria-modal': 'true', 'aria-label': p.title, className: 'fh-dialog__panel', onKeyDown: function (e) { if (e.key === 'Escape' && p.onClose) p.onClose(); } },
        h('h2', { className: 'fh-dialog__title' }, p.title),
        h('div', { className: 'fh-dialog__body' }, p.children),
        p.footer && h('div', { className: 'fh-dialog__foot' }, p.footer)));
  }

  /* ---- SignInCard ---- */
  function SignInCard(p) {
    return h(Tilt, { className: cx('fh-signin', p.className) },
      h('div', { className: 'fh-signin__card' },
        h(Mark),
        h('h2', { className: 'fh-signin__title' }, p.title || 'ยินดีต้อนรับกลับ'),
        h('p', { className: 'fh-signin__sub' }, p.subtitle || 'เข้าสู่ระบบเพื่อดูเว็บทั้งหมดที่คุณเคยทำ'),
        h(Button, { variant: 'dark', arrow: false, onClick: p.onSignIn, className: 'fh-signin__btn' },
          h('span', { className: 'fh-nav__g', 'aria-hidden': 'true' }, 'G'), p.buttonLabel || 'Continue with Google'),
        h('p', { className: 'fh-signin__note' }, p.note || 'เฉพาะบัญชีเจ้าของเท่านั้น')));
  }

  window.ForestHub = {Logo: Mark, ShaderFog: ShaderFog, Tilt: Tilt, Reveal: Reveal, DepthRing: DepthRing, Footer: Footer, TextField: TextField, Segmented: Segmented, Dialog: Dialog, SignInCard: SignInCard, Button: Button, Chip: Chip, FogBackdrop: FogBackdrop, NavBar: NavBar, ProjectTile: ProjectTile, ProjectBoard: ProjectBoard };
})();
