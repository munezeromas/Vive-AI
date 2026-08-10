// Lightweight route time tracking using localStorage
type Totals = Record<string, number>; // seconds

const STORAGE_KEY = "vive_route_time_totals";

export function getTotals(): Totals {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Totals : {};
  } catch (e) {
    console.error("routeTime.getTotals parse error", e);
    return {};
  }
}

export function saveTotals(t: Totals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  } catch (e) {
    console.error("routeTime.saveTotals error", e);
  }
}

export function addSeconds(route: string, seconds: number) {
  if (!route) return;
  const t = getTotals();
  t[route] = (t[route] || 0) + Math.max(0, Math.floor(seconds));
  saveTotals(t);
}

// Session helpers use sessionStorage so they are not persisted across tabs
function sessionKey(route: string) {
  return `vive_route_time_session_${route}`;
}

export function startSession(route: string) {
  if (!route) return;
  try {
    sessionStorage.setItem(sessionKey(route), String(Date.now()));
  } catch (e) {
    // ignore
  }
}

export function stopSession(route: string) {
  if (!route) return 0;
  try {
    const raw = sessionStorage.getItem(sessionKey(route));
    if (!raw) return 0;
    const start = Number(raw);
    if (!start) return 0;
    const seconds = Math.floor((Date.now() - start) / 1000);
    sessionStorage.removeItem(sessionKey(route));
    addSeconds(route, seconds);
    return seconds;
  } catch (e) {
    return 0;
  }
}

export function clearTotals() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

export function formatHours(seconds: number) {
  return (seconds / 3600).toFixed(2);
}
