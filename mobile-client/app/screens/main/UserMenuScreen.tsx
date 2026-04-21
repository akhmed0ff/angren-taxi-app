import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { useTaxiStore } from '../../store/taxiStore';

type MenuNavProp = DrawerNavigationProp<any>;

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  onPress?: () => void;
}

const MENU_ITEMS_1: MenuItem[] = [
  { id: 'history', icon: '📜', label: 'История поездок' },
  { id: 'places', icon: '📍', label: 'Мои места' },
  { id: 'bonus', icon: '🎁', label: 'Бонусы' },
  { id: 'payment', icon: '💳', label: 'Способ оплаты' },
];

const MENU_ITEMS_2: MenuItem[] = [
  { id: 'invite', icon: '👥', label: 'Пригласить' },
  { id: 'driver', icon: '🚗', label: 'Стать водителем' },
  { id: 'contact', icon: '☎️', label: 'Связаться' },
  { id: 'news', icon: '📰', label: 'Новости' },
];

const MENU_ITEMS_3: MenuItem[] = [
  { id: 'settings', icon: '⚙️', label: 'Настройки' },
  { id: 'about', icon: 'ℹ️', label: 'О приложении' },
];

export const UserMenuScreen: React.FC = () => {
  const navigation = useNavigation<MenuNavProp>();
  const { setPayment } = useTaxiStore();

  const handleMenuPress = (itemId: string) => {
    console.log('Menu item pressed:', itemId);
    
    switch (itemId) {
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'payment':
        setPayment('cash');
        break;
      case 'places':
        navigation.navigate('MyPlaces');
        break;
      case 'history':
        navigation.navigate('MainTabs', { screen: 'OrderHistory' });
        break;
      case 'bonus':
        navigation.navigate('MainTabs', { screen: 'Bonuses' });
        break;
      default:
        console.log('No action for:', itemId);
    }
  };

  const MenuItemComponent: React.FC<{ item: MenuItem }> = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleMenuPress(item.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.menuItemIcon}>{item.icon}</Text>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemLabel}>{item.label}</Text>
      </View>
      <Text style={styles.menuItemArrow}>›</Text>
    </TouchableOpacity>
  );

  const MenuBlock: React.FC<{ items: MenuItem[] }> = ({ items }) => (
    <View style={styles.menuBlock}>
      {items.map((item) => (
        <MenuItemComponent key={item.id} item={item} />
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>АА</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Азат Азизов</Text>
          <Text style={styles.userPhone}>+998 (99) 123-45-67</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Block 1 */}
      <MenuBlock items={MENU_ITEMS_1} />

      {/* Menu Block 2 */}
      <MenuBlock items={MENU_ITEMS_2} />

      {/* Menu Block 3 */}
      <MenuBlock items={MENU_ITEMS_3} />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Выход</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ангрен Такси v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5C400',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonIcon: {
    fontSize: 18,
  },
  menuBlock: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '500',
  },
});
