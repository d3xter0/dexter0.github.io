/**
 * Site configuration — Centralized site settings following Astro Rocket reference
 * This is the source of truth for all site-wide configuration
 * It mirrors current SITE_CONFIG but with additional fields for future enhancements
 */

/** Site configuration interface */
export interface SiteConfig {
  /* Core site metadata */
  url: string;
  name: string;
  description: string;
  author: string;
  email: string;
  authorImage?: string;

  /* Social media and contact links */
  socialLinks: Array<{
    platform: string;
    url: string;
    icon?: string;
    label?: string;
  }>;

  /* Header configuration */
  header: {
    showSocialLinks: boolean;
    twitter?: string;
  };

  /* Search engine verification */
  verification: {
    google: string;
    bing: string;
  };

  /* Open Graph and social image */
  ogImage: string;

  /* Blog configuration */
  blog: {
    postsPerPage: number;
    tagCloudLimit: number;
  };

  /* Article features */
  articleFeatures: {
    toc: {
      enabled: boolean;
      layout: "sidebar" | "inline" | "none";
      sidebarPosition: "left" | "right";
      minHeadings: number;
      maxDepth: number;
    };
    comments: { enabled: boolean };
  };

  /* Blog image overlay */
  blogImageOverlay: boolean;

  /* Branding configuration */
  branding: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      border: string;
      ring: string;
    };
    logo: { light: string; dark: string };
    favicon: string;
  };

  /* i18n configuration */
  i18n: {
    enabled: boolean;
    locales: string[];
    defaultLocale: string;
    routing: { prefixDefaultLocale: boolean };
  };
}

export const siteConfig: SiteConfig = {
  /* Core configuration — single source of truth for canonical/OG/sitemap/llms.txt.
   * Replace with your production domain when forking this template. */
  url: "https://d3xter0.github.io",
  name: "Ahmed Gamal",
  description:
    `Hey, I’m Ahmed — A cybersecurity enthusiast focused on offensive security, penetration testing, and security research.
     I spend most of my time breaking things, understanding how they work, and learning how to make them more secure. 
     My interests include Web Security, API Pentesting, Network & Mobile security, Active Directory, and CTF challenges.
     This blog is where I document my journey, share CTF writeups, technical research, useful notes, and things I discover while learning and experimenting.`,
  author: "dexter",
  email: "ahmed.gamal113296@gmail.com",
  authorImage: "/images/author.jpg",

  /* Social links */
  socialLinks: [
  {
    platform: "github",
    url: "https://github.com/d3xter0",
    label: "GitHub",
  },
  {
    platform: "linkedin",
    url: "https://www.linkedin.com/in/ahmed-gamal-ag113",
    label: "LinkedIn",
  },
  {
    platform: "x",
    url: "https://x.com/dexxx1122",
    label: "X",
  },
  {
    platform: "htb",
    url: "https://app.hackthebox.com/users/2011633",
    label: "Hack The Box",
  },
  {
    platform: "discord",
    url: "https://discord.com/users/dex0x01",
    label: "Discord",
  },
  { platform: "email", url: "mailto:ahmed.gamal113296@gmail.com", label: "Email" },
],

  /* Header settings */
  header: {
    showSocialLinks: true,
  },

  /* Search engine verification */
  verification: {
    google: "",
    bing: "",
  },

  /* Social image */
  ogImage: "/images/og-default.jpg",

  /* Blog configuration */
  blog: {
    postsPerPage: 10,
    tagCloudLimit: 20,
  },

  /* Article features */
  articleFeatures: {
    toc: {
      enabled: true,
      layout: "sidebar",
      sidebarPosition: "right",
      minHeadings: 2,
      maxDepth: 3,
    },
    comments: { enabled: false },
  },

  /* Blog image overlay */
  blogImageOverlay: true,

  /* Branding */
  branding: {
    colors: {
      primary: "#171717",
      secondary: "#737373",
      accent: "#404040",
      background: "#ffffff",
      foreground: "#171717",
      border: "#e5e5e5",
      ring: "#171717",
    },
    logo: {
      light: "/logos/logo-light.svg",
      dark: "/logos/logo-dark.svg",
    },
    favicon: "/favicon.svg",
  },

  /* i18n configuration (matches i18n.config.ts) */
  i18n: {
    enabled: true,
    locales: ["en"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
} as const;

export default siteConfig;
