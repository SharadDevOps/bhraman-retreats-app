import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

function getAccountName() {
  return process.env.AZURE_STORAGE_ACCOUNT_NAME?.trim() ?? "";
}

export function getMediaContainerName() {
  return process.env.AZURE_STORAGE_CONTAINER_NAME?.trim() || "retreat-media";
}

export function getMediaRootPrefix() {
  const value = process.env.AZURE_MEDIA_ROOT_PREFIX?.trim() || "bhraman-media";
  if (!/^[a-z0-9][a-z0-9/-]*[a-z0-9]$/.test(value) || value.includes("..") || value.includes("//")) {
    throw new Error("AZURE_MEDIA_ROOT_PREFIX is invalid");
  }
  return value.replace(/^\/+|\/+$/g, "");
}

/** True when blob storage is configured (i.e. running in Azure). */
export function isBlobConfigured() {
  return Boolean(getAccountName());
}

export function getMediaServiceClient() {
  const accountName = getAccountName();
  if (!accountName) throw new Error("AZURE_STORAGE_ACCOUNT_NAME is not configured");
  return new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential(),
  );
}

export function getMediaContainer() {
  return getMediaServiceClient().getContainerClient(getMediaContainerName());
}

export function getMediaBlobClient(blobName: string) {
  return getMediaContainer().getBlockBlobClient(blobName);
}

function encodeBlobPath(blobName: string) {
  return blobName.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

function withMediaBase(baseUrl: string | undefined, blobName: string, fallback: string) {
  const cleanBase = baseUrl?.trim().replace(/\/+$/g, "");
  return cleanBase ? `${cleanBase}/${encodeBlobPath(blobName)}` : fallback;
}

export function getPublicMediaUrl(blobName: string) {
  const blockBlob = getMediaBlobClient(blobName);
  return withMediaBase(process.env.AZURE_MEDIA_PUBLIC_BASE_URL, blobName, blockBlob.url);
}

function getSasTtlMinutes() {
  const configured = Number(process.env.AZURE_MEDIA_SAS_TTL_MINUTES ?? 10);
  if (!Number.isFinite(configured)) return 10;
  return Math.min(15, Math.max(5, Math.round(configured)));
}

export async function createDirectMediaUpload(blobName: string) {
  const accountName = getAccountName();
  const containerName = getMediaContainerName();
  const service = getMediaServiceClient();
  const blockBlob = service.getContainerClient(containerName).getBlockBlobClient(blobName);
  const startsOn = new Date(Date.now() - 5 * 60_000);
  const expiresOn = new Date(Date.now() + getSasTtlMinutes() * 60_000);
  const delegationKey = await service.getUserDelegationKey(startsOn, expiresOn);
  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"),
      protocol: SASProtocol.Https,
      startsOn,
      expiresOn,
    },
    delegationKey,
    accountName,
  ).toString();

  const directUrl = withMediaBase(process.env.AZURE_MEDIA_UPLOAD_BASE_URL, blobName, blockBlob.url);
  return {
    uploadUrl: `${directUrl}?${sas}`,
    publicUrl: getPublicMediaUrl(blobName),
    expiresAt: expiresOn,
    requiredHeaders: { "x-ms-blob-type": "BlockBlob" },
  };
}

export async function getMediaBlobProperties(blobName: string) {
  return getMediaBlobClient(blobName).getProperties();
}

export async function deleteMediaBlobIfExists(blobName: string) {
  return getMediaBlobClient(blobName).deleteIfExists({ deleteSnapshots: "include" });
}

/**
 * Legacy server-side upload helper retained for the existing route.
 * New Phase 3 clients use createDirectMediaUpload and upload directly to Blob Storage.
 */
export async function uploadMedia(blobName: string, data: Buffer, contentType: string) {
  const block = getMediaBlobClient(blobName);
  await block.uploadData(data, {
    blobHTTPHeaders: {
      blobContentType: contentType,
      blobCacheControl: "public, max-age=31536000, immutable",
    },
  });
  return getPublicMediaUrl(blobName);
}
