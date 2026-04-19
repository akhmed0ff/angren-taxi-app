'use client';

import { useEffect, useState } from 'react';
import { Tag, Button, Space, Input, Select, Avatar, Tooltip, Modal, Form, message } from 'antd';
import { SearchOutlined, UserOutlined, StopOutlined, CheckOutlined } from '@ant-design/icons';
import DataTable from '@/components/common/DataTable';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers, blockUserThunk } from '@/store/slices/usersSlice';
import { USER_STATUS_COLORS, USER_STATUS_LABELS } from '@/utils/constants';
import { formatCurrency, formatDate, formatNumber, formatPhone } from '@/utils/formatters';
import type { User } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

export default function UsersTable() {
  const dispatch = useAppDispatch();
  const { list, total, page, isLoading } = useAppSelector((s) => s.users);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [blockModal, setBlockModal] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });
  const [form] = Form.useForm<{ reason: string }>();

  const loadUsers = (p = 1, limit = 20) => {
    void dispatch(fetchUsers({ page: p, limit, search, status: statusFilter }));
  };

  useEffect(() => {
    loadUsers();
  }, [search, statusFilter]);

  const handleBlock = async () => {
    try {
      const { reason } = await form.validateFields();
      if (blockModal.userId) {
        await dispatch(blockUserThunk({ id: blockModal.userId, reason }));
        message.success('Пользователь заблокирован');
        setBlockModal({ open: false, userId: null });
        form.resetFields();
      }
    } catch {
      // form validation error
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Пользователь',
      key: 'user',
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: '#1677ff' }} />
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
      width: 120,
      render: (status: string) => (
        <Tag color={USER_STATUS_COLORS[status]}>{USER_STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: 'Город',
      dataIndex: 'city',
      width: 120,
    },
    {
      title: 'Заказов',
      dataIndex: 'totalOrders',
      width: 100,
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'Потрачено',
      dataIndex: 'totalSpent',
      width: 160,
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Рейтинг',
      dataIndex: 'rating',
      width: 90,
      render: (v: number) => `⭐ ${v.toFixed(1)}`,
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'registeredAt',
      width: 150,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Tooltip title={record.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}>
          <Button
            size="small"
            danger={record.status !== 'blocked'}
            type="text"
            icon={record.status === 'blocked' ? <CheckOutlined /> : <StopOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              if (record.status !== 'blocked') {
                setBlockModal({ open: true, userId: record.id });
              }
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Поиск по имени или телефону"
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
          <Option value="active">Активен</Option>
          <Option value="blocked">Заблокирован</Option>
          <Option value="pending">На проверке</Option>
        </Select>
      </Space>

      <DataTable
        columns={columns}
        data={list}
        total={total}
        page={page}
        loading={isLoading}
        onPageChange={(p, ps) => loadUsers(p, ps)}
        scroll={{ x: 1000 }}
      />

      <Modal
        title="Блокировка пользователя"
        open={blockModal.open}
        onOk={handleBlock}
        onCancel={() => { setBlockModal({ open: false, userId: null }); form.resetFields(); }}
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
