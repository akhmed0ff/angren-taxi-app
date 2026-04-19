'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initAuthThunk } from '@/store/slices/authSlice';
import AdminLayout from '@/components/layout/AdminLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(initAuthThunk()).then((action) => {
      if (initAuthThunk.fulfilled.match(action) && !action.payload) {
        router.replace('/login');
      }
    });
  }, []);

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}
