import { useState } from 'react';
import { F } from '../forest.js';
import Modal from './Modal.jsx';
import { normalizeUrl } from '../store.js';

const STATUSES = [['live', 'Live'], ['wip', 'Building'], ['paused', 'Paused']];
const TONES = ['moss', 'lime', 'night', 'earth'];

/* Add (no `item`) or edit (with `item`). Calls onSave with clean project data. */
export default function ProjectDialog({ item, onClose, onSave }) {
  const [v, setV] = useState(() => item
    ? { title: item.title, url: item.href.replace(/^https?:\/\//, ''), status: item.status || 'live', tone: item.tone || 'moss', tags: (item.tags || []).join(', '), description: item.description || '' }
    : { title: '', url: '', status: 'live', tone: 'moss', tags: '', description: '' });
  const [tried, setTried] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));
  const href = normalizeUrl(v.url);
  const errTitle = v.title.trim() ? undefined : 'Enter a site name';
  const errUrl = href ? undefined : 'Enter a full domain, like example.com';

  const save = () => {
    setTried(true);
    if (errTitle || errUrl) return;
    onSave({
      title: v.title.trim(), href, status: v.status, tone: v.tone, description: v.description.trim(),
      tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 4)
    });
  };

  return (
    <Modal title={item ? 'Edit site' : 'Add a site'} onClose={onClose}
      footer={[
        <F.Button key="c" variant="link" arrow={false} onClick={onClose}>Cancel</F.Button>,
        <F.Button key="s" arrow={false} onClick={save}>{item ? 'Save changes' : 'Add to hub'}</F.Button>
      ]}>
      <F.TextField label="Site name" placeholder="e.g. Garden shop landing" value={v.title} onChange={set('title')} error={tried ? errTitle : undefined} />
      <F.TextField label="Link" prefix="https://" value={v.url} onChange={set('url')} hint="Opens in a new tab when you select the card" error={tried ? errUrl : undefined} />
      <F.TextField label="Short note" placeholder="What this site is for" value={v.description} onChange={set('description')} />
      <F.TextField label="Tags" placeholder="Landing, Blog" value={v.tags} onChange={set('tags')} hint="Separate with commas, up to 4" />
      <div>
        <p className="fld-label">Status</p>
        <F.Segmented label="Status" value={v.status} onChange={set('status')} options={STATUSES.map(([value, label]) => ({ value, label, status: value }))} />
      </div>
      <div>
        <p className="fld-label">Card tone</p>
        <F.Segmented label="Tone" value={v.tone} onChange={set('tone')} options={TONES.map((k) => ({ value: k, label: k, tone: k }))} />
      </div>
    </Modal>
  );
}
