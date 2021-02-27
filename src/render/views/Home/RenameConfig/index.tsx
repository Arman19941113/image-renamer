import React, { useMemo, ChangeEvent, Dispatch } from 'react';
import VariableTags, { getVarMap } from '@/views/Home/VariableTags';
import { Input, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { Config, ConfigAction } from '@/shared/types/root';
import styles from './RenameConfig.module.scss';

export default function RenameConfig({
  config,
  dispatchConfig,
}: {
  config: Config;
  dispatchConfig: Dispatch<ConfigAction>;
}) {
  const handleSequenceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.match(/[^0-9]/)) return;

    dispatchConfig({
      type: 'sequence',
      payload: event.target.value,
    });
  };

  const handleChecked = (event: CheckboxChangeEvent) => {
    dispatchConfig({
      type: 'recursive',
      payload: event.target.checked,
    });
  };

  const handleFormatChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.match(/[\\/:*?<>|]/)) return;

    dispatchConfig({
      type: 'format',
      payload: value.trim(),
    });
  };

  const previewFormat = useMemo(() => {
    const varMap = getVarMap(config.sequence || '0');
    let { format } = config;
    Object.entries(varMap).forEach(([key, value]) => {
      format = format.replaceAll(key, value);
    });
    return format;
  }, [config]);

  return (
    <div className={styles.renameConfigWrapper}>
      <div className={styles.flexBox}>
        <div className={styles.label}>Starting sequence number:</div>
        <div className={styles.labelRight}>
          <Input value={config.sequence} onChange={handleSequenceChange} />
          <Checkbox className={styles.recursiveCheckbox} checked={config.recursive} onChange={handleChecked}>
            Recursive mode
          </Checkbox>
        </div>
      </div>
      <div className={styles.flexBox}>
        <div className={styles.label}>Format of the new file name:</div>
        <Input className={styles.labelRight} spellCheck={false} value={config.format} onChange={handleFormatChange} />
      </div>
      <div className={styles.flexBox}>
        <div className={styles.label}>Preview the new file name:</div>
        <Input readOnly className={styles.labelRight} value={previewFormat} />
      </div>
      <VariableTags />
    </div>
  );
}
