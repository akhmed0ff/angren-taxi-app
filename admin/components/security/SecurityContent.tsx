'use client';

import { Card, Table, Tag, Typography, Row, Col, Statistic, Alert } from 'antd';
import { SafetyOutlined, LockOutlined, LoginOutlined, WarningOutlined } from '@ant-design/icons';
import { formatDateTime } from '@/utils/formatters';

const { Title } = Typography;

interface AuditLog {
  id: string;
  action: string;
  adminName: string;
  ip: string;
  createdAt: string;
  status: 'success' | 'failed';
}

const MOCK_LOGS: AuditLog[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  action: [
    'Вход в систему',
    'Блокировка пользователя',
    'Изменение тарифа',
    'Одобрение водителя',
    'Закрытие тикета',
    'Изменение настроек',
  ][i % 6] as string,
  adminName: 'Администратор',
  ip: `192.168.1.${100 + (i % 50)}`,
  createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
  status: i % 8 === 0 ? 'failed' : 'success',
}));

const columns = [
  { title: '#', dataIndex: 'id', width: 60 },
  {
    title: 'Действие',
    dataIndex: 'action',
    render: (action: string, r: AuditLog) => (
      <span>
        {r.status === 'failed' && <WarningOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />}
        {action}
      </span>
    ),
  },
  { title: 'Администратор', dataIndex: 'adminName', width: 160 },
  { title: 'IP-адрес', dataIndex: 'ip', width: 140 },
  {
    title: 'Статус',
    dataIndex: 'status',
    width: 120,
    render: (s: string) => (
      <Tag color={s === 'success' ? 'success' : 'error'}>
        {s === 'success' ? 'Успешно' : 'Ошибка'}
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

export default function SecurityContent() {
  return (
    <div>
      <Alert
        message="Двухфакторная аутентификация активна"
        description="Все входы в систему защищены 2FA. Последняя проверка безопасности: сегодня."
        type="success"
        showIcon
        icon={<SafetyOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Входов за 30 дней"
              value={MOCK_LOGS.filter((l) => l.action === 'Вход в систему').length}
              prefix={<LoginOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Неудачных попыток"
              value={MOCK_LOGS.filter((l) => l.status === 'failed').length}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Действий выполнено"
              value={MOCK_LOGS.length}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Журнал аудита" bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={MOCK_LOGS}
          columns={columns}
          rowKey="id"
          scroll={{ x: 800 }}
          pagination={{ pageSize: 15, showTotal: (t, r) => `${r[0]}-${r[1]} из ${t}` }}
        />
      </Card>
    </div>
  );
}
