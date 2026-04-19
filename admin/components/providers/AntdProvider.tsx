'use client';

import { ConfigProvider, App as AntApp, theme } from 'antd';
import ruRU from 'antd/locale/ru_RU';

const PRIMARY_COLOR = '#1677ff';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: PRIMARY_COLOR,
          borderRadius: 8,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
