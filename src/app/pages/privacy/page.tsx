import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updatedAtIso="2026-02-08">
      <p>
        This Privacy Policy explains how we collect, use, and protect information when you use{' '}
        <strong>Your Blog ByOzge</strong>.
      </p>

      <h2>Site operator</h2>
      <p>
        <strong>Operator:</strong> Özge Güler
        <br />
        <strong>Contact:</strong> gulemeyenosgeguler@gmail.com
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Basic usage data:</strong> technical data such as IP address, user agent, and
          request metadata may be processed for security and reliability.
        </li>
        <li>
          <strong>Newsletter data:</strong> if you subscribe, we collect your email address to send
          updates.
        </li>
        <li>
          <strong>Contact messages:</strong> if you send a message through the contact page, we
          receive your message content and contact details you choose to provide.
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, maintain, and secure the website.</li>
        <li>To respond to messages and support requests.</li>
        <li>To send newsletters if you opt in.</li>
        <li>To understand traffic and improve content and usability.</li>
      </ul>

      <h2>Newsletter</h2>
      <p>
        If you subscribe to our newsletter, we use your email address to send updates. Every
        newsletter includes an unsubscribe link, and you can opt out at any time.
      </p>

      <h2>Analytics</h2>
      <p>
        We use <strong>Google Analytics</strong> to understand how visitors use the website and to
        improve content and usability. Google Analytics may set <strong>analytics cookies</strong>{' '}
        and process usage data (such as pages viewed, approximate location, and device information).
        Data retention is handled <strong>as configured in our Google Analytics settings</strong>.
      </p>
      <p>
        For details about cookies, see <Link href="/pages/cookies">Cookie Policy</Link>.
      </p>

      <h2>Hosting and service providers</h2>
      <p>
        This website is hosted on <strong>Cloudflare Pages</strong>. Cloudflare may process limited
        technical data (such as IP address and request metadata) to deliver the site, improve
        performance, and help protect against abuse.
      </p>

      <h2>Contact messages</h2>
      <p>
        If you contact us through the contact page, your message is delivered to our email inbox (
        <strong>gulemeyenosgeguler@gmail.com</strong>). We use this information only to respond and
        provide support. We retain messages as long as necessary for support and record-keeping, and
        delete them when no longer needed.
      </p>

      <h2>Sharing and third parties</h2>
      <p>
        We do not sell personal information. We may share limited data with service providers that
        help run the site (such as hosting and analytics), only as needed to provide the service.
      </p>

      <h2>International data processing</h2>
      <p>
        Service providers such as Cloudflare and Google may process data in countries other than
        your own. Where applicable, we rely on the safeguards and legal mechanisms provided by these
        providers.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>You can unsubscribe from the newsletter at any time using the link in our emails.</li>
        <li>
          You can control cookies through your browser settings (see{' '}
          <Link href="/pages/cookies">Cookie Policy</Link>).
        </li>
      </ul>

      <h2>Contact</h2>
      <p>
        If you have questions about this policy, please email{' '}
        <strong>gulemeyenosgeguler@gmail.com</strong> or use the{' '}
        <Link href="/pages/contact">contact</Link> page.
      </p>
    </LegalPage>
  );
}
