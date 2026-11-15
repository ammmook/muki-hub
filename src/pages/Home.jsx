import { F } from '../forest.js';
import ForestScene from '../components/ForestScene.jsx';
import SortableBoard from '../components/SortableBoard.jsx';
import Nav from '../components/Nav.jsx';
import { TAGLINE } from '../brand.js';
import { useProjects, saveProjects } from '../store.js';

function Empty() {
  return (
    <ForestScene className="empty-stage">
      <div className="empty">
        <span className="gh g1" aria-hidden="true" />
        <span className="gh g2" aria-hidden="true" />
        <span className="gh g3" aria-hidden="true" />
        <F.Logo />
        <h1>
          No sites in the <em>forest</em> yet
        </h1>
        <p>Add your first site. It shows up as a card you can drag to reorder.</p>
        <F.Button href="/manage?add=1" external={false}>
          Add your first site
        </F.Button>
      </div>
    </ForestScene>
  );
}

export default function Home() {
  const list = useProjects();
  const main = list[0];
  const count = (s) => list.filter((x) => (x.status || 'live') === s).length;
  const live = count('live'),
    wip = count('wip'),
    paused = count('paused');

  const footer = (
    <div style={{ paddingTop: 48 }}>
      <F.Footer
        note={TAGLINE}
        marquee="Every site Muki grew, in one place"
        word={['Muki', 'Hub']}
        columns={[
          {
            title: 'Hub',
            links: [
              { label: 'My sites', href: '/' },
              { label: 'Add a site', href: '/manage?add=1' }
            ]
          },
          { title: 'Account', links: [{ label: 'Manage', href: '/manage' }] }
        ]}
      />
    </div>
  );

  if (!main)
    return (
      <>
        <Nav page="home" />
        <Empty />
        {footer}
      </>
    );

  return (
    <div className="pg">
      <ForestScene className="hero">
        <Nav page="home" />
        <main className="hc">
          <h1>
            Muki <em>Hub</em>
          </h1>
          <p lang="th">{TAGLINE}</p>
          <div className="chips">
            {live > 0 && <F.Chip tone="live">{live} Live</F.Chip>}
            {wip > 0 && <F.Chip tone="wip">{wip} Building</F.Chip>}
            {paused > 0 && <F.Chip tone="paused">{paused} Paused</F.Chip>}
          </div>
          <F.Button href={main.href}>Open {main.title}</F.Button>
        </main>
      </ForestScene>

      {list.length >= 3 && (
        <section className="sec">
          <F.Reveal>
            <h2>
              Most <em>used</em>
            </h2>
            <p className="l">Scroll inside the box to turn through each site.</p>
          </F.Reveal>
          <F.DepthRing projects={list.slice(0, 5)} height={620} length={4}>
            <div className="cap">
              <h2>
                Your sites, in <em>orbit</em>
              </h2>
            </div>
          </F.DepthRing>
        </section>
      )}

      <section className="sec">
        <F.Reveal>
          <h2>
            All <em>sites</em>
          </h2>
          <p className="l">
            <span className="hint-fine">Drag a card to reorder. The first card is your main site.</span>
            <span className="hint-coarse">Press and hold a card, then drag to reorder. The first card is your main site.</span>
          </p>
        </F.Reveal>
        <SortableBoard projects={list} onChange={saveProjects} />
      </section>
      {footer}
    </div>
  );
}
