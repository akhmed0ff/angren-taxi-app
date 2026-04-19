'use client';

import { useState } from 'react';
import {
  Card, Form, Input, InputNumber, Switch, Button, Row, Col, Divider, message, Tabs,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { TariffConfig } from '@/types';

const DEFAULT_TARIFFS = {
  economy: { baseFare: 5000, perKm: 1200, perMinute: 150, minFare: 7000, surgePricing: false, surgeMultiplier: 1.5 },
  comfort: { baseFare: 8000, perKm: 1800, perMinute: 200, minFare: 10000, surgePricing: true, surgeMultiplier: 1.8 },
  business: { baseFare: 15000, perKm: 3000, perMinute: 350, minFare: 20000, surgePricing: true, surgeMultiplier: 2.0 },
  minivan: { baseFare: 10000, perKm: 2000, perMinute: 250, minFare: 15000, surgePricing: false, surgeMultiplier: 1.5 },
};

const DEFAULT_APP = {
  commissionRate: 15,
  maxCancelRate: 20,
  minDriverRating: 3.5,
  searchRadius: 5,
  autoDispatch: true,
  maintenanceMode: false,
  registrationOpen: true,
  supportPhone: '+998901234567',
  supportEmail: 'support@angren-taxi.uz',
};

const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  minivan: 'Минивэн',
};

function TariffForm({ category, initialValues }: { category: string; initialValues: TariffConfig }) {
  const [form] = Form.useForm<TariffConfig>();

  const onSave = async () => {
    const vals = await form.validateFields();
    // would call API
    message.success(`Тариф "${CATEGORY_LABELS[category]}" сохранён`);
  };

  return (
    <Form form={form} initialValues={initialValues} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="baseFare" label="Посадочная плата (сум)" rules={[{ required: true }]}>
            <InputNumber min={0} step={500} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="minFare" label="Минимальная стоимость (сум)" rules={[{ required: true }]}>
            <InputNumber min={0} step={500} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="perKm" label="Стоимость за км (сум)" rules={[{ required: true }]}>
            <InputNumber min={0} step={100} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="perMinute" label="Стоимость за минуту (сум)" rules={[{ required: true }]}>
            <InputNumber min={0} step={10} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="surgePricing" label="Динамическое ценообразование" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="surgeMultiplier" label="Коэффициент повышения">
            <InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Button type="primary" icon={<SaveOutlined />} onClick={() => void onSave()}>
        Сохранить тариф
      </Button>
    </Form>
  );
}

export default function SettingsContent() {
  const [appForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const saveAppSettings = async () => {
    setSaving(true);
    try {
      await appForm.validateFields();
      message.success('Настройки приложения сохранены');
    } finally {
      setSaving(false);
    }
  };

  const tariffItems = Object.entries(DEFAULT_TARIFFS).map(([cat, vals]) => ({
    key: cat,
    label: CATEGORY_LABELS[cat],
    children: <TariffForm category={cat} initialValues={vals} />,
  }));

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Тарифы">
            <Tabs items={tariffItems} />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Настройки приложения">
            <Form form={appForm} initialValues={DEFAULT_APP} layout="vertical">
              <Form.Item name="commissionRate" label="Комиссия платформы (%)">
                <InputNumber min={0} max={50} step={1} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
              <Form.Item name="maxCancelRate" label="Макс. процент отмен водителя (%)">
                <InputNumber min={0} max={100} step={1} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
              <Form.Item name="minDriverRating" label="Минимальный рейтинг водителя">
                <InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="searchRadius" label="Радиус поиска водителей (км)">
                <InputNumber min={1} max={30} step={1} style={{ width: '100%' }} addonAfter="км" />
              </Form.Item>
              <Divider />
              <Form.Item name="autoDispatch" label="Автоматическое назначение водителя" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="registrationOpen" label="Открыта регистрация водителей" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="maintenanceMode" label="Режим обслуживания (отключает приложение)" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Divider />
              <Form.Item name="supportPhone" label="Телефон поддержки">
                <Input />
              </Form.Item>
              <Form.Item name="supportEmail" label="Email поддержки">
                <Input />
              </Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={() => void saveAppSettings()}
                block
              >
                Сохранить настройки
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
