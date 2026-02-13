import type { ReactNode } from 'react';

import styles from './Prose.module.css';

type ProseProps = {
  children: ReactNode;
  className?: string;
};

export function Prose({ children, className }: ProseProps) {
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return <div className={rootClassName}>{children}</div>;
}

type ProseTableWrapProps = {
  children: ReactNode;
};

export function ProseTableWrap({ children }: ProseTableWrapProps) {
  return <div className={styles['table-wrap']}>{children}</div>;
}
