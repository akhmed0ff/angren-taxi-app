'use client';

import { Card, Statistic, Typography, Flex } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  growth?: number;
  icon: ReactNode;
  iconBg?: string;
  suffix?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  growth,
  icon,
  iconBg = '#1677ff',
  suffix,
  loading = false,
}: StatCardProps) {
  const isPositive = growth !== undefined && growth >= 0;
  const GrowthIcon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;
  const growthColor = isPositive ? '#52c41a' : '#ff4d4f';

  return (
    <Card loading={loading} hoverable style={{ height: '100%' }}>
      <Flex justify="space-between" align="flex-start">
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {title}
          </Text>
          <Statistic
            value={value}
            suffix={suffix}
            valueStyle={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}
          />
          {growth !== undefined && (
            <Flex align="center" gap={4} style={{ marginTop: 4 }}>
              <GrowthIcon style={{ color: growthColor, fontSize: 12 }} />
              <Text style={{ color: growthColor, fontSize: 12 }}>
                {Math.abs(growth).toFixed(1)}% за месяц
              </Text>
            </Flex>
          )}
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </Flex>
    </Card>
  );
}
