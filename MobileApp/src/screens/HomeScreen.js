import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import { getTopProducts, getCategories } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', loadCartCount);
    return unsubscribe;
  }, [navigation]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getTopProducts(10),
        getCategories(),
      ]);
      setTopProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.log('Lỗi tải dữ liệu:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const cart = await AsyncStorage.getItem('cart');
      const items = cart ? JSON.parse(cart) : [];
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (e) {}
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e0c097" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <FlatList
        data={topProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e0c097" />}
        ListHeaderComponent={
          <>
            <Header cartCount={cartCount} onCartPress={() => navigation.navigate('Cart')} />
            <View style={styles.banner}>
              <Text style={styles.bannerEmoji}>🏠</Text>
              <Text style={styles.bannerTitle}>Ưu đãi lên đến 50%</Text>
              <Text style={styles.bannerSubtitle}>Nội thất cao cấp cho ngôi nhà của bạn</Text>
            </View>
            <CategoryList
              categories={categories}
              onSelect={(cat) => navigation.navigate('ProductList', { category: cat.slug, title: cat.name })}
            />
            <Text style={styles.sectionTitle}>🔥 Sản phẩm bán chạy</Text>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  loadingText: { color: '#888', marginTop: 12, fontSize: 14 },
  listContent: { padding: 16 },
  row: { justifyContent: 'space-between' },
  banner: { backgroundColor: '#0f3460', borderRadius: 20, padding: 24, alignItems: 'center', marginVertical: 8, borderWidth: 1, borderColor: '#e0c097' },
  bannerEmoji: { fontSize: 48, marginBottom: 8 },
  bannerTitle: { color: '#e0c097', fontSize: 22, fontWeight: 'bold' },
  bannerSubtitle: { color: '#aaa', fontSize: 14, marginTop: 4 },
  sectionTitle: { color: '#e0c097', fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 14 },
});
