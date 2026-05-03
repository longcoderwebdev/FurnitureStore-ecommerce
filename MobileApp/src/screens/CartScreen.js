import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadCart);
    return unsub;
  }, [navigation]);

  const loadCart = async () => {
    const json = await AsyncStorage.getItem('cart');
    setCart(json ? JSON.parse(json) : []);
  };

  const saveCart = async (newCart) => {
    setCart(newCart);
    await AsyncStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQty = (idx, delta) => {
    const c = [...cart];
    c[idx].quantity = Math.max(1, c[idx].quantity + delta);
    saveCart(c);
  };

  const removeItem = (idx) => {
    Alert.alert('Xác nhận', 'Xóa sản phẩm này khỏi giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => { const c = [...cart]; c.splice(idx, 1); saveCart(c); } },
    ]);
  };

  const total = cart.reduce((s, i) => s + (parseFloat(i.price) || 0) * i.quantity, 0);
  const fmt = (p) => parseInt(p).toLocaleString('vi-VN') + ' ₫';

  if (cart.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={{ fontSize: 64 }}>🛒</Text>
        <Text style={s.emptyT}>Giỏ hàng trống</Text>
        <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={s.shopBtnT}>Tiếp tục mua sắm</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={cart}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => (
          <View style={s.item}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/80' }} style={s.img} />
            <View style={s.info}>
              <Text style={s.name} numberOfLines={2}>{item.name}</Text>
              <Text style={s.price}>{fmt(item.price)}</Text>
              <View style={s.qRow}>
                <TouchableOpacity style={s.qBtn} onPress={() => updateQty(index, -1)}><Text style={s.qBtnT}>−</Text></TouchableOpacity>
                <Text style={s.qty}>{item.quantity}</Text>
                <TouchableOpacity style={s.qBtn} onPress={() => updateQty(index, 1)}><Text style={s.qBtnT}>+</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(index)} style={{ marginLeft: 'auto' }}>
                  <Text style={{ color: '#e94560', fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      <View style={s.footer}>
        <View>
          <Text style={s.totalLabel}>Tổng cộng</Text>
          <Text style={s.totalPrice}>{fmt(total)}</Text>
        </View>
        <TouchableOpacity style={s.checkoutBtn} onPress={() => navigation.navigate('Checkout', { cart, total })}>
          <Text style={s.checkoutT}>Thanh toán →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  empty: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  emptyT: { color: '#888', fontSize: 18, marginTop: 16 },
  shopBtn: { marginTop: 20, backgroundColor: '#e0c097', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shopBtnT: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 14 },
  item: { flexDirection: 'row', backgroundColor: '#16213e', borderRadius: 16, padding: 12, marginBottom: 12 },
  img: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#0f3460' },
  info: { flex: 1, marginLeft: 12 },
  name: { color: '#eee', fontSize: 14, fontWeight: '600' },
  price: { color: '#e0c097', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  qRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  qBtn: { backgroundColor: '#0f3460', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qBtnT: { color: '#e0c097', fontSize: 18, fontWeight: 'bold' },
  qty: { color: '#eee', fontSize: 16, fontWeight: 'bold', minWidth: 24, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#16213e', borderTopWidth: 1, borderTopColor: '#0f3460' },
  totalLabel: { color: '#888', fontSize: 12 },
  totalPrice: { color: '#e0c097', fontSize: 22, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: '#e0c097', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  checkoutT: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 15 },
});
