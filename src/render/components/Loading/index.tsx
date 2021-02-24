import React from 'react';
import styles from './Loading.module.scss';

export default function Loading() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.dotsWrapper}>
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
