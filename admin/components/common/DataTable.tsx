'use client';

import { Table, Card, type TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataTableProps<T extends object> {
  columns: ColumnsType<T>;
  data: T[];
  total: number;
  page: number;
  pageSize?: number;
  loading?: boolean;
  rowKey?: string | ((record: T) => string);
  onPageChange?: (page: number, pageSize: number) => void;
  onRow?: TableProps<T>['onRow'];
  title?: string;
  extra?: React.ReactNode;
  scroll?: { x?: number | string; y?: number | string };
}

export default function DataTable<T extends object>({
  columns,
  data,
  total,
  page,
  pageSize = 20,
  loading = false,
  rowKey = 'id',
  onPageChange,
  onRow,
  title,
  extra,
  scroll,
}: DataTableProps<T>) {
  return (
    <Card
      title={title}
      extra={extra}
      bodyStyle={{ padding: 0 }}
      style={{ borderRadius: 8 }}
    >
      <Table<T>
        columns={columns}
        dataSource={data}
        rowKey={rowKey}
        loading={loading}
        onRow={onRow}
        scroll={scroll ?? { x: 800 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t, range) => `${range[0]}-${range[1]} из ${t}`,
          onChange: onPageChange,
        }}
        style={{ width: '100%' }}
      />
    </Card>
  );
}
