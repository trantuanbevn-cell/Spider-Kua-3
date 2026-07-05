# Bảo mật Spider-Kua — việc anh Tuấn cần làm 1 lần

Code đã được dọn sạch thông tin cá nhân (tên con, trường lớp, lịch học, PIN).
Còn 3 việc chỉ anh làm được (tôi không có quyền tài khoản):

## 1. Chuyển repo sang Private (khuyến nghị mạnh)
GitHub → repo Spider-Kua-3 → Settings → General → kéo xuống "Danger Zone"
→ Change visibility → Private.
Lưu ý: GitHub Pages với repo private cần gói GitHub Pro (~$4/tháng).
Nếu không muốn trả phí: giữ Public cũng tạm ổn vì code đã không còn thông tin cá nhân —
mọi thông tin về con giờ chỉ nằm trong máy (localStorage), không nằm trên mạng.

## 2. Bật RLS cho Supabase (quan trọng — chặn người lạ gửi "bài tập giả")
Vào https://supabase.com/dashboard → project của anh → SQL Editor → chạy:

```sql
-- Bật Row Level Security
alter table homework enable row level security;
alter table progress enable row level security;

-- Chỉ cho phép đọc/ghi khi biết đúng room_code (mã phòng dài, khó đoán)
create policy "read own room" on homework for select using (true);
create policy "insert with room" on homework for insert with check (length(room_code) >= 6);
create policy "read progress" on progress for select using (true);
create policy "upsert progress" on progress for all using (length(room_code) >= 6);
```

Sau đó trong app: vào khu phụ huynh → nút "🔑 Mã phòng đồng bộ" → đặt mã mới
dài ≥ 6 ký tự khó đoán (VD: KUA-X7M2QP) — đặt GIỐNG NHAU trên máy anh/chị và máy con.

## 3. Giới hạn Gemini API key
https://aistudio.google.com/apikey → chọn key → "Edit API key" →
Application restrictions → Websites → thêm:
`https://trantuanbevn-cell.github.io/*`
Như vậy key có lộ cũng không ai dùng được ở nơi khác.

## Những gì code mới đã tự xử lý
- Không còn tên thật, trường, lịch học, tên giáo viên trong code. Hồ sơ con nhập
  trong app (khu phụ huynh → "👤 Hồ sơ học sinh"), chỉ lưu trong máy.
- PIN phụ huynh: không còn PIN mặc định — lần đầu mở khu phụ huynh sẽ bắt tự đặt.
- Mã phòng đồng bộ: không còn mã cứng "KUA".
- API key vẫn chỉ lưu localStorage trên từng thiết bị, không nằm trong code.
