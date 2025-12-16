const STORAGE_KEY = "progress_v1";
const HISTORY_KEY = "history_v1";

export function saveProgress(state) {
  //acces au Storage
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

export function loadHistory() {
  const data = localStorage.getItem(HISTORY_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data) || [];
  } catch (e) {
    return {};
  }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
