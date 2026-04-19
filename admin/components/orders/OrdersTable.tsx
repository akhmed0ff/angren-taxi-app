'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tag, Space, Input, Select, Drawer, Descriptions, Rate } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DataTable from '@/components/common/DataTable';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrders } from '@/store/slices/ordersSlice';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  VEHICLE_CATEGORY_LABELS,
} from '@/utils/constants';
import {
  formatCurrency,
  formatDateTime,
  formatDistance,
  formatDuration,
  formatPhone,
} from '@/utils/formatters';
import type { Order } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

export default function OrdersTable() {
  const dispatch = useAppDispatch();
  const { list, total, page, isLoading } = useAppSelector((s) => s.orders);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const loadOrders = useCallback((p = 1, limit = 20) => {
    void dispatch(fetchOrders({ page: p, limit, search, status: statusFilter, category: categoryFilter }));
  }, [dispatch, search, statusFilter, categoryFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const columns: ColumnsType<Order> = [
    {
      title: '#',
      dataIndex: 'id',
      width: 80,
      render: (id: string) => <span style={{ fontWeight: 600 }}>#{id}</span>,
    },
    {
      title: 'Пассажир',
      key: 'user',
      width: 160,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.userName}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{formatPhone(r.userPhone)}</div>
        </div>
      ),
    },
    {
      title: 'Водитель',
      key: 'driver',
      width: 160,
      render: (_, r) =>
        r.driverName ? (
          <div>
            <div style={{ fontWeight: 600 }}>{r.driverName}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.driverPhone ? formatPhone(r.driverPhone) : ''}</div>
          </div>
        ) : (
          <span style={{ color: '#bfbfbf' }}>—</span>
        ),
    },
    {
      title: 'Откуда → Куда',
      key: 'route',
      width: 260,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <div>📍 {r.from.address}</div>
          <div>🏁 {r.to.address}</div>
        </div>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 140,
      render: (s: string) => (
        <Tag color={ORDER_STATUS_COLORS[s]}>{ORDER_STATUS_LABELS[s]}</Tag>
      ),
    },
    {
      title: 'Категория',
      key: 'category',
      width: 110,
      render: (_, r) => <Tag>{VEHICLE_CATEGORY_LABELS[r.category]}</Tag>,
    },
    {
      title: 'Сумма',
      dataIndex: 'price',
      width: 140,
      sorter: (a, b) => a.price - b.price,
      render: (v: number) => <span style={{ fontWeight: 600, color: '#52c41a' }}>{formatCurrency(v)}</span>,
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      width: 150,
      render: (v: string) => formatDateTime(v),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Поиск по #, пассажиру, адресу"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <Select
          placeholder="Статус"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
        >
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
            <Option key={k} value={k}>{v}</Option>
          ))}
        </Select>
        <Select
          placeholder="Категория"
          allowClear
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 140 }}
        >
          {Object.entries(VEHICLE_CATEGORY_LABELS).map(([k, v]) => (
            <Option key={k} value={k}>{v}</Option>
          ))}
        </Select>
      </Space>

      <DataTable
        columns={columns}
        data={list}
        total={total}
        page={page}
        loading={isLoading}
        onPageChange={(p, ps) => loadOrders(p, ps)}
        onRow={(record) => ({ onClick: () => setDetailOrder(record), style: { cursor: 'pointer' } })}
        scroll={{ x: 1300 }}
      />

      <Drawer
        title={`Заказ #${detailOrder?.id}`}
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        width={480}
      >
        {detailOrder && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Статус">
              <Tag color={ORDER_STATUS_COLORS[detailOrder.status]}>
                {ORDER_STATUS_LABELS[detailOrder.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Пассажир">
              {detailOrder.userName} · {formatPhone(detailOrder.userPhone)}
            </Descriptions.Item>
            <Descriptions.Item label="Водитель">
              {detailOrder.driverName ? `${detailOrder.driverName} · ${formatPhone(detailOrder.driverPhone ?? '')}` : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Откуда">{detailOrder.from.address}</Descriptions.Item>
            <Descriptions.Item label="Куда">{detailOrder.to.address}</Descriptions.Item>
            <Descriptions.Item label="Расстояние">{formatDistance(detailOrder.distance)}</Descriptions.Item>
            <Descriptions.Item label="Время в пути">{formatDuration(detailOrder.duration)}</Descriptions.Item>
            <Descriptions.Item label="Категория">{VEHICLE_CATEGORY_LABELS[detailOrder.category]}</Descriptions.Item>
            <Descriptions.Item label="Оплата">{PAYMENT_METHOD_LABELS[detailOrder.paymentMethod]}</Descriptions.Item>
            <Descriptions.Item label="Сумма">
              <strong style={{ color: '#52c41a' }}>{formatCurrency(detailOrder.price)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Создан">{formatDateTime(detailOrder.createdAt)}</Descriptions.Item>
            {detailOrder.completedAt && (
              <Descriptions.Item label="Завершён">{formatDateTime(detailOrder.completedAt)}</Descriptions.Item>
            )}
            {detailOrder.cancelReason && (
              <Descriptions.Item label="Причина отмены">{detailOrder.cancelReason}</Descriptions.Item>
            )}
            {detailOrder.rating && (
              <Descriptions.Item label="Оценка">
                <Rate disabled defaultValue={detailOrder.rating} />
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}
