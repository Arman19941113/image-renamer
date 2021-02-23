import React from 'react';
import DragArea, { UpdateFilePaths } from '@/components/DragArea';
import styles from './Home.module.scss';

export default function Index() {
  let filePaths: string[] = [];
  const updateFilePaths: UpdateFilePaths = paths => {
    filePaths = paths;
    console.log(filePaths);
  };
  return (
    <div className={styles.homeWrapper}>
      <DragArea updateFilePaths={updateFilePaths} />
    </div>
  );
}
