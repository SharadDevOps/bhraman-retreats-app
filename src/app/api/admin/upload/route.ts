import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { Prisma } from "@prisma/client";
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
    const row = await prisma.siteSetting.findUnique({ where: { key: "media.slots" } });
    const slots = row && row.value && typeof row.value === "object" && !Array.isArray(row.value)
      ? { ...row.value as Record<string, unknown> }
      : {};
    slots[slot] = url;
    const jsonSlots = slots as Prisma.InputJsonObject;
    await prisma.siteSetting.upsert({
      where: { key: "media.slots" },
      update: { value: jsonSlots, publicationStatus: "PUBLISHED", publishedAt: new Date() },
      create: {
        key: "media.slots",
        value: jsonSlots,
        description: "Homepage media slot references.",
        publicationStatus: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ url }, { status: 201 });
}
