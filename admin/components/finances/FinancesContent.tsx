'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tag, Select, Space, Statistic, Flex } from 'antd';
import { DollarOutlined, WalletOutlined, ArrowUpOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Transaction } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import { paymentsService } from '@/services/payments.service';
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
} from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

const { Option } = Select;

interface Summary {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  pendingPayouts: number;
}

export default function FinancesContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState<Summary | null>(null);

  const loadData = async (p = 1) => {
    setLoading(true);
    try {
      const [res, sum] = await Promise.all([
        paymentsService.getTransactions({ page: p, limit: 20, type: typeFilter }),
        paymentsService.getFinanceSummary(),
      ]);
      setTransactions(res.data);
      setTotal(res.total);
      setSummary(sum);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(page);
  }, [page, typeFilter]);

  const columns: ColumnsType<Transaction> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
      render: (v: string) => `#${v}`,
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      width: 140,
      render: (type: string) => (
        <Tag color={TRANSACTION_TYPE_COLORS[type]}>{TRANSACTION_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: 'Сторона',
      dataIndex: 'relatedName',
      width: 160,
      render: (v: string) => v ?? '—',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      width: 160,
      sorter: (a, b) => a.amount - b.amount,
      render: (v: number, r) => (
        <span
          style={{
            fontWeight: 700,
            color: r.type === 'payout' || r.type === 'refund' ? '#ff4d4f' : '#52c41a',
          }}
        >
          {r.type === 'payout' || r.type === 'refund' ? '-' : '+'}{formatCurrency(v)}
        </span>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 120,
      render: (s: string) => (
        <Tag color={s === 'completed' ? 'success' : s === 'pending' ? 'warning' : 'error'}>
          {s === 'completed' ? 'Завершено' : s === 'pending' ? 'В ожидании' : 'Ошибка'}
        </Tag>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => formatDateTime(v),
    },
  ];

  return (
    <div>
      {/* Summary cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Общая выручка"
              value={formatCurrency(summary?.totalRevenue ?? 0)}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Комиссия платформы"
              value={formatCurrency(summary?.totalCommission ?? 0)}
              prefix={<ArrowUpOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Выплачено водителям"
              value={formatCurrency(summary?.totalPayouts ?? 0)}
              prefix={<WalletOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ожидают выплаты"
              value={formatCurrency(summary?.pendingPayouts ?? 0)}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Transactions table */}
      <Card
        title="Транзакции"
        extra={
          <Select
            placeholder="Тип транзакции"
            allowClear
            value={typeFilter}
            onChange={(v) => { setTypeFilter(v); setPage(1); }}
            style={{ width: 160 }}
          >
            {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => (
              <Option key={k} value={k}>{v}</Option>
            ))}
          </Select>
        }
        bodyStyle={{ padding: 0 }}
      >
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showTotal: (t, r) => `${r[0]}-${r[1]} из ${t}`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>
    </div>
  );
}
