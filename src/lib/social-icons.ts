/**
 * Map a social platform name to an iconify icon name.
 * Uses the already-installed @iconify-json/simple-icons and lucide sets,
 * so adding a platform needs no new dependency.
 *
 * `platform` comes from siteConfig.socialLinks[].platform; `url` is used
 * as a fallback hint for unknown platform names.
 */
export function socialIconFor(platform: string, url = ""): string {
  switch (platform.toLowerCase()) {
    case "github":
      return "simple-icons:github";
    case "linkedin":
      return "simple-icons:linkedin";
    case "x":
    case "twitter":
      return "simple-icons:x";
    case "htb":
    case "hackthebox":
      return "simple-icons:hackthebox";
    case "discord":
      return "simple-icons:discord";
    case "email":
    case "mail":
      return "lucide:mail";
    default:
      break;
  }

  if (url.includes("github.com")) return "simple-icons:github";
  if (url.includes("linkedin.com")) return "simple-icons:linkedin";
  if (url.includes("x.com") || url.includes("twitter.com"))
    return "simple-icons:x";
  if (url.startsWith("mailto:")) return "lucide:mail";
  return "lucide:link";
}
