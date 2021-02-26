import React, { MouseEvent } from 'react';
import { clipboard } from 'electron';
import { Tag, Divider } from 'antd';
import styles from './VariableTags.module.scss';

export default function VariableTags() {
  const handleTagClick = (event: MouseEvent) => {
    const el: HTMLElement = event.target as HTMLElement;
    if (el.className.includes('ant-tag')) {
      const content = el.textContent as string;
      clipboard.writeText(`{${content}}`);
    }
  };

  return (
    <>
      <Divider orientation="left">Variables</Divider>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div className={styles.tagWrapper} onClick={handleTagClick}>
        <Tag color="magenta">YYYY</Tag>
        <Tag color="red">MM</Tag>
        <Tag color="volcano">DD</Tag>
        <Tag color="orange">hh</Tag>
        <Tag color="gold">mm</Tag>
        <Tag color="green">ss</Tag>
        <Tag color="cyan">sequence</Tag>
        <Tag color="blue">make</Tag>
        <Tag color="geekblue">model</Tag>
        <Tag color="purple">lens</Tag>
      </div>
    </>
  );
}

export function getVarMap(sequence: string) {
  return {
    '{YYYY}': '2020',
    '{MM}': '12',
    '{DD}': '31',
    '{hh}': '09',
    '{mm}': '30',
    '{ss}': '00',
    '{sequence}': sequence,
    '{make}': 'SONY',
    '{model}': 'ILCE-7M3',
    '{lens}': 'FE 35mm F1.8',
  };
}
