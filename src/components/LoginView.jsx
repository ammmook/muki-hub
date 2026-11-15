import { F } from '../forest.js';
import ForestScene from './ForestScene.jsx';
import { useAuth, isDemo } from '../auth.jsx';
import { TAGLINE } from '../brand.js';

const Ghost = ({ cls, title, tone, status, i }) => (
  <div className={'deco ' + cls} aria-hidden="true">
    <F.ProjectTile title={title} href="https://example.com" tone={tone} status={status} index={i} />
  </div>
);

export default function LoginView() {
  const { signIn, signInGuest, error } = useAuth();
  return (
    <ForestScene className="login-stage">
      <main className="lp">
        <div className="copy">
          <F.Chip tone="neutral" glass dot={false}>
            Private hub
          </F.Chip>
          <h1>
            Muki <em>Hub</em>
          </h1>
          <p lang="th">{TAGLINE}</p>
        </div>
        <div className="stack">
          <Ghost cls="d1" title="Sample project" tone="moss" status="live" i={1} />
          <Ghost cls="d2" title="Sample project" tone="night" status="wip" i={2} />
          <F.SignInCard
            onSignIn={signIn}
            title="Welcome back"
            subtitle="Sign in to see every site Muki has built."
            buttonLabel={isDemo ? 'Continue with Google (demo)' : 'Continue with Google'}
            note={
              <>
                {isDemo && (
                  <span className="login-demo">Demo mode: set the VITE_FIREBASE_* values in .env.local to use real Google sign-in.</span>
                )}
                <F.Button variant="link" arrow={false} onClick={signInGuest} className="login-guest">
                  Continue as a guest
                </F.Button>
              </>
            }
          />
          {error && (
            <p className="login-err" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
    </ForestScene>
  );
}
