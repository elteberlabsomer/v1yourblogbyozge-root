export type DemoTag = {
  label: string;
  slug: string;
};

export type DemoPost = {
  slug: string;
  authorName: string;
  dateIso: string;
  categoryLabel: string;
  topicSlug: string;
  title: string;
  summary: string;
  coverSrc: string;
  coverAlt: string;
  tags: DemoTag[];
  body: Array<{ kind: 'p' | 'h2'; text: string }>;
};

type TopicSlug =
  | 'art'
  | 'history'
  | 'literature'
  | 'music'
  | 'relationships'
  | 'science'
  | 'screen'
  | 'sports'
  | 'technology'
  | 'true-crime';

type Topic = {
  label: string;
  slug: TopicSlug;
  coverAlt: string;
};

const TOPICS: Topic[] = [
  { label: 'Art', slug: 'art', coverAlt: 'Abstract art cover' },
  { label: 'History', slug: 'history', coverAlt: 'History cover' },
  { label: 'Literature', slug: 'literature', coverAlt: 'Literature cover' },
  { label: 'Music', slug: 'music', coverAlt: 'Music cover' },
  { label: 'Relationships', slug: 'relationships', coverAlt: 'Relationships cover' },
  { label: 'Science', slug: 'science', coverAlt: 'Science cover' },
  { label: 'Screen', slug: 'screen', coverAlt: 'Screen cover' },
  { label: 'Sports', slug: 'sports', coverAlt: 'Sports cover' },
  { label: 'Technology', slug: 'technology', coverAlt: 'Technology cover' },
  { label: 'True Crime', slug: 'true-crime', coverAlt: 'True crime cover' },
];

const TOPIC_TITLES: Record<TopicSlug, string[]> = {
  art: [
    'The quiet power of negative space',
    'Why good posters feel inevitable',
    'Color as a decision, not decoration',
    'How to critique work without flattening it',
    'The craft of a memorable icon',
    'A short history of the grid',
    'The case for fewer typefaces',
    'Designing for the room, not the page',
    'Texture, restraint, and meaning',
    'When style becomes a shortcut',
  ],
  history: [
    'How archives shape our memory',
    'The politics of a map',
    'Why dates are never neutral',
    'A small city with a long shadow',
    'The invention of “tradition”',
    'Letters that changed a century',
    'The biography of a tool',
    'Borders as stories we tell',
    'An empire in footnotes',
    'When the past becomes branding',
  ],
  literature: [
    'What makes a paragraph feel inevitable',
    'Why some sentences outlive their authors',
    'Close reading as a craft',
    'The romance of the unfinished',
    'A note on translation and loss',
    'Characters who refuse to behave',
    'The ethics of a narrator',
    'On rereading and becoming someone else',
    'A plot is a promise',
    'How dialogue reveals power',
  ],
  music: [
    'The moment a chorus earns itself',
    'A melody you can’t unhear',
    'Silence as arrangement',
    'The psychology of repetition',
    'When production is storytelling',
    'A drum pattern’s secret job',
    'What “tight” really means',
    'The beauty of restraint in mixing',
    'Listening like a musician',
    'A song as a small architecture',
  ],
  relationships: [
    'Boundaries are not walls',
    'Why reassurance doesn’t stick',
    'The hidden math of resentment',
    'Attachment as a lens, not a label',
    'Repair is a skill',
    'How to argue without damage',
    'The stories we inherit about love',
    'On choosing kindness over control',
    'What “being seen” requires',
    'The courage of a clear ask',
  ],
  science: [
    'Why uncertainty is honest',
    'The seduction of a clean result',
    'A note on replication',
    'When models become myths',
    'Correlation is not a confession',
    'The beauty of a good question',
    'How measurements lie',
    'Science as a social process',
    'The cost of being wrong',
    'The joy of a surprising null',
  ],
  screen: [
    'Editing as empathy',
    'A scene’s invisible contract',
    'Why some endings feel cheap',
    'The grammar of a close-up',
    'Blocking as meaning',
    'When spectacle replaces story',
    'A character arc is a vector',
    'The pace of attention',
    'Sound design as narrative',
    'The power of an ordinary frame',
  ],
  sports: [
    'Pressure is a teacher',
    'Why fundamentals win late',
    'Training the mind, not only the body',
    'The myth of “clutch”',
    'Recovery is performance',
    'A season is an ecosystem',
    'What repetition actually builds',
    'Discipline versus obsession',
    'The beauty of a simple play',
    'How teams become cultures',
  ],
  technology: [
    'The cost of convenience',
    'Interfaces as ethics',
    'A tiny bug with big consequences',
    'Why defaults matter',
    'Latency is a feeling',
    'The craft of a good abstraction',
    'When automation creates work',
    'A note on reliability',
    'Designing for failure',
    'Complexity is a budget',
  ],
  'true-crime': [
    'Narratives that flatter violence',
    'The difference between interest and exploitation',
    'Evidence is not a vibe',
    'On sensationalism and harm',
    'Why context is everything',
    'When podcasts become courts',
    'The problem with certainty',
    'How stories erase victims',
    'The ethics of attention',
    'A case study in bias',
  ],
};

