import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { F } from '../forest.js';
import { useAuth } from '../auth.jsx';
import { useProjects } from '../store.js';

export default function Nav({ page }) {
  const { user, signOut } = useAuth();
  const { hash } = useLocation();
  const list = useProjects();
  const onHome = page === 'home';
  // "Most used" only exists on Home once there are 3+ sites (see Home.jsx)
  const links = [
    { label: 'Home', href: '/', active: onHome && !hash },
    ...(list.length >= 3 ? [{ label: 'Most used', href: '/#most-used', active: onHome && hash === '#most-used' }] : []),
    ...(list.length >= 1 ? [{ label: 'All sites', href: '/#all-sites', active: onHome && hash === '#all-sites' }] : []),
    ...(user.isOwner ? [{ label: 'Manage', href: '/manage', active: page === 'manage' }] : [])
  ];
  // Portaled to <body>: the forest scenes are isolated stacking contexts, so a nav left
  // inside one would be painted over by the sections that follow it while scrolling.
  return createPortal(
    <div className="hub-nav">
      <F.NavBar brand="Muki" brandAccent="Hub" brandHref="/" links={links} user={{ name: user.name }} onSignOut={signOut} signOutLabel="Sign out" />
    </div>,
    document.body
  );
}
