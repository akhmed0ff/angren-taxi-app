import type { Metadata } from 'next';
import StoreProvider from '@/components/providers/StoreProvider';
import AntdProvider from '@/components/providers/AntdProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'АНГРЕН ТАКСИ - Админ панель',
  description: 'Административная панель такси-агрегатора АНГРЕН ТАКСИ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <StoreProvider>
          <AntdProvider>{children}</AntdProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
