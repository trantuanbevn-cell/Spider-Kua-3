# 📚 Đưa sách lớp 5 vào app — hướng dẫn cho bố mẹ

## Cách hoạt động
1. Anh chụp các trang sách (sách nhà mình đã mua) → thả cả loạt ảnh vào thư mục `Spider Kua` trên máy tính, đặt trong thư mục con theo tên sách:
   - `anh-sach/toan5/` — SGK Toán 5
   - `anh-sach/tv5/` — SGK Tiếng Việt 5
   - `anh-sach/vbt_toan5/` — VBT Toán 5
   - `anh-sach/vbt_tv5/` — VBT Tiếng Việt 5
   Tên ảnh không quan trọng, chỉ cần CHỤP THEO THỨ TỰ TRANG (ảnh 1 = trang đầu tiên chụp). Nhắn Claude "nạp sách" kèm số trang bắt đầu, mọi việc còn lại (nén ảnh, đặt tên trang, đưa lên kho riêng) Claude làm hết.
2. Ảnh nằm trong kho RIÊNG Supabase của gia đình — không nằm trong mã nguồn công khai. Dùng cá nhân, không phát tán = đúng Điều 25 Luật SHTT.

## Giao bài theo trang
Trong ô "Giao bài tập từ xa" gõ tự nhiên: `Toán 5 trang 28-29 bài 1,2,3` hoặc bấm nút mẫu. Máy Kua sẽ hiện nút **MỞ SGK TOÁN 5 — TRANG 28–29**: con xem đúng ảnh trang sách, bấm **🛡️ FURY DẠY TRANG NÀY** là Fury tự ĐỌC trang sách đó (Gemini Vision) và giảng từng bài, từng bước — không làm hộ đáp án.

## Chuẩn bị 1 lần (SQL)
Chạy trong Supabase → SQL Editor:
```sql
insert into storage.buckets (id, name, public) values ('sach','sach', false)
on conflict (id) do nothing;
drop policy if exists "sach read" on storage.objects;
drop policy if exists "sach write" on storage.objects;
create policy "sach read"  on storage.objects for select using (bucket_id = 'sach');
create policy "sach write" on storage.objects for insert with check (bucket_id = 'sach');
```
