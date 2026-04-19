'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Table, Tag, Select, Space, Input, Card, Button, Modal, Form, message, Drawer, Typography, Divider, Avatar
} from 'antd';
import { SearchOutlined, CustomerServiceOutlined, SendOutlined } from '@ant-design/icons';
import type { SupportTicket } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import { supportService } from '@/services/support.service';
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_COLORS,
} from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';

const { Option } = Select;
const { Text, Title } = Typography;

export default function SupportContent() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const loadTickets = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await supportService.getTickets({
        page: p,
        limit: 20,
        status: statusFilter,
        priority: priorityFilter,
      });
      setTickets(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    void loadTickets(page);
  }, [page, loadTickets]);

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      await supportService.replyToTicket(selectedTicket.id, replyText);
      message.success('Ответ отправлен');
      setReplyText('');
      void loadTickets(page);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleClose = async (id: string) => {
    await supportService.closeTicket(id);
    message.success('Тикет закрыт');
    setSelectedTicket(null);
    void loadTickets(page);
  };

  const columns: ColumnsType<SupportTicket> = [
    {
      title: '#',
      dataIndex: 'id',
      width: 60,
      render: (v: string) => `#${v}`,
    },
    {
      title: 'Тема',
      dataIndex: 'subject',
      ellipsis: true,
    },
    {
      title: 'Пользователь',
      key: 'user',
      width: 180,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.userName}</div>
          <Tag style={{ fontSize: 10 }}>{r.userType === 'passenger' ? 'Пассажир' : 'Водитель'}</Tag>
        </div>
      ),
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      width: 110,
      render: (v: string) => (
        <Tag color={TICKET_PRIORITY_COLORS[v]}>{TICKET_PRIORITY_LABELS[v]}</Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <Tag color={TICKET_STATUS_COLORS[v]}>{TICKET_STATUS_LABELS[v]}</Tag>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      width: 150,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={(e) => { e.stopPropagation(); setSelectedTicket(record); }}
        >
          Открыть
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="Статус"
          allowClear
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          style={{ width: 160 }}
        >
          {Object.entries(TICKET_STATUS_LABELS).map(([k, v]) => (
            <Option key={k} value={k}>{v}</Option>
          ))}
        </Select>
        <Select
          placeholder="Приоритет"
          allowClear
          value={priorityFilter}
          onChange={(v) => { setPriorityFilter(v); setPage(1); }}
          style={{ width: 160 }}
        >
          {Object.entries(TICKET_PRIORITY_LABELS).map(([k, v]) => (
            <Option key={k} value={k}>{v}</Option>
          ))}
        </Select>
      </Space>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={tickets}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          onRow={(r) => ({ onClick: () => setSelectedTicket(r), style: { cursor: 'pointer' } })}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showTotal: (t, rng) => `${rng[0]}-${rng[1]} из ${t}`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      <Drawer
        title={
          <Space>
            <CustomerServiceOutlined />
            <span>Тикет #{selectedTicket?.id}: {selectedTicket?.subject}</span>
          </Space>
        }
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        width={520}
        extra={
          selectedTicket && selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' ? (
            <Button danger size="small" onClick={() => void handleClose(selectedTicket.id)}>
              Закрыть тикет
            </Button>
          ) : null
        }
      >
        {selectedTicket && (
          <div>
            <Space wrap style={{ marginBottom: 12 }}>
              <Tag color={TICKET_STATUS_COLORS[selectedTicket.status]}>
                {TICKET_STATUS_LABELS[selectedTicket.status]}
              </Tag>
              <Tag color={TICKET_PRIORITY_COLORS[selectedTicket.priority]}>
                {TICKET_PRIORITY_LABELS[selectedTicket.priority]}
              </Tag>
              <Tag>{selectedTicket.userType === 'passenger' ? 'Пассажир' : 'Водитель'}</Tag>
            </Space>

            <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
              <Space>
                <Avatar style={{ background: '#1677ff' }}>
                  {selectedTicket.userName[0]}
                </Avatar>
                <div>
                  <Text strong>{selectedTicket.userName}</Text>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{formatDateTime(selectedTicket.createdAt)}</div>
                </div>
              </Space>
              <p style={{ marginTop: 8 }}>{selectedTicket.message}</p>
            </Card>

            {selectedTicket.replies.map((reply) => (
              <Card
                key={reply.id}
                size="small"
                style={{
                  marginBottom: 8,
                  background: reply.authorRole === 'admin' ? '#e6f4ff' : '#fafafa',
                }}
              >
                <Space>
                  <Avatar size="small" style={{ background: reply.authorRole === 'admin' ? '#1677ff' : '#8c8c8c' }}>
                    {reply.authorName[0]}
                  </Avatar>
                  <Text strong style={{ fontSize: 12 }}>{reply.authorName}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{formatDateTime(reply.createdAt)}</Text>
                </Space>
                <p style={{ marginTop: 6, marginBottom: 0, fontSize: 13 }}>{reply.message}</p>
              </Card>
            ))}

            {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
              <>
                <Divider />
                <Input.TextArea
                  rows={4}
                  placeholder="Напишите ответ..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={replyLoading}
                  onClick={() => void handleReply()}
                  disabled={!replyText.trim()}
                >
                  Отправить ответ
                </Button>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
