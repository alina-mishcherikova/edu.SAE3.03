const STORAGE_KEY = "progress_v1";

export function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadProgress() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data === null) {
    return {};
  }

  try {
    return JSON.parse(data) || {};
  } catch (e) {
    return {};
  }
}
