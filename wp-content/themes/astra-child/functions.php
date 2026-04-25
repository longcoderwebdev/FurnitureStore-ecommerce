<?php
// Kế thừa CSS từ theme Astra gốc
add_action( 'wp_enqueue_scripts', 'fuzzy_enqueue_styles' );
function fuzzy_enqueue_styles() {
    wp_enqueue_style( 'astra-parent-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'fuzzy-child-style', get_stylesheet_directory_uri() . '/style.css', array('astra-parent-style') );
}
?>