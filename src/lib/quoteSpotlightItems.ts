export type QuoteSpotlightItem = {
  quoteText: string;
  authorName: string;
  avatarSrc: string;
  avatarAlt: string;
  whyHref: string;
  ctaLabel?: string;
};

export const QUOTE_SPOTLIGHT_ITEMS: readonly QuoteSpotlightItem[] = [
  {
    quoteText: "A clean interface is an argument, not decoration.",
    authorName: "YourBlog Notes",
    avatarSrc: "/file.svg",
    avatarAlt: "Avatar",
    whyHref: "/pages/about",
    ctaLabel: "Why He Said It?",
  },
  {
    quoteText: "Every constraint you accept is a future decision you don’t have to revisit.",
    authorName: "YourBlog Notes",
    avatarSrc: "/globe.svg",
    avatarAlt: "Avatar",
    whyHref: "/pages/about",
    ctaLabel: "Why He Said It?",
  },
  {
    quoteText: "One small fact can rewire your whole model of the world.",
    authorName: "YourBlog Notes",
    avatarSrc: "/window.svg",
    avatarAlt: "Avatar",
    whyHref: "/pages/about",
    ctaLabel: "Why He Said It?",
  },
];
