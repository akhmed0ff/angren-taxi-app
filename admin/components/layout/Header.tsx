'use client';

import { Layout, Button, Avatar, Dropdown, Space, Typography, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutThunk } from '@/store/slices/authSlice';
import { toggleSidebar } from '@/store/slices/uiSlice';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  sidebarWidth: number;
}

export default function Header({ collapsed, sidebarWidth }: HeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    router.push('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
      onClick: () => router.push('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const roleLabel: Record<string, string> = {
    super_admin: 'Суперадмин',
    admin: 'Администратор',
    moderator: 'Модератор',
    analyst: 'Аналитик',
  };

  return (
    <AntHeader
      style={{
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        right: 0,
        zIndex: 99,
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,21,41,0.12)',
        height: 64,
        lineHeight: '64px',
        transition: 'left 0.2s',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => dispatch(toggleSidebar())}
        style={{ fontSize: 16, width: 40, height: 40 }}
      />

      <Space size={16}>
        <Badge count={5} size="small">
          <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} shape="circle" />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Space style={{ cursor: 'pointer' }} size={8}>
            <Avatar
              size={34}
              style={{ background: '#1677ff', flexShrink: 0 }}
              icon={<UserOutlined />}
            />
            <div style={{ lineHeight: 1.3, display: 'flex', flexDirection: 'column' }}>
              <Text strong style={{ fontSize: 13 }}>
                {user?.name ?? 'Администратор'}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {roleLabel[user?.role ?? ''] ?? user?.role}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
