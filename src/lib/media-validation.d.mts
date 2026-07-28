export type MediaKind = "IMAGE" | "VIDEO" | "AUDIO";
export type ValidatedMediaUpload = {
  folder: string;
  fileName: string;
  safeFileName: string;
  mimeType: string;
  kind: MediaKind;
  sizeBytes: number;
  altText: string;
  title: string | null;
  caption: string | null;
  credit: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
};
export const MEDIA_FOLDERS: readonly string[];
export const MEDIA_LIMITS: Readonly<Record<MediaKind, number>>;
export function mediaKindForMime(mimeType: unknown): MediaKind | null;
export function expectedKindForFolder(folder: string): MediaKind;
export function isAllowedMediaFolder(folder: unknown): boolean;
export function sanitizeMediaFileName(fileName: unknown): string;
export function validateMediaUploadRequest(input: unknown):
  | { valid: true; value: ValidatedMediaUpload }
  | { valid: false; errors: Record<string, string> };
