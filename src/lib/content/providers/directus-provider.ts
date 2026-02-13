import type { ContentProvider } from '@/lib/content/provider';

function notReady(): never {
  throw new Error(
    'Directus provider is not enabled yet. Keep using demo provider. ' +
      'When you are ready, replace this stub with real Directus fetching + mapping.',
  );
}

export const directusProvider: ContentProvider = {
  async listPosts() {
    notReady();
  },
  async getPostBySlug() {
    notReady();
  },
  async listAllSlugs() {
    notReady();
  },
};
