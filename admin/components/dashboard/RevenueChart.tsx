'use client';

import { Card, Typography } from 'antd';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { RevenueDataPoint } from '@/types';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const { Title } = Typography;

interface RevenueChartProps {
  data: RevenueDataPoint[];
  loading?: boolean;
}

function formatAmount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

export default function RevenueChart({ data, loading = false }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'dd MMM', { locale: ru }),
  }));

  return (
    <Card loading={loading} style={{ height: '100%' }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        Выручка и заказы
      </Title>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1677ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="revenue"
            orientation="left"
            tickFormatter={formatAmount}
            tick={{ fontSize: 11 }}
          />
          <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'revenue') return [`${formatAmount(value)} сум`, 'Выручка'];
              if (name === 'commission') return [`${formatAmount(value)} сум`, 'Комиссия'];
              return [value, 'Заказы'];
            }}
          />
          <Legend formatter={(v) => ({ revenue: 'Выручка', orders: 'Заказы', commission: 'Комиссия' }[v] ?? v)} />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#1677ff"
            fill="url(#colorRevenue)"
            strokeWidth={2}
          />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="commission"
            stroke="#722ed1"
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <Area
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke="#52c41a"
            fill="url(#colorOrders)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
