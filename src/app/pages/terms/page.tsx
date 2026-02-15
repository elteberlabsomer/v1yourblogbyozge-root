import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updatedAtIso="2026-02-08">
      <p>
        These Terms & Conditions govern your use of <strong>Your Blog ByOzge</strong>. By accessing
        or using the site, you agree to these terms.
      </p>

      <h2>Use of the website</h2>
      <ul>
        <li>You may use the site for lawful purposes only.</li>
        <li>You agree not to attempt to disrupt, damage, or gain unauthorized access to the site.</li>
        <li>You agree not to misuse forms or submission features.</li>
      </ul>

      <h2>Content</h2>
      <p>
        Unless stated otherwise, the content on this site is owned by the site operator and is
        protected by applicable intellectual property laws. You may not copy, reproduce, or
        redistribute content without permission, except where allowed by law.
      </p>

      <h2>Related policies</h2>
      <p>
        Please review our <Link href="/pages/privacy">Privacy Policy</Link> and{' '}
        <Link href="/pages/cookies">Cookie Policy</Link>.
      </p>

      <h2>Third-party services</h2>
      <p>
        The site may use third-party services such as hosting (Cloudflare Pages) and analytics
        (Google Analytics). See our <Link href="/pages/privacy">Privacy Policy</Link> and{' '}
        <Link href="/pages/cookies">Cookie Policy</Link> for more details.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The website is provided on an “as is” and “as available” basis. We do not make warranties of
        any kind, express or implied, regarding the accuracy, completeness, or reliability of the
        content.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the site operator shall not be liable for any
        indirect, incidental, special, consequential, or punitive damages arising out of or related
        to your use of the site.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The “Last updated” date at the top of this
        page indicates when changes were made.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the Republic of Turkey, without regard to conflict
        of law principles. Any disputes arising from these Terms shall be subject to the exclusive
        jurisdiction of the courts of Istanbul, Turkey.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about these terms, please email{' '}
        <strong>gulemeyenosgeguler@gmail.com</strong> or use the{' '}
        <Link href="/pages/contact">contact</Link> page.
      </p>
    </LegalPage>
  );
}
