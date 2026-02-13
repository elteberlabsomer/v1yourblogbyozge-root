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
  body: Array<{ kind: "p" | "h2"; text: string }>;
};

type TopicSlug =
  | "art"
  | "history"
  | "literature"
  | "music"
  | "relationships"
  | "science"
  | "screen"
  | "sports"
  | "technology"
  | "true-crime";

const TOPICS: ReadonlyArray<{
  slug: TopicSlug;
  label: string;
  coverAlt: string;
}> = [
  { slug: "art", label: "Art", coverAlt: "Art thumbnail" },
  { slug: "history", label: "History", coverAlt: "History thumbnail" },
  { slug: "literature", label: "Literature", coverAlt: "Literature thumbnail" },
  { slug: "music", label: "Music", coverAlt: "Music thumbnail" },
  { slug: "relationships", label: "Relationships", coverAlt: "Relationships thumbnail" },
  { slug: "science", label: "Science", coverAlt: "Science thumbnail" },
  { slug: "screen", label: "Screen", coverAlt: "Screen thumbnail" },
  { slug: "sports", label: "Sports", coverAlt: "Sports thumbnail" },
  { slug: "technology", label: "Technology", coverAlt: "Technology thumbnail" },
  { slug: "true-crime", label: "True Crime", coverAlt: "True Crime thumbnail" },
];

const TOPIC_TITLES: Record<TopicSlug, ReadonlyArray<string>> = {
  art: [
    "The quiet power of negative space in modern posters",
    "Why palettes feel different under warm indoor light",
    "A simple method to study composition without copying",
    "How to build a visual library that actually helps",
    "The case for slower typography decisions",
    "What makes a grid feel calm instead of rigid",
    "A practical way to critique your own work",
    "The hidden rhythm of editorial layouts",
    "When illustration should stay imperfect",
    "A gentle approach to building style consistency",
  ],
  history: [
    "How small trade routes shaped big cultural shifts",
    "What letters reveal about everyday life in the past",
    "Why borders moved faster than people realized",
    "A short guide to reading old maps critically",
    "The overlooked role of logistics in empires",
    "How explaining history changes what you remember",
    "What public records can and cannot tell us",
    "Why timelines rarely explain cause and effect",
    "The myths we inherit from simplified narratives",
    "A calm way to research without getting lost",
  ],
  literature: [
    "What makes a paragraph feel inevitable",
    "How to read dialogue for subtext, not plot",
    "A simple trick for noticing structure in novels",
    "Why some metaphors feel tired and others live",
    "What editors look for in a strong opening page",
    "How to keep a voice consistent across chapters",
    "The quiet difference between tone and style",
    "What re-reading teaches that highlights never do",
    "How writers create momentum without action scenes",
    "A method for collecting quotes without hoarding",
  ],
  music: [
    "Why repeating a motif can feel fresh each time",
    "How dynamics shape emotion more than melody",
    "A calm way to practice with intention",
    "What makes a chorus memorable without volume",
    "How to hear arrangement choices in pop tracks",
    "The role of silence in powerful songwriting",
    "Why tempo changes feel like narrative turns",
    "A guide to listening for texture and space",
    "How rhythm carries meaning across genres",
    "Small habits that improve musical taste over time",
  ],
  relationships: [
    "The difference between clarity and control",
    "How to ask questions that invite honesty",
    "What healthy boundaries look like in practice",
    "A gentle way to handle recurring conflict",
    "Why reassurance works better than arguments",
    "How to repair small ruptures quickly",
    "What it means to listen without fixing",
    "The subtle signs of mutual respect",
    "How to disagree without building resentment",
    "A simple framework for better conversations",
  ],
  science: [
    "How to read a paper without drowning in methods",
    "Why uncertainty is a feature, not a flaw",
    "A simple checklist for evaluating claims",
    "What replication actually changes in a field",
    "How to build intuition with small experiments",
    "Why models are useful even when they are wrong",
    "The hidden assumptions inside common graphs",
    "A calm guide to statistical literacy",
    "How to compare explanations fairly",
    "What good science communication avoids doing",
  ],
  screen: [
    "Why pacing matters more than plot twists",
    "How to notice visual motifs in cinematography",
    "The quiet craft behind believable dialogue",
    "What editing does that you never see",
    "How sound design shapes the story",
    "Why some scenes feel long in a good way",
    "A simple way to review films with structure",
    "How to spot theme without over-reading",
    "What makes a series rewatchable",
    "The difference between mood and message",
  ],
  sports: [
    "What consistency looks like in real training blocks",
    "How recovery affects performance more than hype",
    "Why fundamentals beat novelty over time",
    "A calm guide to tracking progress",
    "What coaches mean by game intelligence",
    "How routines reduce decision fatigue",
    "The role of confidence in close matches",
    "How to watch a game more analytically",
    "Why small habits win seasons",
    "How to set goals that survive setbacks",
  ],
  technology: [
    "Why good systems feel boring in the best way",
    "How to design interfaces with fewer regrets",
    "A simple way to name things consistently",
    "What quality gates really protect you from",
    "How to refactor without losing momentum",
    "Why tokens make design decisions reusable",
    "How to keep a component library coherent",
    "The difference between polish and complexity",
    "A calm approach to performance work",
    "How to document decisions so future-you wins",
  ],
  "true-crime": [
    "How narratives bias what we think we know",
    "What evidence feels like when you slow down",
    "Why timelines can mislead as much as they help",
    "How to read sources without sensationalism",
    "What makes a case summary actually useful",
    "How to separate facts from interpretations",
    "Why details get repeated even when unverified",
    "A calm framework for ethical storytelling",
    "How context changes every conclusion",
    "What to do when sources disagree",
  ],
};

