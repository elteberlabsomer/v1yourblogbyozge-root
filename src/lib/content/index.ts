import { directusProvider } from "@/lib/content/providers/directus-provider";

const hasDirectusUrl = Boolean(process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL);

if (!hasDirectusUrl) {
  throw new Error("DIRECTUS_URL is required (Netlify Production env is missing it).");
}

export const content = directusProvider;
