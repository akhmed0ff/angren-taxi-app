import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer';

export const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const menuItems = [
    { id: 'home', label: 'Главная', icon: '🏠' },
    { id: 'profile', label: 'Профиль', icon: '👤' },
    { id: 'history', label: 'История', icon: '📋' },
    { id: 'bonuses', label: 'Бонусы', icon: '⭐' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
  ];

  return (
    <DrawerContentScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ангрен Такси</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              if (item.id === 'home') {
                navigation.navigate('MainTabs', { screen: 'Home' });
              } else if (item.id === 'profile') {
                navigation.navigate('MainTabs', { screen: 'Profile' });
              } else if (item.id === 'history') {
                navigation.navigate('MainTabs', { screen: 'OrderHistory' });
              } else if (item.id === 'bonuses') {
                navigation.navigate('MainTabs', { screen: 'Bonuses' });
              } else if (item.id === 'settings') {
                navigation.navigate('Settings');
              }
              navigation.closeDrawer();
            }}
          >
            <Text style={styles.menuItemIcon}>{item.icon}</Text>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  menu: {
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  versionText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});
