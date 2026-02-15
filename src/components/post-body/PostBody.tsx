'use client';

import type { ReactNode } from 'react';
import styles from './PostBody.module.css';

export function PostBody(props: { children: ReactNode }) {
  return <div className={styles.content}>{props.children}</div>;
}
