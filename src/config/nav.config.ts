/**
 * Navigation configuration — Centralized navigation structure
 * Defines main navigation links and footer sections
 * Used by Header and Footer components for consistent navigation
 */

export interface NavItem {
  /** Navigation link URL */
  href: string;
  /** Translation key for localized label */
  labelKey: string;
  /** Optional icon name for icon-only navigation items */
  icon?: string;
  /** Whether this is an external link (opens in new tab) */
  external?: boolean;
  /** Sub-navigation items for dropdown menus */
  children?: NavItem[];
}

/** Main navigation items for header */
export const mainNav: NavItem[] = [
  { href: "/", labelKey: "nav.about" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/contact", labelKey: "nav.contact" },
] as const;

/** Footer navigation grouped by section */
export const footerNav = {
  /** Site sections */
  explore: [
    { href: "/blog", labelKey: "nav.blog" },
    { href: "/contact", labelKey: "nav.contact" },
  ] as const,
  /** Legal pages and terms */
  legal: [
    { href: "/privacy", labelKey: "footer.privacy" },
    { href: "/terms", labelKey: "footer.terms" },
  ] as const,
} as const;

/** Helper function to get navigation items by section */
export function getFooterNav(section: keyof typeof footerNav): NavItem[] {
  return footerNav[section] as unknown as NavItem[];
}
