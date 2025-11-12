// parse JSON tối giản (đúng theo nhu cầu hiện tại)
export function tryParseJSON(str) {
  try { return JSON.parse(str); }
  catch { return null; }
}
