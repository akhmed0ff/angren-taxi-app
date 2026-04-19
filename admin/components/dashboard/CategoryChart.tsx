'use client';

import { Card, Typography } from 'antd';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import type { CategoryStat } from '@/types';

const { Title } = Typography;
const COLORS = ['#1677ff', '#52c41a', '#722ed1', '#fa8c16'];

interface CategoryChartProps {
  data: CategoryStat[];
  loading?: boolean;
}

export default function CategoryChart({ data, loading = false }: CategoryChartProps) {
  return (
    <Card loading={loading} style={{ height: '100%' }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        По категориям
      </Title>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={90}
            innerRadius={50}
            dataKey="value"
            nameKey="category"
            label={({ percentage }) => `${percentage}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value, 'Заказов']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
