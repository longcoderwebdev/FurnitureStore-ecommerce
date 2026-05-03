/**
 * FurnitureStore API Service
 * Kết nối Mobile App với WordPress REST API (WooCommerce)
 * 
 * LƯU Ý: Đổi BASE_URL khi test trên thiết bị thật
 * - Android Emulator: http://10.0.2.2:8080
 * - iOS Simulator:    http://localhost:8080
 * - Thiết bị thật:    http://<IP-máy-tính>:8080
 */

import axios from 'axios';

// === CẤU HÌNH API ===
// XAMPP Apache đang chạy trên port 8080
const BASE_URL = 'http://172.20.58.14:8080/LongWEB/FurnitureStore-ecommerce/wp-json';

// Custom API (endpoint tự viết trong plugin)
const customApi = axios.create({
  baseURL: `${BASE_URL}/furniturestore/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// === CÁC HÀM GỌI API ===

/** Kiểm tra hệ thống backend có hoạt động không */
export const getSystemStatus = () => customApi.get('/system-status');

/** Lấy danh sách sản phẩm bán chạy nhất */
export const getTopProducts = (limit = 10) =>
  customApi.get('/top-products', { params: { limit } });

/** Lấy danh sách danh mục sản phẩm */
export const getCategories = () => customApi.get('/categories');

/** 
 * Lấy danh sách sản phẩm (có hỗ trợ lọc + phân trang)
 * @param {number} page - Số trang
 * @param {number} perPage - Số SP mỗi trang
 * @param {string} category - Slug danh mục (tùy chọn)
 * @param {string} search - Từ khóa tìm kiếm (tùy chọn)
 */
export const getProducts = (page = 1, perPage = 10, category = '', search = '') =>
  customApi.get('/products', {
    params: {
      page,
      per_page: perPage,
      ...(category && { category }),
      ...(search && { search }),
    },
  });

/** Lấy chi tiết 1 sản phẩm theo ID */
export const getProductById = (id) => customApi.get(`/product/${id}`);

/** 
 * Tạo đơn hàng mới
 * @param {Object} orderData - { billing: {...}, items: [{product_id, quantity}] }
 */
export const createOrder = (orderData) => customApi.post('/checkout', orderData);

/** Lưu Push Token lên server để nhận thông báo */
export const savePushToken = (token) => customApi.post('/save-token', { token });

/** Lấy danh sách sản phẩm gợi ý (từ AI hoặc fallback) */
export const getRecommendations = (productId, limit = 5) =>
  customApi.get(`/recommend/${productId}`, { params: { limit } });

export default customApi;
