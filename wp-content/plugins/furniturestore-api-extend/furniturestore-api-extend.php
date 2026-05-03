<?php
/**
 * Plugin Name: Furniturestore API Extend
 * Description: Plugin tùy chỉnh cung cấp các REST API riêng cho dự án Furniture's Store (Hỗ trợ kết nối hệ thống Mobile App).
 * Version: 2.0.0
 * Author: Nguyễn Hải Long & Nguyễn Văn Nghĩa & Nguyễn Hoàng Đức
 */

// Chặn truy cập trực tiếp vào file để bảo mật
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================
// PHẦN 1: ĐĂNG KÝ TẤT CẢ CÁC ENDPOINT REST API
// ============================================================
add_action('rest_api_init', 'furniturestore_register_custom_api');

function furniturestore_register_custom_api()
{

    // --- Endpoint 1: Kiểm tra trạng thái hệ thống (giữ nguyên từ GĐ2) ---
    register_rest_route('furniturestore/v1', '/system-status', array(
        'methods' => 'GET',
        'callback' => 'furniturestore_api_response',
        'permission_callback' => '__return_true'
    ));

    // --- Endpoint 2: Lấy danh sách sản phẩm bán chạy nhất ---
    register_rest_route('furniturestore/v1', '/top-products', array(
        'methods' => 'GET',
        'callback' => 'furniturestore_get_top_products',
        'permission_callback' => '__return_true'
    ));

    // --- Endpoint 3: Lấy danh sách danh mục sản phẩm ---
    register_rest_route('furniturestore/v1', '/categories', array(
        'methods' => 'GET',
        'callback' => 'furniturestore_get_categories',
        'permission_callback' => '__return_true'
    ));

    // --- Endpoint 4: Lấy danh sách sản phẩm (có lọc + phân trang) ---
    register_rest_route('furniturestore/v1', '/products', array(
        'methods' => 'GET',
        'callback' => 'furniturestore_get_products',
        'permission_callback' => '__return_true'
    ));

    // --- Endpoint 5: Lấy chi tiết 1 sản phẩm theo ID ---
    register_rest_route('furniturestore/v1', '/product/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'furniturestore_get_product_detail',
        'permission_callback' => '__return_true'
    ));

    // --- Endpoint 6: Tạo đơn hàng (Checkout) ---
    register_rest_route('furniturestore/v1', '/checkout', array(
        'methods' => 'POST',
        'callback' => 'furniturestore_create_order',
        'permission_callback' => '__return_true'
    ));

    // --- Endpoint 7: Lưu Push Token từ Mobile App (cho Firebase/Expo) ---
    register_rest_route('furniturestore/v1', '/save-token', array(
        'methods' => 'POST',
        'callback' => 'furniturestore_save_push_token',
        'permission_callback' => '__return_true'
    ));

    // --- Endpoint 8: Gợi ý sản phẩm từ Module AI Python ---
    register_rest_route('furniturestore/v1', '/recommend/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'furniturestore_get_recommendations',
        'permission_callback' => '__return_true'
    ));
}

// ============================================================
// PHẦN 2: CÁC HÀM XỬ LÝ (CALLBACK) CHO TỪNG ENDPOINT
// ============================================================

/**
 * Endpoint 1: Kiểm tra trạng thái hệ thống
 * URL: GET /wp-json/furniturestore/v1/system-status
 */
function furniturestore_api_response()
{
    $data = array(
        'status' => 'Success',
        'code' => 200,
        'message' => 'Hệ thống Backend của FurnitureStore đang hoạt động hoàn hảo!',
        'developer' => 'Nguyễn Hải Long',
        'version' => '2.0.0',
        'endpoints' => array(
            'GET  /furniturestore/v1/system-status',
            'GET  /furniturestore/v1/top-products',
            'GET  /furniturestore/v1/categories',
            'GET  /furniturestore/v1/products',
            'GET  /furniturestore/v1/product/{id}',
            'POST /furniturestore/v1/checkout',
            'POST /furniturestore/v1/save-token',
            'GET  /furniturestore/v1/recommend/{id}',
        ),
        'timestamp' => current_time('mysql')
    );

    return rest_ensure_response($data);
}

