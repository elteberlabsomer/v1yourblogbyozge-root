import { NextResponse } from 'next/server';

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  consent: boolean;
  website?: string;
  pageUrl?: string;
  userAgent?: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

export async function POST(req: Request) {
  const directusUrl = process.env.DIRECTUS_URL;
  const directusToken = process.env.DIRECTUS_TOKEN;

  if (!directusUrl || !directusToken) {
    return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
  }

  const data = (await req.json().catch(() => null)) as ContactPayload | null;
  if (!data) {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { name, email, message, consent, website, pageUrl, userAgent } = data;

  if (isNonEmptyString(website)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!isNonEmptyString(name)) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  if (!isNonEmptyString(email)) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  if (!isNonEmptyString(message)) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  if (consent !== true) {
    return NextResponse.json({ error: 'Consent is required.' }, { status: 400 });
  }

  const safeName = clamp(name.trim(), 80);
  const safeEmail = clamp(normalizeEmail(email), 120);
  const safeMessage = clamp(message.trim(), 4000);

  const payload = {
    name: safeName,
    email: safeEmail,
    message: safeMessage,
    consent: true,
    page_url: isNonEmptyString(pageUrl) ? clamp(pageUrl.trim(), 300) : null,
    user_agent: isNonEmptyString(userAgent) ? clamp(userAgent.trim(), 300) : null,
  };

  const res = await fetch(`${directusUrl.replace(/\/$/, '')}/items/contact_messages`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${directusToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!res) {
    return NextResponse.json({ error: 'Request failed.' }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'Unable to submit message.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
