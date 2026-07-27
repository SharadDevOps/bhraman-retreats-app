export const CONTENT_STATUSES: readonly string[];
export const RETREAT_STATUSES: readonly string[];
export const ENQUIRY_STATUSES: readonly string[];
export const ADMIN_ROLES: readonly string[];

export function sanitizeRichContent(value: unknown): unknown;
export function isSensitiveSettingKey(key: unknown): boolean;
export function isRoleAllowed(role: string, allowedRoles: readonly string[]): boolean;
export function validateCmsEntity(
  entity: string,
  payload: unknown,
  options?: { partial?: boolean },
): {
  valid: boolean;
  data: Record<string, unknown>;
  errors: Record<string, string>;
};
export function normalizePublication(data: Record<string, unknown>): Record<string, unknown>;