/**
 * Endpoint 2: Lấy sản phẩm bán chạy nhất
 * URL: GET /wp-json/furniturestore/v1/top-products?limit=10
 */
function furniturestore_get_top_products($request)
{
    $limit = absint($request->get_param('limit')) ?: 10;

    $args = array(
        'post_type' => 'product',
        'posts_per_page' => $limit,
        'post_status' => 'publish',
        'meta_key' => 'total_sales',
        'orderby' => 'meta_value_num',
        'order' => 'DESC',
    );
    $query = new WP_Query($args);
    $products = array();

    foreach ($query->posts as $post) {
        $product = wc_get_product($post->ID);
        if (!$product)
            continue;

        $products[] = furniturestore_format_product($product);
    }

    return rest_ensure_response($products);
}

/**
 * Endpoint 3: Lấy danh sách danh mục sản phẩm
 * URL: GET /wp-json/furniturestore/v1/categories
 */
function furniturestore_get_categories()
{
    $terms = get_terms(array(
        'taxonomy' => 'product_cat',
        'hide_empty' => false,
    ));

    $categories = array();
    foreach ($terms as $term) {
        $thumbnail_id = get_term_meta($term->term_id, 'thumbnail_id', true);
        $categories[] = array(
            'id' => $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'description' => $term->description,
            'count' => $term->count,
            'image' => $thumbnail_id ? wp_get_attachment_url($thumbnail_id) : null,
        );
    }

    return rest_ensure_response($categories);
}

/**
 * Endpoint 4: Lấy danh sách sản phẩm (hỗ trợ lọc theo danh mục + phân trang + tìm kiếm)
 * URL: GET /wp-json/furniturestore/v1/products?page=1&per_page=10&category=living-room&search=sofa
 */
function furniturestore_get_products($request)
{
    $page = absint($request->get_param('page')) ?: 1;
    $per_page = absint($request->get_param('per_page')) ?: 10;
    $category = sanitize_text_field($request->get_param('category'));
    $search = sanitize_text_field($request->get_param('search'));
    $orderby = sanitize_text_field($request->get_param('orderby')) ?: 'date';
    $order = sanitize_text_field($request->get_param('order')) ?: 'DESC';

    $args = array(
        'post_type' => 'product',
        'posts_per_page' => $per_page,
        'paged' => $page,
        'post_status' => 'publish',
        'orderby' => $orderby,
        'order' => $order,
    );

    // Lọc theo danh mục nếu có
    if (!empty($category)) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'product_cat',
                'field' => 'slug',
                'terms' => $category,
            ),
        );
    }

    // Tìm kiếm theo tên nếu có
    if (!empty($search)) {
        $args['s'] = $search;
    }

    $query = new WP_Query($args);
    $products = array();

    foreach ($query->posts as $post) {
        $product = wc_get_product($post->ID);
        if (!$product)
            continue;

        $products[] = furniturestore_format_product($product);
    }

    // Trả về kèm thông tin phân trang
    $response = array(
        'products' => $products,
        'total' => (int) $query->found_posts,
        'total_pages' => (int) $query->max_num_pages,
        'current_page' => $page,
        'per_page' => $per_page,
    );

    return rest_ensure_response($response);
}

/**
 * Endpoint 5: Lấy chi tiết 1 sản phẩm
 * URL: GET /wp-json/furniturestore/v1/product/123
 */
