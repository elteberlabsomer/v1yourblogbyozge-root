import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
    },
  });
}

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return new NextResponse('Admin credentials are not configured.', {
      status: 500,
    });
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Basic ')) {
    return unauthorized();
  }

  const encoded = authHeader.slice(6).trim();
  const decoded = atob(encoded);
  const separatorIndex = decoded.indexOf(':');

  if (separatorIndex === -1) {
    return unauthorized();
  }

  const inputUsername = decoded.slice(0, separatorIndex);
  const inputPassword = decoded.slice(separatorIndex + 1);

  if (inputUsername !== username || inputPassword !== password) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/list', '/tags'],
};
