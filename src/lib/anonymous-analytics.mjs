export const PRODUCT_EVENTS = Object.freeze([
  "experience_started",
  "experience_completed",
  "intention_selected",
  "element_result_viewed",
  "retreat_cta_clicked",
]);

const PROPERTY_KEYS = Object.freeze({
  experience_started: ["experience"],
  experience_completed: ["experience"],
  intention_selected: ["intention"],
  element_result_viewed: ["element"],
  retreat_cta_clicked: ["source"],
});

export function createAnonymousProductEvent(name, properties = {}) {
  if (!PRODUCT_EVENTS.includes(name)) throw new Error("Unsupported anonymous product event.");
  const allowedKeys = PROPERTY_KEYS[name];
  const clean = {};
  for (const key of allowedKeys) {
    const value = properties[key];
    if (typeof value === "string" && value.length <= 40 && /^[a-z0-9-]+$/i.test(value)) clean[key] = value;
  }
  return Object.freeze({ event: name, properties: Object.freeze(clean) });
}

export function trackAnonymousProductEvent(name, properties = {}) {
  const payload = createAnonymousProductEvent(name, properties);
  if (typeof window === "undefined") return payload;
  window.dispatchEvent(new CustomEvent("bhraman:product-event", { detail: payload }));
  if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: payload.event, ...payload.properties });
  return payload;
}