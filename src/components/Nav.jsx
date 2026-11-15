import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { F } from '../forest.js';
import { useAuth } from '../auth.jsx';
import { useProjects } from '../store.js';

const SECTIONS = ['most-used', 'all-sites']; // ids on Home, top to bottom

/* Which part of Home is on screen: 'home' until a section's top passes just under the nav. */
function currentSection(nav) {
  const probe = (nav?.getBoundingClientRect().bottom || 0) + 40;
  let cur = 'home';
  let last = null;
  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;
    last = id;
    if (el.getBoundingClientRect().top <= probe) cur = id;
  }
  // a short last section can never reach the probe line: treat the page bottom as "there"
  if (last && scrollY + innerHeight >= document.documentElement.scrollHeight - 4) cur = last;
  return cur;
}

export default function Nav({ page }) {
  const { user, signOut } = useAuth();
  const list = useProjects();
  const navRef = useRef(null);
  const pillRef = useRef(null);
  const [section, setSection] = useState('home');
  const onHome = page === 'home';

  // scroll-spy: the highlight follows the section you are reading
  useEffect(() => {
    if (!onHome) return;
    const update = () => setSection(currentSection(navRef.current));
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  }, [onHome, list.length]);

  const active = page === 'manage' ? 'manage' : section;
  // "Most used" only exists on Home once there are 3+ sites (see Home.jsx)
  const links = [
    { key: 'home', label: 'Home', href: '/' },
    ...(list.length >= 3 ? [{ key: 'most-used', label: 'Most used', href: '/#most-used' }] : []),
    ...(list.length >= 1 ? [{ key: 'all-sites', label: 'All sites', href: '/#all-sites' }] : []),
    ...(user.isOwner ? [{ key: 'manage', label: 'Manage', href: '/manage' }] : [])
  ].map((l) => ({ ...l, active: l.key === active }));
  const sig = links.map((l) => l.key).join();

  // one pill that slides to the active link (CSS transitions its position and width)
  useLayoutEffect(() => {
    const ul = navRef.current?.querySelector('.fh-nav__links');
    if (!ul) return;
    if (!pillRef.current) {
      const pill = document.createElement('span');
      pill.className = 'nav-pill';
      pill.setAttribute('aria-hidden', 'true');
      ul.prepend(pill);
      pillRef.current = pill;
    }
    const pill = pillRef.current;
    const place = () => {
      const a = ul.querySelector('[aria-current="page"]');
      if (!a) return void (pill.style.opacity = '0');
      pill.style.opacity = '1';
      pill.style.width = a.offsetWidth + 'px';
      pill.style.height = a.offsetHeight + 'px';
      pill.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop}px)`;
      // narrow screens: the link row scrolls sideways, keep the active link in view
      if (a.offsetLeft < ul.scrollLeft || a.offsetLeft + a.offsetWidth > ul.scrollLeft + ul.clientWidth)
        ul.scrollTo({ left: a.offsetLeft - 8, behavior: 'smooth' });
    };
    place();
    const t = setTimeout(() => pill.classList.add('is-ready'), 60); // no slide-in on first paint
    const ro = new ResizeObserver(place); // fonts loading, window resize
    ro.observe(ul);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [active, sig]);

  // Portaled to <body>: the forest scenes are isolated stacking contexts, so a nav left
  // inside one would be painted over by the sections that follow it while scrolling.
  return createPortal(
    <div className="hub-nav" ref={navRef}>
      <F.NavBar
        brand="Muki"
        brandAccent="Hub"
        brandHref="/"
        links={links}
        user={{ name: user.name }}
        onSignOut={signOut}
        signOutLabel="Sign out"
      />
    </div>,
    document.body
  );
}
