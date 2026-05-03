/**
 * Header - Component header tùy chỉnh cho trang chủ
 * Hiển thị logo, lời chào và nút giỏ hàng
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Header({ cartCount = 0, onCartPress }) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.logo}>🛋️ FurnitureStore</Text>
        <Text style={styles.subtitle}>Nội thất đẳng cấp, giá tốt nhất</Text>
      </View>

      <TouchableOpacity style={styles.cartBtn} onPress={onCartPress}>
        <Text style={styles.cartIcon}>🛒</Text>
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  logo: {
    color: '#e0c097',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  cartBtn: {
    position: 'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e94560',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
