/**
 * AppNavigator - Điều hướng giữa các màn hình trong ứng dụng
 * Sử dụng React Navigation (Native Stack)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          // Thiết kế header chung cho tất cả màn hình
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#e0c097',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '🛋️ FurnitureStore' }}
        />
        <Stack.Screen
          name="ProductList"
          component={ProductListScreen}
          options={{ title: 'Sản Phẩm' }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: 'Chi Tiết' }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: '🛒 Giỏ Hàng' }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: 'Thanh Toán' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
