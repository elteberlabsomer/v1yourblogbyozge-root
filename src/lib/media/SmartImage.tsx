/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import styles from './SmartImage.module.css';
import { isRemoteImage, resolveImageSrc } from '@/lib/media/resolveImageSrc';

type Variant = 'cover' | 'thumb' | 'inline';

type Props = {
  src: string | null | undefined;
  alt: string;
  variant: Variant;
  priority?: boolean;
};

export function SmartImage({ src, alt, variant, priority }: Props) {
  const resolved = resolveImageSrc(src);
  if (!resolved) {
    return null;
  }

  if (isRemoteImage(resolved)) {
    return (
      <figure className={styles.root} data-variant={variant}>
        <img className={styles.img} src={resolved} alt={alt} loading={priority ? 'eager' : 'lazy'} />
      </figure>
    );
  }

  return (
    <figure className={styles.root} data-variant={variant}>
      <Image
        className={styles.img}
        src={resolved}
        alt={alt}
        width={1200}
        height={675}
        priority={Boolean(priority)}
      />
    </figure>
  );
}
