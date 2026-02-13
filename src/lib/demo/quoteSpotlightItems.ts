export type QuoteSpotlightItem = {
  id: string;
  authorName: string;
  avatarSrc: string;
  avatarAlt: string;
  quoteText: string;
  whyHref: string;
  ctaLabel?: string;
};

export const QUOTE_SPOTLIGHT_ITEMS: QuoteSpotlightItem[] = [
  {
    id: 'relationships-reassurance',
    authorName: 'Someone',
    avatarSrc: 'https://pbs.twimg.com/profile_images/1967148637877608448/sY1X17Wg_400x400.jpg',
    avatarAlt: 'Profile photo',
    quoteText: 'Reassurance works better than arguments.',
    whyHref: '/blog/relationships-why-reassurance-works-better-than-arguments',
    ctaLabel: 'Why He Said It?',
  },
];
