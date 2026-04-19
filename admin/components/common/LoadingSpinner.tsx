'use client';

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: number;
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 40, fullPage = false }: LoadingSpinnerProps) {
  const spinner = <Spin indicator={<LoadingOutlined style={{ fontSize: size }} spin />} />;

  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
