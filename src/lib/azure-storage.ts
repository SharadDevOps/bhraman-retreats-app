import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME ?? "retreat-media";

/** True when blob storage is configured (i.e. running in Azure). */
export function isBlobConfigured() {
  return Boolean(accountName);
}

export function getMediaContainer() {
  if (!accountName) throw new Error("AZURE_STORAGE_ACCOUNT_NAME is not configured");
  // DefaultAzureCredential uses the App Service system-assigned managed identity
  // in Azure, or your `az login` / env credentials locally.
  const service = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential(),
  );
  return service.getContainerClient(containerName);
}

/**
 * Upload an image buffer to the media container and return its public URL.
 * The container is configured for anonymous blob read, so the returned URL is
 * directly usable in <img src>.
 */
export async function uploadMedia(blobName: string, data: Buffer, contentType: string) {
  const container = getMediaContainer();
  const block = container.getBlockBlobClient(blobName);
  await block.uploadData(data, { blobHTTPHeaders: { blobContentType: contentType } });
  return block.url; // https://<account>.blob.core.windows.net/<container>/<blobName>
}
