'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initAuthThunk } from '@/store/slices/authSlice';
import AdminLayout from '@/components/layout/AdminLayout';
import UsersTable from '@/components/users/UsersTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const { Title } = Typography;

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(initAuthThunk()).then((action) => {
      if (initAuthThunk.fulfilled.match(action) && !action.payload) {
        router.replace('/login');
      }
    });
  }, [dispatch, router]);

  if (!isAuthenticated) return <LoadingSpinner fullPage />;

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Пассажиры
        </Title>
      </div>
      <UsersTable />
    </AdminLayout>
  );
}