const DEMO_COVER_POOL: ReadonlyArray<string> = Array.from({ length: 20 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return `/demo/archive/${n}.jpg`;
});

const VIDEO_TAG: DemoTag = { label: 'Videos', slug: 'videos' };
const LUCKY_TAG: DemoTag = { label: 'Are You Lucky', slug: 'are-you-lucky' };

function withVideoTag(tags: DemoTag[]): DemoTag[] {
  const rest = tags.filter((t) => t.slug !== VIDEO_TAG.slug);
  return [VIDEO_TAG, ...rest].slice(0, 3);
}

function withLuckyTag(tags: DemoTag[]): DemoTag[] {
  const rest = tags.filter((t) => t.slug !== LUCKY_TAG.slug);
  return [LUCKY_TAG, ...rest].slice(0, 3);
}

function isoFromUtc(baseIso: string, offsetDays: number): string {
  const base = new Date(`${baseIso}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function pick3Tags(topic: TopicSlug, index: number): DemoTag[] {
  const tagsByTopic: Record<TopicSlug, DemoTag[]> = {
    art: [
      { label: 'Composition', slug: 'composition' },
      { label: 'Typography', slug: 'typography' },
      { label: 'Critique', slug: 'critique' },
      { label: 'Color', slug: 'color' },
      { label: 'Visual systems', slug: 'visual-systems' },
    ],
    history: [
      { label: 'Archives', slug: 'archives' },
      { label: 'Maps', slug: 'maps' },
      { label: 'Empires', slug: 'empires' },
      { label: 'Memory', slug: 'memory' },
      { label: 'Sources', slug: 'sources' },
    ],
    literature: [
      { label: 'Craft', slug: 'craft' },
      { label: 'Reading', slug: 'reading' },
      { label: 'Style', slug: 'style' },
      { label: 'Narrators', slug: 'narrators' },
      { label: 'Translation', slug: 'translation' },
    ],
    music: [
      { label: 'Arrangement', slug: 'arrangement' },
      { label: 'Mixing', slug: 'mixing' },
      { label: 'Listening', slug: 'listening' },
      { label: 'Rhythm', slug: 'rhythm' },
      { label: 'Songwriting', slug: 'songwriting' },
    ],
    relationships: [
      { label: 'Boundaries', slug: 'boundaries' },
      { label: 'Attachment', slug: 'attachment' },
      { label: 'Repair', slug: 'repair' },
      { label: 'Communication', slug: 'communication' },
      { label: 'Conflict', slug: 'conflict' },
    ],
    science: [
      { label: 'Uncertainty', slug: 'uncertainty' },
      { label: 'Methods', slug: 'methods' },
      { label: 'Models', slug: 'models' },
      { label: 'Evidence', slug: 'evidence' },
      { label: 'Replication', slug: 'replication' },
    ],
    screen: [
      { label: 'Editing', slug: 'editing' },
      { label: 'Cinematography', slug: 'cinematography' },
      { label: 'Sound', slug: 'sound' },
      { label: 'Story', slug: 'story' },
      { label: 'Pacing', slug: 'pacing' },
    ],
    sports: [
      { label: 'Training', slug: 'training' },
      { label: 'Recovery', slug: 'recovery' },
      { label: 'Mindset', slug: 'mindset' },
      { label: 'Teams', slug: 'teams' },
      { label: 'Fundamentals', slug: 'fundamentals' },
    ],
    technology: [
      { label: 'Reliability', slug: 'reliability' },
      { label: 'Interfaces', slug: 'interfaces' },
      { label: 'Performance', slug: 'performance' },
      { label: 'Systems', slug: 'systems' },
      { label: 'Defaults', slug: 'defaults' },
    ],
    'true-crime': [
      { label: 'Ethics', slug: 'ethics' },
      { label: 'Evidence', slug: 'evidence' },
      { label: 'Bias', slug: 'bias' },
      { label: 'Context', slug: 'context' },
      { label: 'Narrative', slug: 'narrative' },
    ],
  };

  const pool = tagsByTopic[topic];
  const a = pool[index % pool.length];
  const b = pool[(index + 1) % pool.length];
  const c = pool[(index + 2) % pool.length];
  return [a, b, c];
}

function makeSummary(topicLabel: string): string {
  return `A short, structured note on ${topicLabel.toLowerCase()}—with a focus on craft, clarity, and decisions that compound.`;
}

function makeBody(relatedLink: string): Array<{ kind: 'p' | 'h2'; text: string }> {
  return [
    { kind: 'p', text: 'A paragraph earns trust by making its decisions feel inevitable.' },
    { kind: 'p', text: 'The trick is not complexity; it’s constraint, rhythm, and revision.' },
    { kind: 'h2', text: 'A useful constraint' },
    { kind: 'p', text: 'When you remove options, the remaining choices gain weight.' },
    { kind: 'p', text: `If you want a nearby thread, continue here: ${relatedLink}` },
  ];
}

function makeDemoPosts(): DemoPost[] {
  const baseIso = '2026-02-05';

  type Planned = {
    i: number;
    topic: (typeof TOPICS)[number];
    title: string;
    baseSlug: string;
    dateIso: string;
    coverSrc: string;
    coverAlt: string;
    tags: DemoTag[];
  };

  const planned: Planned[] = [];
  let globalIndex = 0;

  for (let i = 0; i < 10; i++) {
    for (const topic of TOPICS) {
      const title = TOPIC_TITLES[topic.slug][i];
      const baseSlug = slugify(title);
      const dateIso = isoFromUtc(baseIso, globalIndex);

      const coverSrc = DEMO_COVER_POOL[globalIndex % DEMO_COVER_POOL.length] ?? '/demo/cover.jpg';
      const coverAlt = topic.coverAlt;

      const baseTags = pick3Tags(topic.slug, i);

      let tags = globalIndex < 10 ? withVideoTag(baseTags) : baseTags;
      if (globalIndex < 20) {
        tags = withLuckyTag(tags);
      }

      planned.push({ i, topic, title, baseSlug, dateIso, coverSrc, coverAlt, tags });
      globalIndex++;
    }
  }

  // Ensure globally-unique slugs without encoding topic into the URL.
  const counts = new Map<string, number>();
  const slugByTopicIndex = new Map<string, string>();

  for (const p of planned) {
    const n = (counts.get(p.baseSlug) ?? 0) + 1;
    counts.set(p.baseSlug, n);

    const slug = n === 1 ? p.baseSlug : `${p.baseSlug}-${n}`;
    slugByTopicIndex.set(`${p.topic.slug}|${p.i}`, slug);
  }

  const out: DemoPost[] = [];

  for (const p of planned) {
    const slug = slugByTopicIndex.get(`${p.topic.slug}|${p.i}`) ?? p.baseSlug;

    const nextIndex = (p.i + 1) % 10;
    const relatedSlug =
      slugByTopicIndex.get(`${p.topic.slug}|${nextIndex}`) ?? slugify(TOPIC_TITLES[p.topic.slug][nextIndex]);
    const relatedLink = `/blog/${relatedSlug}`;

    out.push({
      slug,
      authorName: 'Ozge',
      dateIso: p.dateIso,
      categoryLabel: p.topic.label,
      topicSlug: p.topic.slug,
      title: p.title,
      summary: makeSummary(p.topic.label),
      coverSrc: p.coverSrc,
      coverAlt: p.coverAlt,
      tags: p.tags,
      body: makeBody(relatedLink),
    });
  }

  return out;
}

export const DEMO_POSTS: DemoPost[] = makeDemoPosts();

export function getDemoAllSlugs(): string[] {
  return DEMO_POSTS.map((p) => p.slug);
}

export function getDemoPostBySlug(slug: string): DemoPost | undefined {
  return DEMO_POSTS.find((p) => p.slug === slug);
}

export function getDemoCanonicalSlugForLegacySlug(legacySlug: string): string | undefined {
  // Legacy pattern: `${topicSlug}-${slugify(title)}`
  // We intentionally avoid embedding topic in the canonical URL now.
  for (const p of DEMO_POSTS) {
    const legacy = `${p.topicSlug}-${slugify(p.title)}`;
    if (legacy === legacySlug) return p.slug;
  }
  return undefined;
}

export function getDemoPostsByTopic(topicSlug: string): DemoPost[] {
  return DEMO_POSTS.filter((p) => p.topicSlug === topicSlug);
}

export function getDemoPostsByTag(tagSlug: string): DemoPost[] {
  return DEMO_POSTS.filter((p) => p.tags.some((t) => t.slug === tagSlug));
}

export function getDemoTopics(): Array<{ label: string; slug: string }> {
  return TOPICS.map((t) => ({ label: t.label, slug: t.slug }));
}

export function getDemoTags(): DemoTag[] {
  const map = new Map<string, DemoTag>();
  for (const p of DEMO_POSTS) {
    for (const t of p.tags) {
      map.set(t.slug, t);
    }
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}
