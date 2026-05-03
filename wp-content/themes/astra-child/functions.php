<?php
// Kế thừa CSS từ theme Astra gốc
add_action( 'wp_enqueue_scripts', 'fuzzy_enqueue_styles' );
function fuzzy_enqueue_styles() {
    wp_enqueue_style( 'astra-parent-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'fuzzy-child-style', get_stylesheet_directory_uri() . '/style.css', array('astra-parent-style') );
}

// ============================================================
// CHO PHÉP MOBILE APP GỌI API CROSS-ORIGIN (CORS)
// Cần thiết để Expo React Native App gọi được REST API từ thiết bị khác
// ============================================================
add_action( 'rest_api_init', function() {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
    add_filter( 'rest_pre_serve_request', function( $value ) {
        header( 'Access-Control-Allow-Origin: *' );
        header( 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce' );
        return $value;
    });
}, 15 );