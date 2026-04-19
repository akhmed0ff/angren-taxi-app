'use client';

import { Card, Typography } from 'antd';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { OrdersStatPoint } from '@/types';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const { Title } = Typography;

interface OrdersStatusChartProps {
  data: OrdersStatPoint[];
  loading?: boolean;
}

export default function OrdersStatusChart({ data, loading = false }: OrdersStatusChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'dd MMM', { locale: ru }),
  }));

  return (
    <Card loading={loading} style={{ height: '100%' }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        Статистика заказов
      </Title>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend formatter={(v) => ({ completed: 'Завершено', cancelled: 'Отменено' }[v] ?? v)} />
          <Bar dataKey="completed" stackId="a" fill="#52c41a" name="completed" radius={[0, 0, 0, 0]} />
          <Bar dataKey="cancelled" stackId="a" fill="#ff4d4f" name="cancelled" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
