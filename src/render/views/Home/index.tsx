import React, { useState, useEffect } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import DragArea, { StartRename } from '@/views/Home/DragArea';
import RenameConfig from '@/views/Home/RenameConfig';
import Loading from '@/components/Loading';
import styles from './Home.module.scss';

export default function Home() {
  const [showLoading, setLoading] = useState(false);

  // drag or select files
  const startRename: StartRename = filePaths => {
    if (filePaths.length) {
      setLoading(true);
      console.log(filePaths);
      ipcRenderer.send('start-rename', filePaths);
    }
  };

  useEffect(() => {
    // images rename work is done, show the result
    const handleFilesRenamed = (event: IpcRendererEvent, arg: any): void => {
      console.log(event);
      console.log(arg);
      setLoading(false);
      // result dialog todo
    };
    ipcRenderer.on('files-renamed', handleFilesRenamed);

    return () => {
      ipcRenderer.off('files-renamed', handleFilesRenamed);
    };
  }, []);

  return (
    <div className={styles.homeWrapper}>
      <DragArea startRename={startRename} />
      <RenameConfig />
      {showLoading && <Loading />}
    </div>
  );
}
