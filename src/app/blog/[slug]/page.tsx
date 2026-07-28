import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ResponsiveMedia } from "@/components/design-system";
import { getBlogPost } from "@/lib/content";

async function origin() {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(await origin(), slug);
  return post ? { title: `${post.title} | Bhraman Retreats`, description: post.excerpt } : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(await origin(), slug);
  if (!post) notFound();

  return (
    <main className="journal-page">
      <header><a className="brand" href="/" aria-label="Bhraman Retreats home"><BrandLogo /></a><a href="/#journal">Back to journal</a></header>
      <article>
        <p className="eyebrow">{post.authorName ?? "Bhraman Retreats"}</p>
        <h1>{post.title}</h1>
        <p className="journal-excerpt">{post.excerpt}</p>
        <ResponsiveMedia src={post.coverImageUrl} alt={post.title} fallbackTitle={post.title} fallbackHint="Journal cover is being prepared" />
        <div className="journal-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </main>
  );
}
