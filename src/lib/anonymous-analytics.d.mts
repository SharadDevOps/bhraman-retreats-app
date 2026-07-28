export type ProductEventName = "experience_started" | "experience_completed" | "intention_selected" | "element_result_viewed" | "retreat_cta_clicked";
export const PRODUCT_EVENTS: readonly ProductEventName[];
export function createAnonymousProductEvent(name: ProductEventName, properties?: Record<string, unknown>): Readonly<{ event: ProductEventName; properties: Readonly<Record<string, string>> }>;
export function trackAnonymousProductEvent(name: ProductEventName, properties?: Record<string, unknown>): Readonly<{ event: ProductEventName; properties: Readonly<Record<string, string>> }>;

declare global { interface Window { dataLayer?: Array<Record<string, unknown>>; } }