function furniturestore_get_product_detail($request)
{
    $product_id = absint($request['id']);
    $product = wc_get_product($product_id);

    if (!$product) {
        return new WP_Error(
            'product_not_found',
            'Không tìm thấy sản phẩm với ID: ' . $product_id,
            array('status' => 404)
        );
    }

    // Lấy tất cả ảnh gallery
    $gallery_ids = $product->get_gallery_image_ids();
    $gallery = array();
    foreach ($gallery_ids as $img_id) {
        $gallery[] = wp_get_attachment_url($img_id);
    }

    // Lấy danh mục
    $categories = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'names'));

    // Lấy thuộc tính sản phẩm
    $attributes = $product->get_attributes();
    $attributes_arr = array();
    foreach ($attributes as $attr) {
        $attributes_arr[] = array(
            'name' => wc_attribute_label($attr->get_name()),
            'options' => $attr->get_options(),
        );
    }

    $data = array(
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'slug' => $product->get_slug(),
        'price' => $product->get_price(),
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        'on_sale' => $product->is_on_sale(),
        'stock_status' => $product->get_stock_status(),
        'stock_quantity' => $product->get_stock_quantity(),
        'description' => $product->get_description(),
        'short_description' => $product->get_short_description(),
        'image' => wp_get_attachment_url($product->get_image_id()),
        'gallery' => $gallery,
        'categories' => $categories,
        'attributes' => $attributes_arr,
        'average_rating' => $product->get_average_rating(),
        'rating_count' => $product->get_rating_count(),
        'total_sales' => $product->get_total_sales(),
    );

    return rest_ensure_response($data);
}

/**
 * Endpoint 6: Tạo đơn hàng từ Mobile App
 * URL: POST /wp-json/furniturestore/v1/checkout
 * Body JSON: { billing: {...}, items: [{product_id, quantity}] }
 */
function furniturestore_create_order($request)
{
    $body = $request->get_json_params();

    // Validate dữ liệu đầu vào
    if (empty($body['items']) || !is_array($body['items'])) {
        return new WP_Error(
            'invalid_order',
            'Giỏ hàng trống hoặc dữ liệu không hợp lệ.',
            array('status' => 400)
        );
    }

    // Tạo đơn hàng mới bằng WooCommerce API
    $order = wc_create_order();

    // Thêm từng sản phẩm vào đơn hàng
    foreach ($body['items'] as $item) {
        $product_id = absint($item['product_id']);
        $quantity = absint($item['quantity']) ?: 1;
        $product = wc_get_product($product_id);

        if ($product) {
            $order->add_product($product, $quantity);
        }
    }

    // Gán thông tin khách hàng (billing)
    if (!empty($body['billing'])) {
        $billing = $body['billing'];
        $order->set_billing_first_name(sanitize_text_field($billing['first_name'] ?? ''));
        $order->set_billing_last_name(sanitize_text_field($billing['last_name'] ?? ''));
        $order->set_billing_email(sanitize_email($billing['email'] ?? ''));
        $order->set_billing_phone(sanitize_text_field($billing['phone'] ?? ''));
        $order->set_billing_address_1(sanitize_text_field($billing['address'] ?? ''));
        $order->set_billing_city(sanitize_text_field($billing['city'] ?? ''));
    }

    // Tính tổng tiền và lưu
    $order->calculate_totals();
    $order->set_status('processing');
    $order->save();

    return rest_ensure_response(array(
        'status' => 'success',
        'message' => 'Đặt hàng thành công!',
        'order_id' => $order->get_id(),
        'total' => $order->get_total(),
    ));
}

/**
 * Endpoint 7: Lưu Push Token từ Mobile App (cho Expo Push Notification)
 * URL: POST /wp-json/furniturestore/v1/save-token
 * Body JSON: { token: "ExponentPushToken[xxx]" }
 */
function furniturestore_save_push_token($request)
{
    $token = sanitize_text_field($request->get_param('token'));

    if (empty($token)) {
        return new WP_Error(
            'invalid_token',
            'Push token không được để trống.',
            array('status' => 400)
        );
    }

    // Lưu danh sách token (hỗ trợ nhiều thiết bị)
    $tokens = get_option('furniturestore_push_tokens', array());
    if (!in_array($token, $tokens)) {
        $tokens[] = $token;
        update_option('furniturestore_push_tokens', $tokens);
    }

    return rest_ensure_response(array(
        'status' => 'saved',
        'message' => 'Push token đã được lưu thành công.',
    ));
}

/**
 * Endpoint 8: Gợi ý sản phẩm từ Module AI Python (Giai đoạn 4)
 * URL: GET /wp-json/furniturestore/v1/recommend/123?limit=5
 * Gọi sang Flask server tại localhost:5000
 */
