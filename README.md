# Website Kênh Báo Giá Công Trình - Điện Máy KDT-89

Chào anh Tuấn! Đây là toàn bộ mã nguồn website **Điện Máy KDT-89**.

---

## ⚡ Cơ chế tự động cập nhật của Vercel (CI/CD)
Mỗi khi anh có bất kỳ thay đổi nào trên kho GitHub này (sửa chữ, đổi số điện thoại, tải ảnh mới lên), **Vercel sẽ tự động build lại và cập nhật website trực tiếp chỉ sau 30-45 giây** mà anh không cần làm thêm bất kỳ thao tác nào!

---

## 🛠️ Hướng dẫn cách chỉnh sửa sau khi đã lên GitHub & Vercel

### Cách 1: Sửa chữ, số điện thoại, địa chỉ (Trực tiếp trên web GitHub)
Toàn bộ thông tin quan trọng nhất của website được gom gọn gàng trong 1 file duy nhất:
👉 **`src/config/siteConfig.ts`**

1. Vào thư mục `src/config/` và bấm chọn file `siteConfig.ts`.
2. Bấm vào biểu tượng **cây bút ✏️ ("Edit this file")** ở góc phải trên.
3. Chỉnh sửa thông tin anh muốn:
   - Số điện thoại Hotline, Zalo của Ms Ngọc / Mr Dũng (dòng 20 - 25)
   - Địa chỉ công ty, giờ làm việc (dòng 26 - 28)
   - Bảng giá, mô tả sản phẩm máy lạnh, máy giặt, tủ lạnh...
4. Cuộn xuống cuối trang bấm nút xanh **"Commit changes"**.
5. Xong! Vercel sẽ tự động cập nhật web thật của anh ngay lập tức.

---

### Cách 2: Đổi Logo hoặc Thay ảnh công trình mới
1. Mở thư mục **`public/`** trên GitHub.
2. Bấm nút **"Add file"** ➔ chọn **"Upload files"**.
3. Kéo thả file ảnh từ máy tính của anh lên:
   - **Logo:** Đặt tên file là `logo.png` (sẽ tự động thay thế logo trên toàn bộ web).
   - **Ảnh công trình / kho:** Kéo ảnh lên và đặt tên dễ nhớ.
4. Bấm nút xanh **"Commit changes"**.
5. Vercel tự cập nhật web trong 30 giây!

---

### Cách 3: Nhờ AI Studio cập nhật giao diện / thêm tính năng mới
Khi anh muốn:
- Đổi cấu trúc trang web
- Thêm mục sản phẩm mới
- Đổi màu sắc, bố cục lớn
👉 Anh chỉ cần nhắn tin yêu cầu vào AI Studio, sau khi hoàn thành anh chỉ cần tải bản code mới về và đẩy lên GitHub là website trên Vercel tự cập nhật toàn bộ!
