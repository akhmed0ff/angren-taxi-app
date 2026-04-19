'use client';

import { useEffect, useState } from 'react';
import { Tag, Button, Space, Input, Select, Avatar, Tooltip, Modal, Form, message, Badge } from 'antd';
import { SearchOutlined, UserOutlined, StopOutlined, CheckOutlined } from '@ant-design/icons';
import DataTable from '@/components/common/DataTable';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDrivers, blockDriverThunk, approveDriverThunk } from '@/store/slices/driversSlice';
import {
  DRIVER_STATUS_COLORS,
  DRIVER_STATUS_LABELS,
  VEHICLE_CATEGORY_LABELS,
} from '@/utils/constants';
import { formatCurrency, formatDate, formatNumber, formatPhone } from '@/utils/formatters';
import type { Driver } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

export default function DriversTable() {
  const dispatch = useAppDispatch();
  const { list, total, page, isLoading } = useAppSelector((s) => s.drivers);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [blockModal, setBlockModal] = useState<{ open: boolean; driverId: string | null }>({
    open: false,
    driverId: null,
  });
  const [form] = Form.useForm<{ reason: string }>();

  const loadDrivers = (p = 1, limit = 20) => {
    void dispatch(
      fetchDrivers({ page: p, limit, search, status: statusFilter, category: categoryFilter }),
    );
  };

  useEffect(() => {
    loadDrivers();
  }, [search, statusFilter, categoryFilter]);

  const handleBlock = async () => {
    try {
      const { reason } = await form.validateFields();
      if (blockModal.driverId) {
        await dispatch(blockDriverThunk({ id: blockModal.driverId, reason }));
        message.success('Водитель заблокирован');
        setBlockModal({ open: false, driverId: null });
        form.resetFields();
      }
    } catch {
      // validation error
    }
  };

  const handleApprove = async (id: string) => {
    await dispatch(approveDriverThunk(id));
    message.success('Водитель подтверждён');
  };

  const columns: ColumnsType<Driver> = [
    {
      title: 'Водитель',
      key: 'driver',
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <Space>
          <Badge dot color={record.isOnline ? 'green' : 'gray'} offset={[-4, 32]}>
            <Avatar icon={<UserOutlined />} style={{ background: '#722ed1' }} />
          </Badge>
          <div>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{formatPhone(record.phone)}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 130,
      render: (status: string) => (
        <Tag color={DRIVER_STATUS_COLORS[status]}>{DRIVER_STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: 'Автомобиль',
      key: 'vehicle',
      width: 200,
      render: (_, record) => (
        <div>
          <div>
            {record.vehicle.brand} {record.vehicle.model} ({record.vehicle.year})
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.vehicle.plateNumber} · {record.vehicle.color}
          </div>
        </div>
      ),
    },
    {
      title: 'Категория',
      key: 'category',
      width: 110,
      render: (_, record) => (
        <Tag>{VEHICLE_CATEGORY_LABELS[record.vehicle.category]}</Tag>
      ),
    },
    {
      title: 'Рейтинг',
      dataIndex: 'rating',
      width: 90,
      sorter: (a, b) => a.rating - b.rating,
      render: (v: number) => `⭐ ${v.toFixed(1)}`,
    },
    {
      title: 'Поездок',
      dataIndex: 'totalTrips',
      width: 100,
      sorter: (a, b) => a.totalTrips - b.totalTrips,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'Заработано',
      dataIndex: 'totalEarnings',
      width: 160,
      sorter: (a, b) => a.totalEarnings - b.totalEarnings,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Город',
      dataIndex: 'city',
      width: 110,
    },
    {
      title: 'Регистрация',
      dataIndex: 'registeredAt',
      width: 130,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Tooltip title="Подтвердить">
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={(e) => { e.stopPropagation(); void handleApprove(record.id); }}
              />
            </Tooltip>
          )}
          {record.status !== 'blocked' && record.status !== 'pending' && (
            <Tooltip title="Заблокировать">
              <Button
                size="small"
                danger
                type="text"
                icon={<StopOutlined />}
                onClick={(e) => { e.stopPropagation(); setBlockModal({ open: true, driverId: record.id }); }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Поиск по имени, телефону, гос. номеру"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          placeholder="Статус"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
        >
          {Object.entries(DRIVER_STATUS_LABELS).map(([k, v]) => (
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
        onPageChange={(p, ps) => loadDrivers(p, ps)}
        scroll={{ x: 1300 }}
      />

      <Modal
        title="Блокировка водителя"
        open={blockModal.open}
        onOk={handleBlock}
        onCancel={() => { setBlockModal({ open: false, driverId: null }); form.resetFields(); }}
        okText="Заблокировать"
        okButtonProps={{ danger: true }}
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Причина блокировки"
            rules={[{ required: true, message: 'Укажите причину' }]}
          >
            <Input.TextArea rows={3} placeholder="Опишите причину блокировки..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
