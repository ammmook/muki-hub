import './react-global.js';
import './vendor/tokens.css';
import './vendor/bundle.css';
import './vendor/bundle.js';

if (!window.ForestHub) {
  throw new Error('Forest Hub components did not load. Check src/vendor/bundle.js and that react-global.js is imported first.');
}

/* Design-system components (Button, Chip, NavBar, ProjectTile, DepthRing, TextField, ...).
   Prop types: see the design package's index.d.ts. */
export const F = window.ForestHub;
