import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { isBlobConfigured, uploadMedia } from "@/lib/azure-storage";

export const runtime = "nodejs";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const slot = form?.get("slot"); // "retreat" | "founder" | "hero" (optional)
  const altText = String(form?.get("altText") ?? "");

  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Only JPEG, PNG, WebP or AVIF images are allowed." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const blobName = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let url: string;
  try {
    if (isBlobConfigured()) {
      // Production: durable object storage (Azure Blob), served publicly.
      url = await uploadMedia(blobName, buffer, file.type);
    } else {
      // Local dev fallback: write to public/uploads.
      const dir = path.join(process.cwd(), "public", "uploads");
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, blobName), buffer);
      url = `/uploads/${blobName}`;
    }
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  await prisma.mediaAsset.create({
    data: { blobName, url, altText: altText || safeName, mimeType: file.type },
  });

  if (typeof slot === "string" && ["retreat", "founder", "hero"].includes(slot)) {
    const row = await prisma.siteContent.findUnique({ where: { key: "mediaSlots" } });
    const slots = row ? JSON.parse(row.value) : {};
    slots[slot] = url;
    await prisma.siteContent.upsert({
      where: { key: "mediaSlots" },
      update: { value: JSON.stringify(slots), published: true },
      create: { key: "mediaSlots", value: JSON.stringify(slots), published: true },
    });
  }

  return NextResponse.json({ url }, { status: 201 });
}
