import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { F } from '../forest.js';
import Nav from '../components/Nav.jsx';
import ForestScene from '../components/ForestScene.jsx';
import Modal from '../components/Modal.jsx';
import ProjectDialog from '../components/ProjectDialog.jsx';
import { listProjects, addProject, updateProject, removeProject, makeMain, domainOf } from '../store.js';

const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20C4 10.5 10 4 20 4c0 10-6.5 16-16 16z" fill="currentColor" />
    <path d="M4 20 14 10" stroke="var(--leaf-vein, #E4EADB)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ marginRight: 6 }}>
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const STATUS = { live: 'Live', wip: 'Building', paused: 'Paused' };

function Row({ item, index, onMain, onEdit, onDelete }) {
  const status = item.status || 'live';
  return (
    <li className="row" style={{ '--i': index }}>
      <span className={'row__sw row__sw--' + (item.tone || 'moss')} aria-hidden="true" />
      <div className="row__main">
        <p className="row__title">{item.title}</p>
        <p className="row__domain">{domainOf(item.href)}</p>
      </div>
      <button type="button" className={'row__leaf' + (index === 0 ? ' is-main' : '')} onClick={onMain}
        disabled={index === 0} aria-pressed={index === 0}
        aria-label={index === 0 ? item.title + ' is the main site' : 'Make ' + item.title + ' the main site'}
        title={index === 0 ? 'Main site' : 'Make main'}><LeafIcon /></button>
      <F.Chip tone={status}>{STATUS[status]}</F.Chip>
      <div className="row__actions">
        <F.Button variant="outline" size="sm" arrow={false} onClick={onEdit}>Edit</F.Button>
        <F.Button variant="link" size="sm" arrow={false} className="row__del" onClick={onDelete}>Delete</F.Button>
      </div>
    </li>
  );
}

export default function Manage() {
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState(listProjects);
  // dialog: null | { type: 'new' } | { type: 'edit' | 'del', id }
  const [dlg, setDlg] = useState(() => (params.get('add') ? { type: 'new' } : null));
  const close = () => { setDlg(null); if (params.get('add')) setParams({}, { replace: true }); };
  const target = dlg?.id ? list.find((x) => x.id === dlg.id) : null;

  return (
    <div className="mg">
      <ForestScene className="mg__fog">
        <Nav page="manage" />
        <main className="mg__body">
          <header className="mg__head">
            <div>
              <h1>Manage your <em>sites</em></h1>
              <p>Add, edit or remove sites. To reorder them, drag cards on My sites.</p>
            </div>
            <F.Button arrow={false} className="mg__add" onClick={() => setDlg({ type: 'new' })}><PlusIcon />Add site</F.Button>
          </header>
          {list.length === 0
            ? <div className="mg__empty"><p>No sites yet. Select Add site to paste your first link.</p></div>
            : <ul className="rows">{list.map((it, i) => (
                <Row key={it.id} item={it} index={i}
                  onMain={() => setList(makeMain(it.id))}
                  onEdit={() => setDlg({ type: 'edit', id: it.id })}
                  onDelete={() => setDlg({ type: 'del', id: it.id })} />
              ))}</ul>}
        </main>
      </ForestScene>

      {dlg?.type === 'new' && <ProjectDialog onClose={close} onSave={(d) => { setList(addProject(d)); close(); }} />}
      {dlg?.type === 'edit' && target && <ProjectDialog key={target.id} item={target} onClose={close} onSave={(d) => { setList(updateProject(target.id, d)); close(); }} />}
      {dlg?.type === 'del' && target && (
        <Modal title="Remove this site from the hub?" onClose={close}
          footer={[
            <F.Button key="c" variant="link" arrow={false} onClick={close}>Keep</F.Button>,
            <F.Button key="d" variant="dark" arrow={false} onClick={() => { setList(removeProject(target.id)); close(); }}>Remove site</F.Button>
          ]}>
          <p className="confirm-text">"{target.title}" will be removed from this hub. The real site at {domainOf(target.href)} stays online. This can't be undone.</p>
        </Modal>
      )}
    </div>
  );
}
