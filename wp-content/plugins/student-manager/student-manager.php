<?php
/**
 * Plugin Name: Student Manager
 * Description: Plugin quản lý sinh viên với Custom Post Type, Custom Meta Boxes và hiển thị qua Shortcode.
 * Version: 1.0
 * Author: Your Name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Bảo mật: Ngăn chặn truy cập trực tiếp
}

// Include các file chức năng từ thư mục includes
require_once plugin_dir_path( __FILE__ ) . 'includes/cpt.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/meta-boxes.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/shortcode.php';

// Đăng ký CSS cho frontend để bảng hiển thị đẹp hơn
function sm_enqueue_styles() {
    wp_enqueue_style('sm-style', plugin_dir_url(__FILE__) . 'assets/style.css');
}
add_action('wp_enqueue_scripts', 'sm_enqueue_styles');