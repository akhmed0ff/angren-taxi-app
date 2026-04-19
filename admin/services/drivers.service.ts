import api from './api';
import type { Driver, PaginatedResponse } from '@/types';

const CITIES = ['Ангрен', 'Ташкент', 'Алмалык', 'Янгибозор'];
const NAMES = [
  'Бахтиёр Усмонов', 'Шерзод Хамидов', 'Фаррух Ниёзов', 'Жамшид Раҳимов',
  'Улугбек Мирзаев', 'Акбар Содиқов', 'Тимур Холматов', 'Дониёр Юнусов',
  'Элдор Маматов', 'Зафар Ҳасанов', 'Нодир Каримов', 'Хуршид Тошпўлатов',
];
const CAR_BRANDS = ['Nexia', 'Cobalt', 'Matiz', 'Spark', 'Lacetti', 'Damas', 'Camry'];
const COLORS = ['Белый', 'Чёрный', 'Серебристый', 'Серый', 'Синий', 'Красный'];
const CATEGORIES = ['economy', 'economy', 'economy', 'comfort', 'business', 'minivan'] as const;

function randomPhone(): string {
  // Math.random() is intentional here (non-security use: demo data only)
  const codes = ['90', '91', '93', '94', '95', '97', '98', '99'];
  const code = codes[Math.floor(Math.random() * codes.length)];
  return `+998${code}${Math.floor(Math.random() * 9_000_000) + 1_000_000}`;
}

// Mock data generator — Math.random() is intentional here (non-security use: demo data only)
function generateDrivers(): Driver[] {
  return Array.from({ length: 80 }, (_, i) => {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    return {
      id: String(i + 1),
      name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : ''),
      phone: randomPhone(),
      status: (['active', 'active', 'offline', 'offline', 'on_trip', 'blocked', 'pending'] as const)[
        Math.floor(Math.random() * 7)
      ],
      vehicle: {
        id: `v${i + 1}`,
        brand: CAR_BRANDS[Math.floor(Math.random() * CAR_BRANDS.length)],
        model: 'S',
        year: 2018 + Math.floor(Math.random() * 7),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        plateNumber: `${10 + Math.floor(Math.random() * 90)}A${100 + Math.floor(Math.random() * 900)}BA`,
        category,
      },
      rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
      totalTrips: Math.floor(Math.random() * 2000),
      totalEarnings: Math.floor(Math.random() * 20_000_000),
      balance: Math.floor(Math.random() * 500_000),
      licenseNumber: `DL${100000 + i}`,
      licenseExpiry: new Date(Date.now() + Math.random() * 3 * 365 * 24 * 3600 * 1000).toISOString(),
      registeredAt: new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000).toISOString(),
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      isOnline: Math.random() > 0.4,
    };
  });
}

const MOCK_DRIVERS = generateDrivers();

export interface DriversQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  city?: string;
}

export const driversService = {
  async getDrivers(query: DriversQuery = {}): Promise<PaginatedResponse<Driver>> {
    try {
      const { data } = await api.get<PaginatedResponse<Driver>>('/admin/drivers', { params: query });
      return data;
    } catch {
      const { page = 1, limit = 20, search, status, category, city } = query;
      let filtered = [...MOCK_DRIVERS];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (d) => d.name.toLowerCase().includes(q) || d.phone.includes(q) || d.vehicle.plateNumber.toLowerCase().includes(q),
        );
      }
      if (status) filtered = filtered.filter((d) => d.status === status);
      if (category) filtered = filtered.filter((d) => d.vehicle.category === category);
      if (city) filtered = filtered.filter((d) => d.city === city);
      const start = (page - 1) * limit;
      return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit };
    }
  },

  async getDriverById(id: string): Promise<Driver> {
    try {
      const { data } = await api.get<{ data: Driver }>(`/admin/drivers/${id}`);
      return data.data;
    } catch {
      const driver = MOCK_DRIVERS.find((d) => d.id === id);
      if (!driver) throw new Error('Водитель не найден');
      return driver;
    }
  },

  async blockDriver(id: string, reason: string): Promise<void> {
    try {
      await api.patch(`/admin/drivers/${id}/block`, { reason });
    } catch {
      const driver = MOCK_DRIVERS.find((d) => d.id === id);
      if (driver) driver.status = 'blocked';
    }
  },

  async approveDriver(id: string): Promise<void> {
    try {
      await api.patch(`/admin/drivers/${id}/approve`);
    } catch {
      const driver = MOCK_DRIVERS.find((d) => d.id === id);
      if (driver) driver.status = 'active';
    }
  },
};
