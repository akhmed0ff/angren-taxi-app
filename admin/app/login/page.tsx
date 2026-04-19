'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Typography, Alert, Flex } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginThunk, clearError, initAuthThunk } from '@/store/slices/authSlice';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);
  const [form] = Form.useForm<LoginForm>();

  useEffect(() => {
    dispatch(initAuthThunk()).then((action) => {
      if (initAuthThunk.fulfilled.match(action) && action.payload) {
        router.replace('/dashboard');
      }
    });
  }, [dispatch, router]);

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const handleSubmit = async (values: LoginForm) => {
    dispatch(clearError());
    await dispatch(loginThunk(values));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        bodyStyle={{ padding: '40px 40px 32px' }}
      >
        <Flex vertical align="center" style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🚕</div>
          <Title level={3} style={{ margin: 0, textAlign: 'center' }}>
            АНГРЕН ТАКСИ
          </Title>
          <Text type="secondary">Административная панель</Text>
        </Flex>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => dispatch(clearError())}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Неверный формат email' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Email администратора"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Пароль"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{ height: 44, fontSize: 15, fontWeight: 600 }}
            >
              Войти в систему
            </Button>
          </Form.Item>
        </Form>

        <Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', fontSize: 12, marginTop: 8 }}
        >
          Демо: admin@angren-taxi.uz / Admin123!
        </Text>
      </Card>
    </div>
  );
}
