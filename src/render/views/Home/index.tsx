import React, { useState, useReducer, useEffect } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import DragArea from '@/views/Home/DragArea';
import RenameConfig from '@/views/Home/RenameConfig';
import Loading from '@/components/Loading';
import ResultModal from '@/views/Home/ResultModal';
import { Config, ConfigAction, StartRename, RenameResults } from '@/shared/types/root';
import styles from './Home.module.scss';

const memoryConfig = localStorage.getItem('memoryConfig');
const defaultConfig = {
  format: '{YYYY}-{MM}-{DD} {hh}{mm}{ss}-{sequence} {make} {model} {lens}',
  sequence: '001',
  recursive: true,
  remove: false, // remove files without exif data to desktop
};
const initialConfig: Config = memoryConfig ? JSON.parse(memoryConfig) : defaultConfig;

export default function Home() {
  const [showLoading, setLoading] = useState(false);

  const initialResults: RenameResults = [];
  const [renameResults, setRenameResults] = useState(initialResults);
  const clearRenameResults = () => {
    setRenameResults([]);
  };

  const [config, dispatchConfig] = useReducer((preConfig: Config, action: ConfigAction) => {
    const newConfig = { ...preConfig, [action.type]: action.payload };
    localStorage.setItem('memoryConfig', JSON.stringify(newConfig));
    return newConfig;
  }, initialConfig);

  // drag or select files to rename
  const startRename: StartRename = filePaths => {
    if (filePaths.length) {
      setLoading(true);
      ipcRenderer.send('start-rename', filePaths, config);
    }
  };

  // get renamed results
  useEffect(() => {
    // images rename work is done, show the result
    const handleFilesRenamedSuccess = (_event: IpcRendererEvent, results: RenameResults): void => {
      setLoading(false);
      setRenameResults(results);
    };
    ipcRenderer.on('files-renamed-success', handleFilesRenamedSuccess);

    return () => {
      ipcRenderer.off('files-renamed-success', handleFilesRenamedSuccess);
    };
  }, []);

  return (
    <div className={styles.homeWrapper}>
      <DragArea startRename={startRename} />
      <RenameConfig {...{ config, dispatchConfig }} />
      {showLoading && <Loading />}
      <ResultModal {...{ renameResults, clearRenameResults }} />
    </div>
  );
}
