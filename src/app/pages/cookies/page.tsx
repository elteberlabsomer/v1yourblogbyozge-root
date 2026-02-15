import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalPage } from '@/components/legal/LegalPage';
import { ProseTableWrap } from '@/components/prose/Prose';

export const metadata: Metadata = {
  title: 'Cookie Policy',
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updatedAtIso="2026-02-08">
      <p>This Cookie Policy explains what cookies are and how they may be used on this website.</p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device. They may be used to provide core
        functionality, improve performance, and understand how the site is used.
      </p>

      <h2>Types of cookies</h2>
      <ProseTableWrap>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Purpose</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Strictly necessary</td>
              <td>
                Required for core site functionality, security, and performance delivery (including
                Cloudflare).
              </td>
              <td>Used</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>
                Google Analytics cookies (e.g., <code>_ga</code> and related cookies) to measure
                traffic and usage patterns.
              </td>
              <td>Used</td>
            </tr>
            <tr>
              <td>Marketing</td>
              <td>Advertising and tracking across sites.</td>
              <td>Not used</td>
            </tr>
          </tbody>
        </table>
      </ProseTableWrap>

      <h2>Managing cookies</h2>
      <p>
        You can control cookies through your browser settings. Please note that disabling certain
        cookies may affect site functionality.
      </p>

      <h2>Questions</h2>
      <p>
        For privacy-related information, see <Link href="/pages/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
