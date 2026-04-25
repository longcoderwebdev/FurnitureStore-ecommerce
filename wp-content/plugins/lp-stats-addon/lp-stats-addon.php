<?php
/**
 * Plugin Name: LearnPress Stats Dashboard
 * Description: Hiển thị bảng thống kê dữ liệu LearnPress ngoài Dashboard Admin và Frontend qua Shortcode.
 * Version: 1.0
 * Author: Your Name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Bảo mật: Ngăn chặn truy cập trực tiếp
}

// -------------------------------------------------------------
// Hàm xử lý logic truy vấn dữ liệu từ database LearnPress
// -------------------------------------------------------------
function lpsa_get_learnpress_stats() {
    global $wpdb;

    // 1. Tổng số khóa học hiện có (đã publish)
    $total_courses = wp_count_posts( 'lp_course' )->publish;

    // 2. Tổng số học viên đã đăng ký
    // Đếm số lượng user_id duy nhất trong bảng learnpress_user_items với loại item là 'lp_course'
    $table_user_items = $wpdb->prefix . 'learnpress_user_items';
    $total_students = $wpdb->get_var("
        SELECT COUNT(DISTINCT user_id) 
        FROM {$table_user_items} 
        WHERE item_type = 'lp_course'
    ");

    // 3. Số lượng khóa học đã được hoàn thành (Status: completed)
    $total_completed = $wpdb->get_var("
        SELECT COUNT(*) 
        FROM {$table_user_items} 
        WHERE item_type = 'lp_course' AND status = 'completed'
    ");

    return array(
        'courses'   => $total_courses ? $total_courses : 0,
        'students'  => $total_students ? $total_students : 0,
        'completed' => $total_completed ? $total_completed : 0
    );
}

// -------------------------------------------------------------
// Yêu cầu 1: Hiển thị Dashboard Widget trong trang quản trị Admin
// -------------------------------------------------------------
function lpsa_add_dashboard_widget() {
    wp_add_dashboard_widget(
        'lpsa_stats_widget',       // ID của widget
        'Thống kê LearnPress',     // Tiêu đề widget
        'lpsa_render_dashboard_widget' // Hàm render nội dung
    );
}
add_action( 'wp_dashboard_setup', 'lpsa_add_dashboard_widget' );

function lpsa_render_dashboard_widget() {
    $stats = lpsa_get_learnpress_stats();
    echo '<ul style="font-size: 16px; line-height: 1.8;">';
    echo '<li>📚 Tổng số khóa học: <strong>' . esc_html($stats['courses']) . '</strong></li>';
    echo '<li>👨‍🎓 Tổng số học viên đã đăng ký: <strong>' . esc_html($stats['students']) . '</strong></li>';
    echo '<li>✅ Số lượt hoàn thành khóa học: <strong>' . esc_html($stats['completed']) . '</strong></li>';
    echo '</ul>';
}

// -------------------------------------------------------------
// Yêu cầu 2: Tạo Shortcode [lp_total_stats] hiển thị ngoài Frontend
// -------------------------------------------------------------
function lpsa_shortcode_display() {
    $stats = lpsa_get_learnpress_stats();
    
    ob_start(); // Bắt đầu bộ đệm để thiết kế giao diện
    ?>
    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e1; max-width: 400px;">
        <h3 style="margin-top:0;">📊 Thống kê Hệ thống Học tập</h3>
        <p><strong>Tổng số khóa học:</strong> <?php echo esc_html($stats['courses']); ?></p>
        <p><strong>Tổng số học viên:</strong> <?php echo esc_html($stats['students']); ?></p>
        <p><strong>Đã hoàn thành:</strong> <?php echo esc_html($stats['completed']); ?></p>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'lp_total_stats', 'lpsa_shortcode_display' );