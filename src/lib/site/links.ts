export const LEGAL_LINKS = [
  { label: "Privacy", href: "/pages/privacy" },
  { label: "Terms", href: "/pages/terms" },
  { label: "Cookies", href: "/pages/cookies" },
  { label: "Contact", href: "/pages/contact" },
] as const;

export type LegalLink = (typeof LEGAL_LINKS)[number];

export const SOCIAL_LINKS = [
  { label: "X", href: "https://x.com/yourhandle" },
  { label: "Reddit", href: "https://www.reddit.com/r/yoursub" },
] as const;

export type SocialLink = (typeof SOCIAL_LINKS)[number];