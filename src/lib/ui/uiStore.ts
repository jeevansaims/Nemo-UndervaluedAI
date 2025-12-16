const KEY = "nemo_ui_public_mode_v1";

export function getPublicMode(): boolean {
  if (typeof window === "undefined") return true; // default public on server
  const raw = window.localStorage.getItem(KEY);
  if (raw === null) return true; // default PUBLIC
  return raw === "true";
}

export function setPublicMode(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, String(value));
}
