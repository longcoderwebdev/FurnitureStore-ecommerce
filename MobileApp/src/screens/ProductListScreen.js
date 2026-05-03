import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';

export default function ProductListScreen({ route, navigation }) {
  const { category = '', title = 'Tất cả sản phẩm' } = route.params || {};

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title });
    fetchProducts(1, true);
  }, [category]);

  const fetchProducts = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await getProducts(pageNum, 10, category, search);
      const data = res.data;

      setProducts(prev => reset ? data.products : [...prev, ...data.products]);
      setTotalPages(data.total_pages);
      setPage(pageNum);
    } catch (error) {
      console.log('Lỗi tải sản phẩm:', error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = useCallback(() => {
    fetchProducts(1, true);
  }, [search, category]);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchProducts(page + 1, false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e0c097" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm sản phẩm..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#e0c097" style={{ padding: 16 }} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  searchContainer: { flexDirection: 'row', padding: 16, gap: 10 },
  searchInput: { flex: 1, backgroundColor: '#16213e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#eee', fontSize: 14, borderWidth: 1, borderColor: '#0f3460' },
  searchBtn: { backgroundColor: '#e0c097', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  searchBtnText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 14 },
  listContent: { paddingHorizontal: 16 },
  row: { justifyContent: 'space-between' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#888', fontSize: 16 },
});
