import { F } from '../forest.js';
import { useAuth } from '../auth.jsx';

export default function Nav({ page }) {
  const { user, signOut } = useAuth();
  return (
    <div className="hub-nav">
      <F.NavBar
        brand="Muki"
        brandAccent="Hub"
        brandHref="/"
        links={[
          { label: 'My sites', href: '/', active: page === 'home' },
          { label: 'Manage', href: '/manage', active: page === 'manage' }
        ]}
        user={{ name: user.name }}
        onSignOut={signOut}
        signOutLabel="Sign out"
      />
    </div>
  );
}
