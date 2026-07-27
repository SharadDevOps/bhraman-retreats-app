import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { isSensitiveSettingKey } from "@/lib/cms-validation.mjs";

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { publicationStatus: "PUBLISHED" },
      select: { key: true, value: true, description: true, updatedAt: true },
      orderBy: { key: "asc" },
    });
    const safeRows = rows.filter((row) => !isSensitiveSettingKey(row.key));
    return apiSuccess(Object.fromEntries(safeRows.map(({ key, value }) => [key, value])));
  } catch (error) {
    return handleApiError(error);
  }
}
