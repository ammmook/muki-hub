import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // easeInOutCubic

/* Own scroll animation (same easing in every browser; native smooth scrolling is
   inconsistent). Any wheel / touch / key press by the user cancels it. */
let raf = 0;
function animateTo(top) {
  cancelAnimationFrame(raf);
  const from = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  const to = Math.max(0, Math.min(top, max));
  const dist = to - from;
  if (reduced() || Math.abs(dist) < 2) return scrollTo(0, to);
  const dur = Math.min(1100, 450 + Math.abs(dist) * 0.25);
  const t0 = performance.now();
  const stop = () => {
    cancelAnimationFrame(raf);
    removeEventListener('wheel', stop);
    removeEventListener('touchstart', stop);
    removeEventListener('keydown', stop);
  };
  addEventListener('wheel', stop, { passive: true });
  addEventListener('touchstart', stop, { passive: true });
  addEventListener('keydown', stop);
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    scrollTo(0, from + dist * ease(t));
    if (t < 1) raf = requestAnimationFrame(step);
    else stop();
  };
  raf = requestAnimationFrame(step);
}

/* keep the target clear of the fixed nav */
const navOffset = () => {
  const nav = document.querySelector('.hub-nav');
  return (nav ? nav.getBoundingClientRect().bottom : 0) + 16;
};

/* Scroll to a #section (or to the top when there is no hash). */
function scrollToHash(hash) {
  const el = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (el) {
    animateTo(el.getBoundingClientRect().top + scrollY - navOffset());
    el.focus?.({ preventScroll: true });
  } else if (!hash) animateTo(0);
}

/* The design-system NavBar and Footer render plain <a href="/...">. Catch clicks
   on internal links anywhere in the app and route them client-side. Links to a
   #section on the page you are already on scroll smoothly instead of jumping. */
export default function InternalLinks() {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  // arriving from another page (e.g. Manage -> /#all-sites): scroll once it has rendered
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => scrollToHash(hash), 60);
    return () => clearTimeout(t);
  }, [pathname, hash]);

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      // same-origin paths only: "/manage" yes, "//other.site" and "https://…" no
      if (!/^\/(?!\/)/.test(href) || a.origin !== window.location.origin) return;
      e.preventDefault();
      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        // same page: animate, and keep the hash in the address bar / nav highlight
        navigate(url.pathname + url.search + url.hash, { replace: true });
        scrollToHash(url.hash);
      } else navigate(href);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);
  return null;
}
