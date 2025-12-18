const USER_KEY = "user_v1";

export function saveUserPayload(payload) {
  localStorage.setItem(USER_KEY, JSON.stringify(payload));
}

export function loadUserPayload() {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}
