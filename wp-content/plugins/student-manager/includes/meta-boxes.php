<?php
// 1. Tạo Meta Box
function sm_add_meta_boxes() {
    add_meta_box(
        'sm_student_info',
        'Thông tin bổ sung',
        'sm_render_meta_box',
        'sinh_vien',
        'normal',
        'high'
    );
}
add_action( 'add_meta_boxes', 'sm_add_meta_boxes' );

// 2. Render giao diện nhập liệu
function sm_render_meta_box( $post ) {
    // Tạo Nonce để bảo mật
    wp_nonce_field( 'sm_save_meta_box_data', 'sm_meta_box_nonce' );

    // Lấy dữ liệu cũ (nếu có)
    $mssv = get_post_meta( $post->ID, '_sm_mssv', true );
    $lop = get_post_meta( $post->ID, '_sm_lop', true );
    $ngay_sinh = get_post_meta( $post->ID, '_sm_ngay_sinh', true );

    $majors = array(
        'CNTT' => 'Công nghệ thông tin', 
        'Kinh tế' => 'Kinh tế', 
        'Marketing' => 'Marketing', 
        'Ngôn ngữ Trung' => 'Ngôn ngữ Trung'
    );

    // Form nhập liệu
    echo '<p><label for="sm_mssv"><strong>Mã số sinh viên:</strong></label><br>';
    echo '<input type="text" id="sm_mssv" name="sm_mssv" value="' . esc_attr( $mssv ) . '" style="width:100%;" /></p>';

    echo '<p><label for="sm_lop"><strong>Lớp/Chuyên ngành:</strong></label><br>';
    echo '<select id="sm_lop" name="sm_lop" style="width:100%;">';
    echo '<option value="">-- Chọn chuyên ngành --</option>';
    foreach ($majors as $value => $label) {
        $selected = selected( $lop, $value, false );
        echo '<option value="' . esc_attr($value) . '" ' . $selected . '>' . esc_html($label) . '</option>';
    }
    echo '</select></p>';

    echo '<p><label for="sm_ngay_sinh"><strong>Ngày sinh:</strong></label><br>';
    echo '<input type="date" id="sm_ngay_sinh" name="sm_ngay_sinh" value="' . esc_attr( $ngay_sinh ) . '" style="width:100%;" /></p>';
}

// 3. Xử lý lưu dữ liệu an toàn (Sanitize)
function sm_save_meta_box_data( $post_id ) {
    // Kiểm tra Nonce
    if ( ! isset( $_POST['sm_meta_box_nonce'] ) ) return;
    if ( ! wp_verify_nonce( $_POST['sm_meta_box_nonce'], 'sm_save_meta_box_data' ) ) return;
    
    // Bỏ qua nếu đang autosave
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    
    // Kiểm tra quyền
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    // Sanitize và Lưu dữ liệu
    if ( isset( $_POST['sm_mssv'] ) ) {
        update_post_meta( $post_id, '_sm_mssv', sanitize_text_field( $_POST['sm_mssv'] ) );
    }
    if ( isset( $_POST['sm_lop'] ) ) {
        update_post_meta( $post_id, '_sm_lop', sanitize_text_field( $_POST['sm_lop'] ) );
    }
    if ( isset( $_POST['sm_ngay_sinh'] ) ) {
        update_post_meta( $post_id, '_sm_ngay_sinh', sanitize_text_field( $_POST['sm_ngay_sinh'] ) );
    }
}
add_action( 'save_post', 'sm_save_meta_box_data' );