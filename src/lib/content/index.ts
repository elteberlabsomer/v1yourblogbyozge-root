import { demoPostsProvider } from '@/lib/content/providers/demo-posts-provider';
import { directusProvider } from '@/lib/content/providers/directus-provider';

const useDirectus =
  process.env.CONTENT_PROVIDER === 'directus' ||
  Boolean(process.env.DIRECTUS_URL) ||
  Boolean(process.env.NEXT_PUBLIC_DIRECTUS_URL);

export const content = useDirectus ? directusProvider : demoPostsProvider;
