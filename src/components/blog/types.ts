import type { Locale } from "../../lib/site-config";

/**
 * Structural shape of an article entry shared by the blog and writeups
 * collections. Both content schemas satisfy it, so the article components
 * (ArticleHero, BlogCard, RelatedPosts) can render either.
 */
export interface ArticleLike {
  id: string;
  body?: string;
  data: {
    title: string;
    description: string;
    publishDate: Date;
    author: string;
    locale: Locale;
    tags: string[];
    svgSlug?: string;
    draft?: boolean;
    /** Optional cover image URL (public path); falls back to generated SVG art. */
    image?: string;
  };
}