const TOPIC_TAGS: Record<TopicSlug, ReadonlyArray<DemoTag>> = {
  art: [
    { label: "composition", slug: "composition" },
    { label: "typography", slug: "typography" },
    { label: "color", slug: "color" },
    { label: "layout", slug: "layout" },
    { label: "process", slug: "process" },
    { label: "reference", slug: "reference" },
    { label: "critique", slug: "critique" },
    { label: "visual-library", slug: "visual-library" },
    { label: "tools", slug: "tools" },
    { label: "poster", slug: "poster" },
  ],
  history: [
    { label: "maps", slug: "maps" },
    { label: "archives", slug: "archives" },
    { label: "trade", slug: "trade" },
    { label: "empires", slug: "empires" },
    { label: "letters", slug: "letters" },
    { label: "logistics", slug: "logistics" },
    { label: "timeline", slug: "timeline" },
    { label: "context", slug: "context" },
    { label: "sources", slug: "sources" },
    { label: "myths", slug: "myths" },
  ],
  literature: [
    { label: "voice", slug: "voice" },
    { label: "structure", slug: "structure" },
    { label: "dialogue", slug: "dialogue" },
    { label: "metaphor", slug: "metaphor" },
    { label: "editing", slug: "editing" },
    { label: "reading", slug: "reading" },
    { label: "quotes", slug: "quotes" },
    { label: "tone", slug: "tone" },
    { label: "craft", slug: "craft" },
    { label: "openings", slug: "openings" },
  ],
  music: [
    { label: "arrangement", slug: "arrangement" },
    { label: "dynamics", slug: "dynamics" },
    { label: "rhythm", slug: "rhythm" },
    { label: "melody", slug: "melody" },
    { label: "practice", slug: "practice" },
    { label: "listening", slug: "listening" },
    { label: "texture", slug: "texture" },
    { label: "tempo", slug: "tempo" },
    { label: "songwriting", slug: "songwriting" },
    { label: "motifs", slug: "motifs" },
  ],
  relationships: [
    { label: "boundaries", slug: "boundaries" },
    { label: "communication", slug: "communication" },
    { label: "repair", slug: "repair" },
    { label: "respect", slug: "respect" },
    { label: "conflict", slug: "conflict" },
    { label: "clarity", slug: "clarity" },
    { label: "listening", slug: "listening" },
    { label: "trust", slug: "trust" },
    { label: "honesty", slug: "honesty" },
    { label: "frameworks", slug: "frameworks" },
  ],
  science: [
    { label: "papers", slug: "papers" },
    { label: "uncertainty", slug: "uncertainty" },
    { label: "statistics", slug: "statistics" },
    { label: "replication", slug: "replication" },
    { label: "models", slug: "models" },
    { label: "graphs", slug: "graphs" },
    { label: "methods", slug: "methods" },
    { label: "claims", slug: "claims" },
    { label: "communication", slug: "communication" },
    { label: "experiments", slug: "experiments" },
  ],
  screen: [
    { label: "cinematography", slug: "cinematography" },
    { label: "editing", slug: "editing" },
    { label: "sound", slug: "sound" },
    { label: "dialogue", slug: "dialogue" },
    { label: "pacing", slug: "pacing" },
    { label: "motifs", slug: "motifs" },
    { label: "theme", slug: "theme" },
    { label: "review", slug: "review" },
    { label: "series", slug: "series" },
    { label: "story", slug: "story" },
  ],
  sports: [
    { label: "training", slug: "training" },
    { label: "recovery", slug: "recovery" },
    { label: "fundamentals", slug: "fundamentals" },
    { label: "habits", slug: "habits" },
    { label: "coaching", slug: "coaching" },
    { label: "goals", slug: "goals" },
    { label: "mindset", slug: "mindset" },
    { label: "analysis", slug: "analysis" },
    { label: "routine", slug: "routine" },
    { label: "progress", slug: "progress" },
  ],
  technology: [
    { label: "systems", slug: "systems" },
    { label: "ui", slug: "ui" },
    { label: "components", slug: "components" },
    { label: "tokens", slug: "tokens" },
    { label: "refactor", slug: "refactor" },
    { label: "performance", slug: "performance" },
    { label: "docs", slug: "docs" },
    { label: "quality", slug: "quality" },
    { label: "naming", slug: "naming" },
    { label: "architecture", slug: "architecture" },
  ],
  "true-crime": [
    { label: "sources", slug: "sources" },
    { label: "evidence", slug: "evidence" },
    { label: "ethics", slug: "ethics" },
    { label: "timeline", slug: "timeline" },
    { label: "media", slug: "media" },
    { label: "psychology", slug: "psychology" },
    { label: "forensics", slug: "forensics" },
    { label: "court-docs", slug: "court-docs" },
    { label: "justice", slug: "justice" },
    { label: "context", slug: "context" },
  ],
};

