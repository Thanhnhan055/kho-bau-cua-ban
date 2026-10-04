# Kho Báu Của Bản – Bản sắc của mình

Website quảng bá và đặt tour của **Kho Báu Của Bản** – Nền tảng Giáo dục Di sản & Du lịch Văn hóa Bản địa:
học sinh trở thành người cứu giữ di sản qua hoạt động ghi chép tri thức dân gian từ nghệ nhân; kết hợp
triển lãm lưu động và bán ấn phẩm văn hóa tại điểm du lịch, homestay để tạo nguồn thu chia sẻ cho bản làng.

Trang tĩnh: HTML + CSS + JavaScript thuần, không cần build.

## Chạy trên máy

Mở trực tiếp `index.html` bằng trình duyệt, hoặc chạy một server tĩnh:

```bash
npx serve .
```

## Cấu trúc trang

1. Vì sao – thực trạng làng nghề, chính sách, giải pháp
2. Mô hình – vòng giá trị: ghi chép → số hóa → ấn phẩm, triển lãm → bán tại homestay → chia sẻ cho bản làng
3. Gói trải nghiệm – nhà trường, workshop, du khách, ấn phẩm (giá tham khảo)
4. Một ngày làm người ghi chép di sản
5. Nghệ nhân
6. Triển lãm lưu động & ấn phẩm
7. Đối tác – nhà trường, homestay, nghệ nhân, nhà tài trợ
8. Cam kết, mục tiêu thử nghiệm, lộ trình 6 tháng, đội ngũ
9. Hỏi đáp
10. Form đặt tour – tính giá tham khảo theo gói và số khách, soạn sẵn email gửi tới địa chỉ liên hệ

## Sửa giá và thông tin liên hệ

- Giá: hằng số `PRICE` trong `assets/js/main.js` và các thẻ `.pkg__price` trong `index.html`.
- Email nhận yêu cầu đặt tour: hằng số `CONTACT_EMAIL` trong `assets/js/main.js`.
- Số điện thoại, website, mạng xã hội: mục `#dat-tour` trong `index.html`.

## Ghi chú

- Form không có máy chủ: khi gửi, trang mở ứng dụng email với nội dung đã soạn sẵn.
- Ảnh nghệ nhân: Lý Thị Ninh (Ảnh: VietnamPlus), A Trang (Ảnh: Dân tộc & Phát triển).
