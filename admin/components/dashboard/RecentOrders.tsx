'use client';

import { useEffect } from 'react';
import { Card, Table, Tag, Typography, Button } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrders } from '@/store/slices/ordersSlice';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants';
import { formatCurrency, formatRelative } from '@/utils/formatters';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function RecentOrders() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list, isLoading } = useAppSelector((s) => s.orders);

  useEffect(() => {
    void dispatch(fetchOrders({ page: 1, limit: 8 }));
  }, []);

  const columns = [
    {
      title: 'Заказ',
      key: 'order',
      render: (_: unknown, record: (typeof list)[0]) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>#{record.id}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.userName}</div>
        </div>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={ORDER_STATUS_COLORS[status]} style={{ fontSize: 11 }}>
          {ORDER_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'price',
      render: (price: number) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>{formatCurrency(price)}</span>
      ),
    },
    {
      title: 'Время',
      dataIndex: 'createdAt',
      render: (date: string) => (
        <span style={{ fontSize: 11, color: '#8c8c8c' }}>{formatRelative(date)}</span>
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CarOutlined />
          <Title level={5} style={{ margin: 0 }}>Последние заказы</Title>
        </div>
      }
      extra={
        <Button size="small" type="link" onClick={() => router.push('/orders')}>
          Все заказы
        </Button>
      }
      bodyStyle={{ padding: 0 }}
    >
      <Table
        dataSource={list.slice(0, 8)}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        size="small"
        onRow={(record) => ({ onClick: () => router.push(`/orders?id=${record.id}`) })}
        style={{ cursor: 'pointer' }}
      />
    </Card>
  );
}
