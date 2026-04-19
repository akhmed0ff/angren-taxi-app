export const APP_NAME = 'АНГРЕН ТАКСИ';

export const COLORS = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#e94560',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',
  white: '#ffffff',
  black: '#000000',
  gray: {
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  online: '#27ae60',
  offline: '#9e9e9e',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const LOCATION_TASK_NAME = 'background-location-task';

export const VEHICLE_CATEGORIES = ['economy', 'comfort', 'premium'] as const;

export const ORDER_TIMER_SECONDS = 30; // seconds to accept an order

export const LOCATION_UPDATE_INTERVAL = 5000; // ms

export const API_TIMEOUT = 15000; // ms
