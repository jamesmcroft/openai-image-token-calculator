const SCHEMA_VERSION = 1;
const MAX_IMAGES = 50;
const MAX_URL_LENGTH = 2000;

/**
 * Encode calculator state into a URL-safe base64 hash string.
 *
 * @param {{ modelName: string, images: { height: number, width: number, multiplier: number, preset?: string }[], requestsPerDay?: number, comparisonMode?: boolean, selectedModelNames?: string[] }} state
 * @param {{ origin?: string, pathname?: string }} location - optional, defaults to window.location
 * @returns {{ hash: string, oversized: boolean }}
 */
export function encodeState({ modelName, images, requestsPerDay, comparisonMode, selectedModelNames }, location) {
  const payload = {
    v: SCHEMA_VERSION,
    m: modelName || "",
    i: (images ?? []).slice(0, MAX_IMAGES).map((img) => ({
      h: img.height ?? 0,
      w: img.width ?? 0,
      q: img.multiplier ?? 1,
      ...(img.preset && img.preset !== "Custom" ? { p: img.preset } : {}),
    })),
  };

  if (requestsPerDay && requestsPerDay > 0) {
    payload.r = requestsPerDay;
  }

  if (comparisonMode) {
    payload.c = 1;
    if (selectedModelNames?.length > 0) {
      payload.ms = selectedModelNames;
    }
  }

  const json = JSON.stringify(payload);
  const base64 = toUrlSafeBase64(json);
  const hash = `#${base64}`;

  const loc = location ?? (typeof window !== "undefined" ? window.location : {});
  const baseUrl = `${loc.origin ?? ""}${loc.pathname ?? ""}`;
  const fullUrl = `${baseUrl}${hash}`;

  return {
    hash,
    oversized: fullUrl.length > MAX_URL_LENGTH,
  };
}

/**
 * Decode and validate a URL hash string into calculator state.
 *
 * @param {string} hash - The location.hash value (including the # prefix)
 * @returns {{ modelName: string, images: { height: number, width: number, multiplier: number, preset: string }[], requestsPerDay: number } | { error: string }}
 */
export function decodeState(hash) {
  if (!hash || hash.length <= 1) {
    return { error: "empty" };
  }

  const encoded = hash.slice(1); // remove #

  let json;
  try {
    json = fromUrlSafeBase64(encoded);
  } catch {
    return { error: "Invalid URL state: could not decode" };
  }

  let payload;
  try {
    payload = JSON.parse(json);
  } catch {
    return { error: "Invalid URL state: malformed data" };
  }

  if (!payload || typeof payload !== "object") {
    return { error: "Invalid URL state: unexpected format" };
  }

  if (payload.v !== SCHEMA_VERSION) {
    return { error: `Unsupported URL state version: ${payload.v}` };
  }

  const modelName = typeof payload.m === "string" ? payload.m : "";

  if (!Array.isArray(payload.i)) {
    return { error: "Invalid URL state: images must be an array" };
  }

  const images = payload.i.slice(0, MAX_IMAGES).map((img) => ({
    height: sanitizeDimension(img?.h),
    width: sanitizeDimension(img?.w),
    multiplier: sanitizeMultiplier(img?.q),
    preset: typeof img?.p === "string" ? img.p : "Custom",
  }));

  const requestsPerDay = sanitizeRequestsPerDay(payload.r);

  const comparisonMode = payload.c === 1;
  const selectedModelNames = comparisonMode && Array.isArray(payload.ms)
    ? payload.ms.filter((n) => typeof n === "string")
    : [];

  return { modelName, images, requestsPerDay, comparisonMode, selectedModelNames };
}

/**
 * Look up a model object by name from the flat model catalog.
 *
 * @param {string} name
 * @param {{ name: string, items: object[] }[]} modelGroups
 * @returns {object|null}
 */
export function findModelByName(name, modelGroups) {
  if (!name) return null;
  for (const group of modelGroups) {
    for (const item of group.items) {
      if (item.name === name) return item;
    }
  }
  return null;
}

// --- Helpers ---

function sanitizeDimension(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

function sanitizeMultiplier(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.round(n) : 1;
}

function sanitizeRequestsPerDay(value) {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function toUrlSafeBase64(str) {
  const encoded = btoa(unescape(encodeURIComponent(str)));
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafeBase64(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return decodeURIComponent(escape(atob(base64)));
}

export { SCHEMA_VERSION, MAX_IMAGES, MAX_URL_LENGTH };
