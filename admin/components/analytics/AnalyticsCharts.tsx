'use client';

import { useEffect } from 'react';
import { Row, Col, Card, Typography, Segmented, Flex } from 'antd';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchRevenueData,
  fetchOrdersStats,
  fetchCategoryStats,
  setPeriod,
} from '@/store/slices/analyticsSlice';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import CategoryChart from '@/components/dashboard/CategoryChart';

const { Title } = Typography;

function formatAmount(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export default function AnalyticsCharts() {
  const dispatch = useAppDispatch();
  const { revenueData, ordersStats, categoryStats, isLoading, period } = useAppSelector(
    (s) => s.analytics,
  );

  const activePeriod = period === 'today' ? 'week' : period;

  useEffect(() => {
    void dispatch(fetchRevenueData(activePeriod));
    void dispatch(fetchOrdersStats(activePeriod));
    void dispatch(fetchCategoryStats());
  }, [dispatch, activePeriod]);

  const chartRevenue = revenueData.map((d) => ({
    ...d,
    label: format(parseISO(d.date), activePeriod === 'year' ? 'MMM' : 'dd MMM', { locale: ru }),
  }));

  const chartOrders = ordersStats.map((d) => ({
    ...d,
    label: format(parseISO(d.date), activePeriod === 'year' ? 'MMM' : 'dd MMM', { locale: ru }),
  }));

  const periodOptions = [
    { label: 'Неделя', value: 'week' },
    { label: 'Месяц', value: 'month' },
    { label: 'Год', value: 'year' },
  ];

  return (
    <div>
      <Flex justify="flex-end" style={{ marginBottom: 16 }}>
        <Segmented
          options={periodOptions}
          value={activePeriod}
          onChange={(v) => dispatch(setPeriod(v as 'week' | 'month' | 'year'))}
        />
      </Flex>

      <Row gutter={[16, 16]}>
        {/* Revenue line chart */}
        <Col xs={24}>
          <Card loading={isLoading}>
            <Title level={5}>Выручка (сум)</Title>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tickFormatter={formatAmount} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${formatAmount(v)} сум`, '']} />
                <Legend formatter={(v: string) => ({ revenue: 'Выручка', commission: 'Комиссия' } as Record<string, string>)[v] ?? v} />
                <Line type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={2} dot={false} name="revenue" />
                <Line type="monotone" dataKey="commission" stroke="#722ed1" strokeWidth={2} dot={false} strokeDasharray="4 4" name="commission" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Orders bar chart */}
        <Col xs={24} lg={16}>
          <Card loading={isLoading}>
            <Title level={5}>Количество заказов</Title>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend formatter={(v: string) => ({ completed: 'Завершено', cancelled: 'Отменено' } as Record<string, string>)[v] ?? v} />
                <Bar dataKey="completed" fill="#52c41a" name="completed" stackId="a" />
                <Bar dataKey="cancelled" fill="#ff4d4f" name="cancelled" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Category pie */}
        <Col xs={24} lg={8}>
          <CategoryChart data={categoryStats} loading={isLoading} />
        </Col>
      </Row>
    </div>
  );
}
