import { useState } from 'react';
import { F } from '../forest.js';
import Modal from './Modal.jsx';
import { normalizeUrl } from '../store.js';

const STATUSES = [
  ['live', 'Live'],
  ['wip', 'Building'],
  ['paused', 'Paused']
];
const TONES = ['moss', 'lime', 'night', 'earth'];
const MAX = { title: 60, url: 200, description: 140, tags: 80 };
const MAX_TAGS = 4;
const SCHEME = /^(https?):\/\//i;

const parseTags = (s) =>
  s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

/* Add (no `item`) or edit (with `item`). Calls onSave with clean project data.
   The scheme (http/https) is kept separately so editing an http:// site doesn't upgrade it. */
export default function ProjectDialog({ item, onClose, onSave }) {
  const [v, setV] = useState(() =>
    item
      ? {
          title: item.title,
          scheme: /^http:\/\//i.test(item.href) ? 'http' : 'https',
          url: item.href.replace(SCHEME, ''),
          status: item.status || 'live',
          tone: item.tone || 'moss',
          tags: (item.tags || []).join(', '),
          description: item.description || ''
        }
      : { title: '', scheme: 'https', url: '', status: 'live', tone: 'moss', tags: '', description: '' }
  );
  const [tried, setTried] = useState(false);

  const set = (k) => (e) => {
    const raw = e?.target ? e.target.value : e;
    setV((s) => {
      if (k === 'url') {
        // pasting a full link switches the prefix instead of doubling it
        const m = raw.match(SCHEME);
        return { ...s, scheme: m ? m[1].toLowerCase() : s.scheme, url: raw.replace(SCHEME, '').slice(0, MAX.url) };
      }
      return { ...s, [k]: MAX[k] ? raw.slice(0, MAX[k]) : raw };
    });
  };

  const href = normalizeUrl(v.scheme + '://' + v.url);
  const errTitle = v.title.trim() ? undefined : 'Enter a site name';
  const errUrl = href && v.url.trim() ? undefined : 'Enter a full domain, like example.com';
  const errTags = parseTags(v.tags).length > MAX_TAGS ? `Use up to ${MAX_TAGS} tags` : undefined;

  const save = () => {
    setTried(true);
    if (errTitle || errUrl || errTags) return;
    onSave({ title: v.title.trim(), href, status: v.status, tone: v.tone, description: v.description.trim(), tags: parseTags(v.tags) });
  };

  return (
    <Modal
      title={item ? 'Edit site' : 'Add a site'}
      onClose={onClose}
      onSubmit={save}
      footer={[
        <F.Button key="c" variant="link" arrow={false} onClick={onClose}>
          Cancel
        </F.Button>,
        <F.Button key="s" type="submit" arrow={false}>
          {item ? 'Save changes' : 'Add to hub'}
        </F.Button>
      ]}
    >
      <F.TextField
        label="Site name"
        placeholder="e.g. Garden shop landing"
        value={v.title}
        onChange={set('title')}
        error={tried ? errTitle : undefined}
      />
      <F.TextField
        label="Link"
        prefix={v.scheme + '://'}
        value={v.url}
        onChange={set('url')}
        hint="Opens in a new tab when you select the card"
        error={tried ? errUrl : undefined}
      />
      <F.TextField label="Short note" placeholder="What this site is for" value={v.description} onChange={set('description')} />
      <F.TextField
        label="Tags"
        placeholder="Landing, Blog"
        value={v.tags}
        onChange={set('tags')}
        hint={`Separate with commas, up to ${MAX_TAGS}`}
        error={errTags}
      />
      <div>
        <p className="fld-label">Status</p>
        <F.Segmented
          label="Status"
          value={v.status}
          onChange={set('status')}
          options={STATUSES.map(([value, label]) => ({ value, label, status: value }))}
        />
      </div>
      <div>
        <p className="fld-label">Card tone</p>
        <F.Segmented label="Tone" value={v.tone} onChange={set('tone')} options={TONES.map((k) => ({ value: k, label: k, tone: k }))} />
      </div>
    </Modal>
  );
}
