import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createOrder } from '../services/api';

export default function CheckoutScreen({ route, navigation }) {
  const { cart = [], total = 0 } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '' });

  const update = (key, val) => setForm({ ...form, [key]: val });
  const fmt = (p) => parseInt(p).toLocaleString('vi-VN') + ' ₫';

  const handleOrder = async () => {
    if (!form.first_name || !form.phone || !form.address) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Họ tên, SĐT và Địa chỉ');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        billing: form,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      };
      const res = await createOrder(orderData);
      await AsyncStorage.removeItem('cart');
      Alert.alert('🎉 Đặt hàng thành công!', `Mã đơn: #${res.data.order_id}\nTổng: ${fmt(res.data.total)}`, [
        { text: 'Về trang chủ', onPress: () => navigation.popToTop() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'first_name', label: 'Họ và tên *', placeholder: 'Nguyễn Văn A' },
    { key: 'phone', label: 'Số điện thoại *', placeholder: '0901234567', keyboard: 'phone-pad' },
    { key: 'email', label: 'Email', placeholder: 'email@example.com', keyboard: 'email-address' },
    { key: 'address', label: 'Địa chỉ giao hàng *', placeholder: '123 Đường ABC, Quận 1' },
    { key: 'city', label: 'Thành phố', placeholder: 'TP. Hồ Chí Minh' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.title}>📋 Thông tin giao hàng</Text>
      {fields.map(f => (
        <View key={f.key} style={s.field}>
          <Text style={s.label}>{f.label}</Text>
          <TextInput style={s.input} placeholder={f.placeholder} placeholderTextColor="#666"
            value={form[f.key]} onChangeText={v => update(f.key, v)}
            keyboardType={f.keyboard || 'default'} />
        </View>
      ))}

      <Text style={[s.title, { marginTop: 24 }]}>🛒 Đơn hàng ({cart.length} sản phẩm)</Text>
      {cart.map((item, i) => (
        <View key={i} style={s.orderItem}>
          <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={s.itemQty}>x{item.quantity}</Text>
          <Text style={s.itemPrice}>{fmt(parseFloat(item.price) * item.quantity)}</Text>
        </View>
      ))}
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Tổng cộng:</Text>
        <Text style={s.totalPrice}>{fmt(total)}</Text>
      </View>

      <TouchableOpacity style={s.orderBtn} onPress={handleOrder} disabled={loading}>
        {loading ? <ActivityIndicator color="#1a1a2e" /> : <Text style={s.orderBtnT}>✅ Xác nhận đặt hàng</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  title: { color: '#e0c097', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  field: { marginBottom: 14 },
  label: { color: '#ccc', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#16213e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#eee', fontSize: 14, borderWidth: 1, borderColor: '#0f3460' },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#16213e' },
  itemName: { flex: 1, color: '#eee', fontSize: 14 },
  itemQty: { color: '#888', fontSize: 14, marginHorizontal: 12 },
  itemPrice: { color: '#e0c097', fontSize: 14, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 2, borderTopColor: '#0f3460' },
  totalLabel: { color: '#eee', fontSize: 18, fontWeight: 'bold' },
  totalPrice: { color: '#e0c097', fontSize: 24, fontWeight: 'bold' },
  orderBtn: { backgroundColor: '#e0c097', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  orderBtnT: { color: '#1a1a2e', fontSize: 16, fontWeight: 'bold' },
});
