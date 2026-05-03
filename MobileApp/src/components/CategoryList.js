/**
 * CategoryList - Component hiển thị danh sách danh mục ngang (horizontal scroll)
 * Dùng trên HomeScreen
 */

import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

export default function CategoryList({ categories, onSelect }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chip}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.chipText}>{item.name}</Text>
      {item.count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{item.count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📂 Danh mục</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    color: '#e0c097',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  list: {
    paddingHorizontal: 4,
    gap: 10,
  },
  chip: {
    backgroundColor: '#16213e',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  chipText: {
    color: '#eee',
    fontSize: 14,
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: '#e94560',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
