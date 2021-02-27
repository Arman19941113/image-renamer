import React, { useState, useEffect } from 'react';
import { Modal, Table, Tooltip } from 'antd';
import { RenameResult, RenameResults } from '@/shared/types/root';
import styles from './ResultModal.module.scss';

export default function ResultModel({
  renameResults,
  clearRenameResults,
}: {
  renameResults: RenameResults;
  clearRenameResults: () => void;
}) {
  const [modalWidth, setModalWidth] = useState(0);
  const [tableHeight, setTableHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setModalWidth(document.documentElement.clientWidth - 220);
      setTableHeight(document.documentElement.clientHeight - 360);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Modal
      title="Rename done"
      destroyOnClose
      footer={null}
      width={modalWidth}
      maskClosable={false}
      visible={Boolean(renameResults.length)}
      onCancel={clearRenameResults}>
      <Table
        size="small"
        rowKey="prePath"
        pagination={false}
        className={styles.tableWrapper}
        rowClassName={styles.columnWrapper}
        scroll={{ y: tableHeight }}
        dataSource={renameResults}>
        <Table.Column title="Filename Previously" dataIndex="prePath" />
        <Table.Column
          title="Filename currently"
          dataIndex="newPath"
          render={(newPath: string, renameResult: RenameResult) =>
            renameResult.message ? (
              <div className={styles.error}>
                <Tooltip title={renameResult.message}>
                  <div>{newPath}</div>
                </Tooltip>
              </div>
            ) : (
              <div className={styles.success}>{newPath}</div>
            )
          }
        />
      </Table>
    </Modal>
  );
}
