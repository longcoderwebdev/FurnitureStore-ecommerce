<?php
/**
 * Plugin Name: Furniturestore API Extend
 * Description: Plugin tùy chỉnh cung cấp các REST API riêng cho dự án Furniture's Store (Hỗ trợ kết nối hệ thống Mobile App).
 * Version: 1.0.0
 * Author: Nguyễn Hải Long & Nguyễn Văn Nghĩa & Nguyễn Hoàng Đức
 */

// Chặn truy cập trực tiếp vào file để bảo mật
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Hàm đăng ký một Endpoint (đường dẫn API) mới
add_action( 'rest_api_init', 'furniturestore_register_custom_api' );

function furniturestore_register_custom_api() {
    // Đổi đường dẫn API từ fuzzy/v1 thành furniturestore/v1
    register_rest_route( 'furniturestore/v1', '/system-status', array(
        'methods'  => 'GET',
        'callback' => 'furniturestore_api_response',
        'permission_callback' => '__return_true'
    ) );
}

// Hàm xử lý dữ liệu trả về khi API được gọi
function furniturestore_api_response() {
    $data = array(
        'status'  => 'Success',
        'code'    => 200,
        'message' => 'Hệ thống Backend của FurnitureStore đang hoạt động hoàn hảo!',
        'developer' => 'Nguyễn Hải Long',
        'timestamp' => current_time('mysql')
    );
    
    return rest_ensure_response( $data );
}
?>