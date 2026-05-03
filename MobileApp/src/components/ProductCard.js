/**
 * ProductCard - Component hiển thị thẻ sản phẩm
 * Dùng chung cho HomeScreen và ProductListScreen
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductCard({ product, onPress }) {
  // Format giá tiền VND
  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    return parseInt(price).toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Badge giảm giá */}
      {product.on_sale && (
        <View style={styles.saleBadge}>
          <Text style={styles.saleBadgeText}>SALE</Text>
        </View>
      )}

      {/* Ảnh sản phẩm */}
      <Image
        source={{ uri: product.image || 'https://via.placeholder.com/200' }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Thông tin sản phẩm */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.on_sale && product.regular_price && (
            <Text style={styles.oldPrice}>{formatPrice(product.regular_price)}</Text>
          )}
        </View>

        {/* Rating */}
        {product.rating && parseFloat(product.rating) > 0 && (
          <Text style={styles.rating}>⭐ {parseFloat(product.rating).toFixed(1)}</Text>
        )}

        {/* Trạng thái kho */}
        <Text style={[
          styles.stock,
          product.stock_status === 'instock' ? styles.inStock : styles.outStock
        ]}>
          {product.stock_status === 'instock' ? '● Còn hàng' : '● Hết hàng'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    marginBottom: 16,
    width: '47%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saleBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e94560',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  saleBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#0f3460',
  },
  info: {
    padding: 12,
  },
  name: {
    color: '#eee',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    color: '#e0c097',
    fontSize: 16,
    fontWeight: 'bold',
  },
  oldPrice: {
    color: '#888',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  rating: {
    color: '#ffc107',
    fontSize: 12,
    marginTop: 4,
  },
  stock: {
    fontSize: 11,
    marginTop: 4,
  },
  inStock: {
    color: '#4caf50',
  },
  outStock: {
    color: '#e94560',
  },
});
