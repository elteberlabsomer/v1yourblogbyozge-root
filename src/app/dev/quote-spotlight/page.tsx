import { QuoteSpotlight } from '@/components/quote-spotlight/QuoteSpotlight';

import styles from './page.module.css';

export default function Page() {
  return (
    <main className={styles.root}>
      <div className={styles.container}>
        <QuoteSpotlight />
      </div>
    </main>
  );
}
