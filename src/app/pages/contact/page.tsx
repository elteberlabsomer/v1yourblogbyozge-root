import type { Metadata } from 'next';

import { ContactCard } from '@/components/contact/ContactCard';

export const metadata: Metadata = {
  title: 'Contact',
};

export default function ContactPage() {
  return (
    <section className="l-section">
      <div className="l-container">
        <ContactCard />
      </div>
    </section>
  );
}