function furniturestore_get_recommendations($request)
{
    $product_id = absint($request['id']);
    $limit = absint($request->get_param('limit')) ?: 5;

    // Gọi sang Module AI Python (Flask API)
    $ai_url = "http://localhost:5000/api/recommend/{$product_id}?limit={$limit}";
    $response = wp_remote_get($ai_url, array('timeout' => 10));

    // Nếu Module AI chưa chạy, trả về sản phẩm liên quan theo danh mục (fallback)
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return furniturestore_fallback_recommendations($product_id, $limit);
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $recommended = array();

    if (!empty($body['recommended_ids'])) {
        foreach ($body['recommended_ids'] as $rec_id) {
            $product = wc_get_product($rec_id);
            if ($product) {
                $recommended[] = furniturestore_format_product($product);
            }
        }
    }

    return rest_ensure_response(array(
        'source' => 'ai',
        'products' => $recommended,
    ));
}

// ============================================================
// PHẦN 3: HÀM HỖ TRỢ (HELPER FUNCTIONS)
// ============================================================

/**
 * Format dữ liệu sản phẩm thống nhất cho tất cả endpoint
 * Tránh lặp code khi nhiều endpoint cùng trả về thông tin sản phẩm
 */
function furniturestore_format_product($product)
{
    return array(
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'slug' => $product->get_slug(),
        'price' => $product->get_price(),
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        'on_sale' => $product->is_on_sale(),
        'image' => wp_get_attachment_url($product->get_image_id()),
        'rating' => $product->get_average_rating(),
        'stock_status' => $product->get_stock_status(),
    );
}

/**
 * Fallback: Khi Module AI Python chưa chạy, gợi ý SP cùng danh mục
 */
function furniturestore_fallback_recommendations($product_id, $limit)
{
    $terms = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'ids'));

    if (empty($terms)) {
        return rest_ensure_response(array('source' => 'fallback', 'products' => array()));
    }

    $args = array(
        'post_type' => 'product',
        'posts_per_page' => $limit,
        'post_status' => 'publish',
        'post__not_in' => array($product_id),
        'tax_query' => array(
            array(
                'taxonomy' => 'product_cat',
                'field' => 'term_id',
                'terms' => $terms,
            ),
        ),
        'orderby' => 'rand',
    );

    $query = new WP_Query($args);
    $products = array();

    foreach ($query->posts as $post) {
        $product = wc_get_product($post->ID);
        if ($product) {
            $products[] = furniturestore_format_product($product);
        }
    }

    return rest_ensure_response(array(
        'source' => 'fallback',
        'products' => $products,
    ));
}

// ============================================================
// PHẦN 4: PUSH NOTIFICATION KHI ĐƠN HÀNG ĐỔI TRẠNG THÁI (GĐ4)
// ============================================================

/**
 * Hook: Khi đơn hàng chuyển trạng thái trên WooCommerce Admin,
 * tự động gửi Push Notification đến tất cả thiết bị đã đăng ký.
 */
add_action('woocommerce_order_status_changed', 'furniturestore_send_push_on_order_change', 10, 4);

function furniturestore_send_push_on_order_change($order_id, $old_status, $new_status, $order)
{
    $tokens = get_option('furniturestore_push_tokens', array());
    if (empty($tokens))
        return;

    // Tạo nội dung thông báo theo trạng thái
    $status_labels = array(
        'processing' => 'đang được xử lý',
        'completed' => 'đã hoàn thành',
        'on-hold' => 'đang chờ thanh toán',
        'cancelled' => 'đã bị hủy',
        'refunded' => 'đã được hoàn tiền',
        'shipped' => 'đang được vận chuyển',
    );
    $label = isset($status_labels[$new_status]) ? $status_labels[$new_status] : $new_status;

    $message = array(
        'title' => '🛋️ FurnitureStore',
        'body' => "Đơn hàng #{$order_id} {$label}.",
        'sound' => 'default',
    );

    // Gửi Push đến từng thiết bị qua Expo Push API
    foreach ($tokens as $token) {
        wp_remote_post('https://exp.host/--/api/v2/push/send', array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => wp_json_encode(array_merge($message, array('to' => $token))),
            'timeout' => 10,
        ));
    }
}
