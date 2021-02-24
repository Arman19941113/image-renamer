import React, { DragEvent, useState } from 'react';
import { remote } from 'electron';
import appStyles from '@/styles/App.module.scss';
import styles from './DragArea.module.scss';

export interface StartRename {
  (filePaths: string[]): void;
}

export interface DragAreaProps {
  startRename: StartRename;
}

export default function DragArea(props: DragAreaProps) {
  const { startRename } = props;

  const handleSelect = (): void => {
    remote.dialog
      .showOpenDialog(remote.getCurrentWindow(), {
        properties: ['openFile', 'openDirectory', 'multiSelections'],
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg'] }],
      })
      .then(res => {
        startRename(res.filePaths);
        return null;
      })
      .catch(err => {
        console.error(err);
      });
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragover = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    const { files } = event.dataTransfer;
    if (files.length) {
      const filePaths = Array.from(files).map(file => file.path);
      startRename(filePaths);
    }
  };

  return (
    <div
      aria-hidden
      className={`${styles.dragWrapper} ${isDragging ? styles.active : ''}`}
      onDragOver={handleDragover}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
      <div>
        <span>Drop or </span>
        <button className={appStyles.buttonText} onClick={handleSelect}>
          Select
        </button>
        <span> jpg files to start rename</span>
      </div>
    </div>
  );
}
