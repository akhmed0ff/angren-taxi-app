# PaymentMethodSheet - Документация

## Описание

**PaymentMethodSheet** — это модальное окно (Bottom Sheet), которое открывается снизу для выбора способа оплаты в такси-приложении.

## Функциональность

- ✅ Открывается снизу с затемнением фона
- ✅ 2 варианта оплаты: Наличные (💵) и Карта (💳)
- ✅ Visual feedback для выбранного варианта (желтый border + background)
- ✅ Radio button для каждого варианта
- ✅ Кнопка "Готово" для подтверждения
- ✅ Кнопка "Отмена" для закрытия
- ✅ Автоматическое сохранение в Zustand

## Основные компоненты

```text
PaymentMethodSheet
├── Modal (transparent, animationType: 'fade')
│   ├── Backdrop (затемнение с TouchableOpacity onPress)
│   └── Bottom Sheet View
│       ├── Handle Bar (визуальный индикатор)
│       ├── Title ("Способ оплаты")
│       ├── Methods List
│       │   ├── Cash Card (Наличные)
│       │   └── Card Card (Карта)
│       ├── Confirm Button (черный "Готово")
│       └── Close Button (outline "Отмена")
```

## Интеграция в приложение

### 1. Импорт компонента

```typescript
import { PaymentMethodSheet } from '../../components/PaymentMethodSheet';
```

### 2. Использование в экране

```typescript
import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { PaymentMethodSheet } from '../../components/PaymentMethodSheet';

export const MyScreen: React.FC = () => {
  const [isPaymentSheetVisible, setIsPaymentSheetVisible] = useState(false);

  return (
    <>
      {/* Кнопка для открытия */}
      <TouchableOpacity onPress={() => setIsPaymentSheetVisible(true)}>
        <Text>Изменить способ оплаты</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <PaymentMethodSheet
        isVisible={isPaymentSheetVisible}
        onClose={() => setIsPaymentSheetVisible(false)}
        onConfirm={(method) => {
          console.log('Selected:', method); // 'cash' | 'card'
        }}
      />
    </>
  );
};
```

### 3. Доступ к выбранному способу оплаты

```typescript
import { useTaxiStore } from '../../store/taxiStore';

const MyComponent = () => {
  const { paymentMethod } = useTaxiStore();

  return (
    <Text>
      Текущий способ: {paymentMethod === 'cash' ? 'Наличные' : 'Карта'}
    </Text>
  );
};
```

## Props интерфейс

```typescript
interface PaymentMethodBottomSheetProps {
  /** Видимость Bottom Sheet */
  isVisible: boolean;

  /** Callback для закрытия */
  onClose: () => void;

  /** Callback при подтверждении выбора (опционально) */
  onConfirm?: (method: PaymentMethodType) => void;
}
```

## Стилизация

### Цвета

- **Primary Yellow**: #F5C400 (выбранный вариант)
- **Background**: #FAFAFA
- **Card Background**: #F9F9F9
- **Selected Card**: #FFFBF0
- **Text Primary**: #000000
- **Text Secondary**: #666666
- **Border**: #D0D0D0 (inactive) / #F5C400 (active)

### Размеры

- **Handle Bar**: 40px × 4px
- **Border Radius**: 24px (top), 12px (cards)
- **Font**:
  - Title: 20px (700)
  - Method Name: 15px (600/700)
  - Description: 12px (400)
  - Button: 16px (700)

## Примеры использования в разных экранах

### Пример 1: Интеграция в TripDetailsScreen

```typescript
// файл: app/screens/main/TripDetailsScreen.tsx

export const TripDetailsScreen: React.FC = () => {
  const [isPaymentSheetVisible, setIsPaymentSheetVisible] = useState(false);
  const { paymentMethod } = useTaxiStore();

  return (
    <View>
      {/* Другой контент */}

      <TouchableOpacity 
        style={styles.paymentButton}
        onPress={() => setIsPaymentSheetVisible(true)}
      >
        <Text>Способ оплаты: {paymentMethod}</Text>
      </TouchableOpacity>

      <PaymentMethodSheet
        isVisible={isPaymentSheetVisible}
        onClose={() => setIsPaymentSheetVisible(false)}
        onConfirm={(method) => {
          // Метод уже сохранен в Zustand автоматически
          // setPayment() вызывается в компоненте
        }}
      />
    </View>
  );
};
```

### Пример 2: Standalone компонент

```typescript
// Полный экран для выбора способа оплаты
// См. файл: app/screens/EXAMPLE_PAYMENT_USAGE.tsx
```

## Логика работы

1. **Открытие**: `isVisible={true}` → Modal появляется с fade анимацией
2. **Выбор**: Нажатие на карту → `setSelectedMethod(method)`
3. **Подтверждение**: Нажатие "Готово" →
   - `setPayment(selectedMethod)` в Zustand
   - `onConfirm?.(selectedMethod)` callback
   - `onClose()` закрытие
4. **Отмена**: Нажатие "Отмена" или на backdrop → `onClose()`

## Интеграция с Zustand

Компонент автоматически:

- ✅ Читает текущий `paymentMethod` из store при открытии
- ✅ Сохраняет выбор в store при подтверждении (setPayment)
- ✅ Обновляет state глобально для всех экранов

```typescript
// В любом месте приложения:
import { useTaxiStore } from '../store/taxiStore';

const screen = () => {
  const { paymentMethod, setPayment } = useTaxiStore();
  // paymentMethod всегда содержит актуальное значение
};
```

## Обработка ошибок и edge cases

### Случай 1: Множественные Bottom Sheets

```typescript
// Если в приложении несколько Sheet, управляй статусами независимо
const [isPaymentVisible, setIsPaymentVisible] = useState(false);
const [isMethodVisible, setIsMethodVisible] = useState(false);

// Каждый имеет свой state
<PaymentMethodSheet isVisible={isPaymentVisible} onClose={...} />
```

### Случай 2: Callback при выборе

```typescript
// Если нужна синхронизация с другими действиями
onConfirm={(method) => {
  // Дополнительные действия
  analytics.trackPaymentMethodChange(method);
  updateUI();
  // Zustand уже обновлен автоматически
}}
```

## Тестирование

```typescript
// Пример test-кейса
it('should save selected payment method to Zustand', () => {
  // 1. Открыть Bottom Sheet
  fireEvent.press(openButton);
  
  // 2. Выбрать "Карта"
  fireEvent.press(cardOption);
  
  // 3. Нажать "Готово"
  fireEvent.press(confirmButton);
  
  // 4. Проверить значение в store
  expect(useTaxiStore.getState().paymentMethod).toBe('card');
});
```

## Файлы, относящиеся к этому компоненту

```text
app/
├── components/
│   └── PaymentMethodSheet.tsx (основной компонент)
├── screens/
│   └── EXAMPLE_PAYMENT_USAGE.tsx (пример использования)
└── store/
    └── taxiStore.ts (Zustand store с setPayment action)
```

## Планы на развитие

- [ ] Поддержка Apple Pay / Google Pay
- [ ] Сохранение предпочитаемого способа оплаты (persistent storage)
- [ ] Animation при выборе (spring animation для radio)
- [ ] Интеграция с payment gateway API
- [ ] История способов оплаты
