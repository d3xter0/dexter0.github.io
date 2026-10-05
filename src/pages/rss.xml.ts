import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";
import { siteConfig } from "../config/site.config";

export async function GET() {
  const posts: CollectionEntry<"blog">[] = await getCollection("blog");
  const publishedPosts = posts
    .filter(
      (post: CollectionEntry<"blog">) =>
        post.data.locale === siteConfig.i18n.defaultLocale && !post.data.draft,
    )
    .map((post: CollectionEntry<"blog">) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.id}`,
      pubDate: post.data.publishDate,
      categories: post.data.tags ?? [],
      author: post.data.author,
      customData: post.data.featured ? "<featured>true</featured>" : "",
    }));

  const writeups: CollectionEntry<"writeups">[] =
    await getCollection("writeups");
  const publishedWriteups = writeups
    .filter(
      (writeup: CollectionEntry<"writeups">) =>
        writeup.data.locale === siteConfig.i18n.defaultLocale &&
        !writeup.data.draft,
    )
    .map((writeup: CollectionEntry<"writeups">) => ({
      title: writeup.data.title,
      description: writeup.data.description,
      link: `/writeups/${writeup.id}`,
      pubDate: writeup.data.publishDate,
      categories: [writeup.data.category, ...(writeup.data.tags ?? [])],
      author: writeup.data.author,
      customData: writeup.data.featured ? "<featured>true</featured>" : "",
    }));

  const items = [...publishedPosts, ...publishedWriteups].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: siteConfig.url,
    items,
    customData: `<language>${siteConfig.i18n.defaultLocale}</language>`,
  });
}
