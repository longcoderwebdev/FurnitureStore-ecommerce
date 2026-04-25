# Student Manager Plugin

Đây là plugin WordPress cho phép quản trị viên thêm mới, chỉnh sửa và hiển thị danh sách sinh viên ra ngoài Frontend.

## Tính năng
- **Backend:** Đăng ký Custom Post Type "Sinh viên". Hỗ trợ nhập MSSV, Lớp/Chuyên ngành, Ngày sinh qua Custom Meta Box. Dữ liệu được bảo vệ bằng Nonce và Sanitize.
- **Frontend:** Hiển thị danh sách dạng bảng thông qua shortcode `[danh_sach_sinh_vien]`.

## Hướng dẫn cài đặt
1. Tải file `student-manager.zip` về máy.
2. Vào WordPress Admin > Plugins > Add New > Upload Plugin.
3. Tải lên file `.zip` và nhấn Activate.

## Hướng dẫn sử dụng
1. Sau khi kích hoạt, nhìn sang thanh menu bên trái, chọn mục **Sinh viên** > **Thêm mới**.
2. Nhập Họ tên (Tiêu đề), Tiểu sử (Nội dung) và điền đầy đủ MSSV, Lớp, Ngày sinh ở khu vực "Thông tin bổ sung".
3. Nhấn **Publish** (Đăng).
4. Tạo một Page hoặc Post mới, chèn đoạn shortcode `[danh_sach_sinh_vien]` vào nội dung.
5. Xem trang ngoài frontend để thấy kết quả.

## Ảnh minh họa kết quả

### 1. Khu vực thêm mới Sinh viên (Backend)
![Backend CPT và Meta Box](Link_anh_chup_man_hinh_backend_cua_ban_tai_day)
*(Ghi chú: Ảnh chụp màn hình giao diện nhập liệu Sinh viên)*

### 2. Bảng hiển thị Sinh viên (Frontend)
![Frontend Shortcode Table](Link_anh_chup_man_hinh_frontend_cua_ban_tai_day)
*(Ghi chú: Ảnh chụp màn hình bảng danh sách hiển thị ngoài page)*