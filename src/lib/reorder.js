/* Pure list helpers shared by the board, the store and the tests. */

/** Move the item with `id` to index `to`. Returns a new array, or null when nothing changes. */
export function reorder(items, id, to) {
  const from = items.findIndex((x) => x.id === id);
  if (from < 0 || to < 0 || to >= items.length || from === to) return null;
  const next = items.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

/** Insert `item` at `index` (clamped to the list). Returns a new array. */
export function insertAt(items, item, index) {
  const next = items.slice();
  next.splice(Math.max(0, Math.min(index, next.length)), 0, item);
  return next;
}
