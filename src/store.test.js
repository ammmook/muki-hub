import { beforeEach, describe, expect, it, vi } from 'vitest';

let store;
beforeEach(async () => {
  localStorage.clear();
  vi.resetModules(); // fresh module cache per test
  store = await import('./store.js');
});

const site = (title) => ({ title, href: `https://${title.toLowerCase()}.example.com/`, status: 'live', tone: 'moss', tags: [] });

describe('normalizeUrl', () => {
  it('adds https and keeps a path', () => {
    expect(store.normalizeUrl('example.com/app')).toBe('https://example.com/app');
  });
  it('keeps an explicit http scheme', () => {
    expect(store.normalizeUrl('http://example.com')).toBe('http://example.com/');
  });
  it('rejects empty input, bare words and script URLs', () => {
    expect(store.normalizeUrl('')).toBeNull();
    expect(store.normalizeUrl('   ')).toBeNull();
    expect(store.normalizeUrl('nodots')).toBeNull();
    expect(store.normalizeUrl('javascript:alert(1)')).toBeNull();
  });
  it('allows localhost', () => {
    expect(store.normalizeUrl('localhost:3000')).toBe('https://localhost:3000/');
  });
});

describe('domainOf', () => {
  it('strips www and the path', () => {
    expect(store.domainOf('https://www.example.com/a/b')).toBe('example.com');
  });
  it('returns the input when it is not a URL', () => {
    expect(store.domainOf('not a url')).toBe('not a url');
  });
});

describe('projects', () => {
  it('adds, updates and removes', () => {
    store.addProject(site('A'));
    const [a] = store.listProjects();
    expect(a.id).toBeTruthy();
    store.updateProject(a.id, { title: 'A2' });
    expect(store.listProjects()[0].title).toBe('A2');
    store.removeProject(a.id);
    expect(store.listProjects()).toEqual([]);
  });

  it('makeMain moves a site to the front', () => {
    store.addProject(site('A'));
    store.addProject(site('B'));
    store.addProject(site('C'));
    const c = store.listProjects()[2];
    store.makeMain(c.id);
    expect(store.listProjects().map((x) => x.title)).toEqual(['C', 'A', 'B']);
  });

  it('restoreProject puts a removed site back at its old position', () => {
    store.addProject(site('A'));
    store.addProject(site('B'));
    store.addProject(site('C'));
    const b = store.listProjects()[1];
    store.removeProject(b.id);
    store.restoreProject(b, 1);
    expect(store.listProjects().map((x) => x.title)).toEqual(['A', 'B', 'C']);
  });

  it('notifies subscribers on write and keeps a stable snapshot between writes', () => {
    const cb = vi.fn();
    const off = store.subscribe(cb);
    store.addProject(site('A'));
    expect(cb).toHaveBeenCalledTimes(1);
    expect(store.listProjects()).toBe(store.listProjects()); // same reference until data changes
    off();
    store.addProject(site('B'));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('picks up changes made by another tab (storage event)', () => {
    const cb = vi.fn();
    store.subscribe(cb);
    localStorage.setItem('hub.projects.v1', JSON.stringify([{ id: 'x', title: 'From other tab' }]));
    window.dispatchEvent(new StorageEvent('storage', { key: 'hub.projects.v1' }));
    expect(cb).toHaveBeenCalled();
    expect(store.listProjects()[0].title).toBe('From other tab');
  });
});
