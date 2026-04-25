<?php
function sm_danh_sach_sinh_vien_shortcode() {
    ob_start(); // Bắt đầu buffer để không bị lỗi hiển thị đè

    // Truy vấn Post Type sinh_vien
    $args = array(
        'post_type'      => 'sinh_vien',
        'posts_per_page' => -1, // Lấy tất cả
        'post_status'    => 'publish'
    );
    $query = new WP_Query( $args );

    if ( $query->have_posts() ) {
        echo '<table class="sm-student-table">';
        echo '<thead><tr><th>STT</th><th>MSSV</th><th>Họ tên</th><th>Lớp</th><th>Ngày sinh</th></tr></thead>';
        echo '<tbody>';

        $stt = 1;
        while ( $query->have_posts() ) {
            $query->the_post();
            $post_id = get_the_ID();
            
            // Lấy meta data
            $mssv = get_post_meta( $post_id, '_sm_mssv', true );
            $lop = get_post_meta( $post_id, '_sm_lop', true );
            $ngay_sinh = get_post_meta( $post_id, '_sm_ngay_sinh', true );

            // Format lại ngày sinh (từ YYYY-MM-DD sang DD/MM/YYYY)
            $formatted_date = $ngay_sinh ? date('d/m/Y', strtotime($ngay_sinh)) : '';

            echo '<tr>';
            echo '<td>' . $stt . '</td>';
            echo '<td>' . esc_html( $mssv ) . '</td>';
            echo '<td>' . esc_html( get_the_title() ) . '</td>';
            echo '<td>' . esc_html( $lop ) . '</td>';
            echo '<td>' . esc_html( $formatted_date ) . '</td>';
            echo '</tr>';
            $stt++;
        }
        echo '</tbody></table>';
        wp_reset_postdata(); // Trả lại global post data
    } else {
        echo '<p>Chưa có dữ liệu sinh viên nào được nhập.</p>';
    }

    return ob_get_clean();
}
add_shortcode( 'danh_sach_sinh_vien', 'sm_danh_sach_sinh_vien_shortcode' );