const DEMO_COVER_POOL: ReadonlyArray<string> = Array.from({ length: 20 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/demo/archive/${n}.jpg`;
});

const VIDEO_TAG: DemoTag = { label: "Videos", slug: "videos" };
const LUCKY_TAG: DemoTag = { label: "Are You Lucky", slug: "are-you-lucky" };

function withVideoTag(tags: DemoTag[]): DemoTag[] {
  const rest = tags.filter((t) => t.slug !== VIDEO_TAG.slug);
  return [VIDEO_TAG, ...rest].slice(0, 3);
}

function withLuckyTag(tags: DemoTag[]): DemoTag[] {
  const rest = tags.filter((t) => t.slug !== LUCKY_TAG.slug);
  return [LUCKY_TAG, ...rest].slice(0, 3);
}

function isoFromUtc(baseIso: string, daysBack: number): string {
  const d = new Date(`${baseIso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/’/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pick3Tags(topic: TopicSlug, i: number): DemoTag[] {
  const pool = TOPIC_TAGS[topic];
  const a = pool[(i * 3) % pool.length];
  const b = pool[(i * 3 + 5) % pool.length];
  const c = pool[(i * 3 + 9) % pool.length];

  if (a.slug !== b.slug && a.slug !== c.slug && b.slug !== c.slug) return [a, b, c];

  const out: DemoTag[] = [a];
  for (const cand of [b, c, ...pool]) {
    if (out.some((t) => t.slug === cand.slug)) continue;
    out.push(cand);
    if (out.length === 3) break;
  }
  return out;
}

function makeSummary(topicLabel: string): string {
  return `A concise ${topicLabel.toLowerCase()} note with clear takeaways and a calm structure.`;
}

function makeBody(relatedLink: string): Array<{ kind: "p" | "h2"; text: string }> {
  return [
    { kind: "p", text: "This is demo body content rendered inside PostBody." },
    { kind: "p", text: "Short paragraphs keep layouts realistic and easy to scan." },
    { kind: "h2", text: "Key idea" },
    { kind: "p", text: "Keep one idea per paragraph, then add one concrete example." },
    { kind: "p", text: relatedLink },
  ];
}

function makeDemoPosts(): DemoPost[] {
  const out: DemoPost[] = [];
  const baseIso = "2026-02-05";

  let globalIndex = 0;

  for (let i = 0; i < 10; i++) {
    for (const topic of TOPICS) {
      const title = TOPIC_TITLES[topic.slug][i];
      const slug = `${topic.slug}-${slugify(title)}`;
      const dateIso = isoFromUtc(baseIso, globalIndex);

      const coverSrc = DEMO_COVER_POOL[globalIndex % DEMO_COVER_POOL.length] ?? "/demo/cover.jpg";
      const coverAlt = topic.coverAlt;

      const nextTitle = TOPIC_TITLES[topic.slug][(i + 1) % 10];
      const relatedSlug = `${topic.slug}-${slugify(nextTitle)}`;
      const relatedLink = `/blog/${relatedSlug}`;

      const baseTags = pick3Tags(topic.slug, i);

      let tags = globalIndex < 10 ? withVideoTag(baseTags) : baseTags;
      if (globalIndex < 20) tags = withLuckyTag(tags);

      out.push({
        slug,
        authorName: "Ozge",
        dateIso,
        categoryLabel: topic.label,
        topicSlug: topic.slug,
        title,
        summary: makeSummary(topic.label),
        coverSrc,
        coverAlt,
        tags,
        body: makeBody(relatedLink),
      });

      globalIndex++;
    }
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

export function getDemoTags(): DemoTag[] {
  const map = new Map<string, DemoTag>();
  for (const p of DEMO_POSTS) {
    for (const t of p.tags) map.set(t.slug, t);
  }
  return Array.from(map.values()).sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getDemoTopics(): Array<{ slug: string; label: string }> {
  return TOPICS.map((t) => ({ slug: t.slug, label: t.label }));
}

export function getDemoPostsByTag(tagSlug: string): DemoPost[] {
  return DEMO_POSTS.filter((p) => p.tags.some((t) => t.slug === tagSlug));
}

export function getDemoPostsByTopic(topicSlug: string): DemoPost[] {
  return DEMO_POSTS.filter((p) => p.topicSlug === topicSlug);
}
