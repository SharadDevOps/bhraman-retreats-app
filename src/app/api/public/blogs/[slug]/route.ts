import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const post = await prisma.blogPost.findFirst({
      where: { slug, publicationStatus: "PUBLISHED" },
      select: {
        id: true, slug: true, title: true, excerpt: true, content: true,
        coverImageUrl: true, authorName: true, publishedAt: true, updatedAt: true,
      },
    });
    if (!post) return apiError(404, "NOT_FOUND", "Blog post not found.");
    return apiSuccess(post);
  } catch (error) {
    return handleApiError(error);
  }
}
