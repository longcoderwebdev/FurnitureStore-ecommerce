<?php
function sm_register_cpt_sinh_vien() {
    $labels = array(
        'name'               => 'Sinh viên',
        'singular_name'      => 'Sinh viên',
        'menu_name'          => 'Sinh viên',
        'add_new'            => 'Thêm mới',
        'add_new_item'       => 'Thêm Sinh viên mới',
        'edit_item'          => 'Sửa thông tin',
        'new_item'           => 'Sinh viên mới',
        'view_item'          => 'Xem Sinh viên',
        'search_items'       => 'Tìm kiếm Sinh viên',
        'not_found'          => 'Không tìm thấy sinh viên nào',
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'has_archive'         => true,
        'menu_icon'           => 'dashicons-welcome-learn-more',
        'supports'            => array( 'title', 'editor' ), // Hỗ trợ Họ tên (title) và Tiểu sử (editor)
    );

    register_post_type( 'sinh_vien', $args );
}
add_action( 'init', 'sm_register_cpt_sinh_vien' );