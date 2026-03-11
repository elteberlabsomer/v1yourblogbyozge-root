import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const directusUrl = process.env.DIRECTUS_URL;
  const directusToken = process.env.DIRECTUS_TOKEN;

  if (!directusUrl || !directusToken) {
    return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
  }

  const data = await req.json().catch(() => null);
  if (!data?.email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const email = String(data.email).trim().toLowerCase();

  const res = await fetch(`${directusUrl.replace(/\/$/, '')}/items/newsletter_subscriber`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${directusToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email }),
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ error: 'Unable to subscribe.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}