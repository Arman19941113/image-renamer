import React, { useState, useEffect } from 'react';
import { Modal, Table, Tooltip } from 'antd';
import { RenameResults } from '@/shared/types/root';
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
          render={(value, record) =>
            record.message ? (
              <div className={styles.error}>
                <Tooltip title={record.message}>
                  <div>{value}</div>
                </Tooltip>
              </div>
            ) : (
              <div className={styles.success}>{value}</div>
            )
          }
        />
      </Table>
    </Modal>
  );
}
