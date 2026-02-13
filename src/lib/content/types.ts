export type ContentRef = {
  slug: string;
  label: string;
};

export type PostBodyBlock = {
  kind: "p" | "h2";
  text: string;
};

export type Post = {
  slug: string;
  authorName: string;
  dateIso: string;
  title: string;
  summary: string;
  cover: {
    src: string;
    alt: string;
  };
  topic?: ContentRef;
  tags?: ContentRef[];
  body: PostBodyBlock[];
};

export type ListPostsResult = {
  items: Post[];
  total: number;
};

export type ListPostsOptions = {
  limit?: number;
  offset?: number;
};
