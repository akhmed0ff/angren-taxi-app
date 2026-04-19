'use client';

import { Layout } from 'antd';
import { useAppSelector } from '@/store/hooks';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />

      <Layout style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.2s' }}>
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />

        <Content
          style={{
            marginTop: 64,
            padding: 24,
            minHeight: 'calc(100vh - 64px)',
            background: '#f0f2f5',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
