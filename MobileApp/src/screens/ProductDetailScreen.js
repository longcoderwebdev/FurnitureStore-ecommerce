import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProductById, getRecommendations } from '../services/api';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => { fetchProduct(); }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const [prodRes, recRes] = await Promise.all([
        getProductById(productId),
        getRecommendations(productId, 4).catch(() => ({ data: { products: [] } })),
      ]);
      setProduct(prodRes.data);
      setRecommendations(recRes.data.products || []);
      navigation.setOptions({ title: prodRes.data.name });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
    } finally { setLoading(false); }
  };

  const addToCart = async () => {
    try {
      const cartJson = await AsyncStorage.getItem('cart');
      let cart = cartJson ? JSON.parse(cartJson) : [];
      const idx = cart.findIndex(i => i.product_id === product.id);
      if (idx >= 0) cart[idx].quantity += quantity;
      else cart.push({ product_id: product.id, name: product.name, price: product.price, image: product.image, quantity });
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('✅ Thành công', `Đã thêm ${quantity} sản phẩm vào giỏ hàng`, [
        { text: 'Tiếp tục', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (e) { Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng'); }
  };

  const fmt = (p) => p ? parseInt(p).toLocaleString('vi-VN') + ' ₫' : 'Liên hệ';

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#e0c097" /></View>;
  if (!product) return null;

  return (
    <ScrollView style={s.container}>
      <Image source={{ uri: product.image || 'https://via.placeholder.com/400' }} style={s.image} resizeMode="cover" />
      <View style={s.content}>
        <Text style={s.name}>{product.name}</Text>
        <View style={s.row}>
          {product.categories && <Text style={s.cat}>📂 {product.categories.join(', ')}</Text>}
          <Text style={[s.stock, product.stock_status === 'instock' ? s.green : s.red]}>
            {product.stock_status === 'instock' ? '● Còn hàng' : '● Hết hàng'}
          </Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.price}>{fmt(product.price)}</Text>
          {product.on_sale && product.regular_price && <Text style={s.oldPrice}>{fmt(product.regular_price)}</Text>}
          {product.on_sale && <View style={s.badge}><Text style={s.badgeT}>SALE</Text></View>}
        </View>
        {parseFloat(product.average_rating) > 0 && <Text style={s.rating}>⭐ {parseFloat(product.average_rating).toFixed(1)} ({product.rating_count} đánh giá)</Text>}
        
        {product.short_description ? (
          <View style={s.sec}>
            <Text style={s.secTitle}>📝 Mô tả</Text>
            <Text style={s.desc}>{product.short_description.replace(/<[^>]*>/g, '')}</Text>
          </View>
        ) : null}

        {product.attributes?.length > 0 && (
          <View style={s.sec}>
            <Text style={s.secTitle}>📋 Thuộc tính</Text>
            {product.attributes.map((a, i) => (
              <View key={i} style={s.attrRow}>
                <Text style={s.attrN}>{a.name}:</Text>
                <Text style={s.attrV}>{Array.isArray(a.options) ? a.options.join(', ') : a.options}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.cartArea}>
          <View style={s.qtyRow}>
            <TouchableOpacity style={s.qBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}><Text style={s.qBtnT}>−</Text></TouchableOpacity>
            <Text style={s.qtyT}>{quantity}</Text>
            <TouchableOpacity style={s.qBtn} onPress={() => setQuantity(quantity + 1)}><Text style={s.qBtnT}>+</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={[s.addBtn, product.stock_status !== 'instock' && s.disabled]} onPress={addToCart} disabled={product.stock_status !== 'instock'}>
            <Text style={s.addBtnT}>{product.stock_status === 'instock' ? '🛒 Thêm vào giỏ hàng' : 'Hết hàng'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  image: { width, height: width * 0.8, backgroundColor: '#0f3460' },
  content: { padding: 20 },
  name: { color: '#eee', fontSize: 22, fontWeight: 'bold', lineHeight: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cat: { color: '#888', fontSize: 13 },
  stock: { fontSize: 13, fontWeight: '600' },
  green: { color: '#4caf50' }, red: { color: '#e94560' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  price: { color: '#e0c097', fontSize: 28, fontWeight: 'bold' },
  oldPrice: { color: '#888', fontSize: 18, textDecorationLine: 'line-through' },
  badge: { backgroundColor: '#e94560', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeT: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  rating: { color: '#ffc107', fontSize: 14, marginTop: 8 },
  sec: { marginTop: 24 },
  secTitle: { color: '#e0c097', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  desc: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  attrRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#16213e' },
  attrN: { color: '#888', fontSize: 14, width: 120 },
  attrV: { color: '#eee', fontSize: 14, flex: 1 },
  cartArea: { marginTop: 24, gap: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 20 },
  qBtn: { backgroundColor: '#16213e', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#0f3460' },
  qBtnT: { color: '#e0c097', fontSize: 22, fontWeight: 'bold' },
  qtyT: { color: '#eee', fontSize: 22, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },
  addBtn: { backgroundColor: '#e0c097', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  disabled: { backgroundColor: '#555' },
  addBtnT: { color: '#1a1a2e', fontSize: 16, fontWeight: 'bold' },
});
