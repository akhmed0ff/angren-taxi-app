'use client';

import { useEffect } from 'react';
import { Row, Col, Typography, Flex, Segmented } from 'antd';
import {
  CarOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import StatCard from '@/components/common/StatCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAnalyticsMetrics,
  fetchRevenueData,
  fetchOrdersStats,
  fetchCategoryStats,
  setPeriod,
} from '@/store/slices/analyticsSlice';
import { formatCompactCurrency, formatNumber } from '@/utils/formatters';
import RevenueChart from './RevenueChart';
import OrdersStatusChart from './OrdersStatusChart';
import CategoryChart from './CategoryChart';
import RecentOrders from './RecentOrders';

const { Title } = Typography;

export default function DashboardContent() {
  const dispatch = useAppDispatch();
  const { metrics, revenueData, ordersStats, categoryStats, isLoading, period } = useAppSelector(
    (s) => s.analytics,
  );

  useEffect(() => {
    void dispatch(fetchAnalyticsMetrics());
    void dispatch(fetchRevenueData(period === 'today' ? 'week' : period));
    void dispatch(fetchOrdersStats(period === 'today' ? 'week' : period));
    void dispatch(fetchCategoryStats());
  }, [dispatch, period]);

  const periodOptions = [
    { label: 'Неделя', value: 'week' },
    { label: 'Месяц', value: 'month' },
    { label: 'Год', value: 'year' },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Дашборд
        </Title>
        <Segmented
          options={periodOptions}
          value={period === 'today' ? 'week' : period}
          onChange={(val) => dispatch(setPeriod(val as 'week' | 'month' | 'year'))}
        />
      </Flex>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Всего заказов"
            value={formatNumber(metrics?.totalOrders ?? 0)}
            growth={metrics?.ordersGrowth}
            icon={<CarOutlined />}
            iconBg="#1677ff"
            loading={isLoading && !metrics}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Выручка"
            value={formatCompactCurrency(metrics?.totalRevenue ?? 0)}
            growth={metrics?.revenueGrowth}
            icon={<DollarOutlined />}
            iconBg="#52c41a"
            loading={isLoading && !metrics}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Активных водителей"
            value={formatNumber(metrics?.activeDrivers ?? 0)}
            growth={metrics?.driversGrowth}
            icon={<TeamOutlined />}
            iconBg="#722ed1"
            loading={isLoading && !metrics}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Активных пользователей"
            value={formatNumber(metrics?.activeUsers ?? 0)}
            growth={metrics?.usersGrowth}
            icon={<UserOutlined />}
            iconBg="#fa8c16"
            loading={isLoading && !metrics}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Выполнено заказов"
            value={`${metrics?.completionRate ?? 0}%`}
            icon={<CheckCircleOutlined />}
            iconBg="#13c2c2"
            loading={isLoading && !metrics}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Средний рейтинг"
            value={metrics?.avgRating?.toFixed(1) ?? '—'}
            icon={<StarOutlined />}
            iconBg="#eb2f96"
            loading={isLoading && !metrics}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Процент отмен"
            value={`${metrics?.cancelRate ?? 0}%`}
            icon={<CarOutlined />}
            iconBg="#ff4d4f"
            loading={isLoading && !metrics}
          />
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <RevenueChart data={revenueData} loading={isLoading} />
        </Col>
        <Col xs={24} lg={8}>
          <CategoryChart data={categoryStats} loading={isLoading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <OrdersStatusChart data={ordersStats} loading={isLoading} />
        </Col>
        <Col xs={24} lg={10}>
          <RecentOrders />
        </Col>
      </Row>
    </div>
  );
}
