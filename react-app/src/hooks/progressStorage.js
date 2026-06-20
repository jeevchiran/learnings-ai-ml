const KEY = 'mlportal_v1';

export function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage quota exceeded — silently skip
  }
}

export function markComplete(id) {
  const data = load();
  data[id] = { ...data[id], completed: true, lastVisited: Date.now() };
  save(data);
  return data;
}

export function toggleComplete(id) {
  const data = load();
  const wasComplete = Boolean(data[id]?.completed);
  data[id] = { ...data[id], completed: !wasComplete };
  save(data);
  return data;
}

export function toggleBookmark(id) {
  const data = load();
  data[id] = { ...data[id], bookmarked: !data[id]?.bookmarked };
  save(data);
  return data;
}

export function setLastVisited(id) {
  const data = load();
  data[id] = { ...data[id], lastVisited: Date.now() };
  save(data);
  return data;
}
