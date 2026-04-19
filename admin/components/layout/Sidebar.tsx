'use client';

import { Layout, Menu, Typography, Badge, Tooltip } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { APP_NAME } from '@/utils/constants';
import clsx from 'clsx';

const { Sider } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  { key: '/dashboard', label: 'Дашборд', icon: <DashboardOutlined /> },
  { key: '/orders', label: 'Заказы', icon: <CarOutlined /> },
  { key: '/drivers', label: 'Водители', icon: <TeamOutlined /> },
  { key: '/users', label: 'Пассажиры', icon: <UserOutlined /> },
  { key: '/analytics', label: 'Аналитика', icon: <BarChartOutlined /> },
  { key: '/finances', label: 'Финансы', icon: <DollarOutlined /> },
  { key: '/support', label: 'Поддержка', icon: <CustomerServiceOutlined />, badge: 5 },
  { key: '/settings', label: 'Настройки', icon: <SettingOutlined /> },
  { key: '/security', label: 'Безопасность', icon: <SafetyOutlined /> },
];

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const selectedKey = NAV_ITEMS.find((item) => pathname.startsWith(item.key))?.key ?? '/dashboard';

  const menuItems = NAV_ITEMS.map((item) => ({
    key: item.key,
    icon: item.badge ? (
      <Badge count={item.badge} size="small" offset={[4, -4]}>
        {item.icon}
      </Badge>
    ) : (
      item.icon
    ),
    label: item.label,
  }));

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      collapsedWidth={64}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        background: '#001529',
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        overflow: 'auto',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 24 }}>🚕</span>
        {!collapsed && (
          <Text
            strong
            style={{
              color: '#fff',
              marginLeft: 10,
              fontSize: 14,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {APP_NAME}
            <br />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 400 }}>
              Adminpanel
            </Text>
          </Text>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
        style={{ marginTop: 8, border: 'none' }}
      />
    </Sider>
  );
}
