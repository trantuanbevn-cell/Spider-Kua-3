# Dựng S.H.I.E.L.D. Command trên Railway — làm 1 lần, ~20 phút

Sau khi xong, anh/chị có thể từ công ty:
- 📡 **Gọi vào học**: tablet reo như báo thức KỂ CẢ KHI APP ĐANG TẮT, reo lại
  mỗi 2 phút nếu con lờ đi, sau 10 phút không phản hồi → Telegram báo về.
- ✅ **Xác minh học thật**: con bấm "Con vào học ngay" mà 15 phút sau không
  thấy buổi học nào bắt đầu → Telegram báo "đã xác nhận nhưng chưa học".
- 📞 **Gọi**: tablet đổ chuông màn hình "BỐ MẸ ĐANG GỌI", con bấm nghe máy.
- 💬 **Nhắn 2 chiều**: bố mẹ nhắn → Fury đọc to trên tablet; con nhắn lại
  bằng giọng nói → về Telegram của bố mẹ.

## Bước 0 — SQL bảng tin nhắn (Supabase → SQL Editor, chạy 1 lần)
```sql
create table if not exists family_msgs (
  id bigserial primary key,
  room_code text not null,
  sender text,
  text text,
  ts timestamptz default now()
);
alter table family_msgs enable row level security;
create policy "read msgs" on family_msgs for select using (true);
create policy "insert msgs" on family_msgs for insert with check (length(room_code) >= 3);
```
(Nếu chưa chạy SQL app_config ở HUONG_DAN_THONG_BAO.md Bước 4 thì chạy trước.)

## Bước 1 — Tạo tài khoản & deploy (10 phút)
1. Vào https://railway.app → Login with GitHub → chọn gói **Hobby ($5/tháng)**.
2. New Project → **Deploy from GitHub repo** → chọn `Spider-Kua-3`.
3. Trong service vừa tạo → **Settings → Root Directory** → gõ: `server`
   (để Railway chỉ chạy thư mục server, không đụng vào web).
4. Railway tự build và chạy. Vào **Settings → Networking → Generate Domain**
   → được URL dạng `https://xxx.up.railway.app` → copy lại.

## Bước 2 — Biến môi trường (5 phút)
Service → **Variables** → thêm 6 biến:

| Tên | Giá trị |
|---|---|
| `SB_URL` | `https://fwzlxitynbpfjngiakqw.supabase.co` |
| `SB_KEY` | anon key Supabase (Supabase → Settings → API) |
| `TG_TOKEN` | token bot Telegram (đã tạo ở HUONG_DAN_THONG_BAO.md) |
| `TG_CHAT` | chat id Telegram |
| `ROOM` | mã phòng đồng bộ trong app |
| `ADMIN_KEY` | tự đặt 1 mã bí mật dài (VD: `SHIELD-Kua-2026-xyz`) — KHÁC mã PIN |

Lưu xong Railway tự khởi động lại. Mở `https://xxx.up.railway.app/health`
thấy `{"ok":true}` là server sống.

## Bước 3 — Nối app vào server (3 phút)
1. **Máy bố mẹ**: Bảng điều khiển → **🖥️ Server Command** → dán URL + ADMIN_KEY
   (+ link Zalo gọi con nếu muốn) → báo "Kết nối thành công".
2. **Cả 2 máy** (quan trọng nhất là tablet của con): Bảng điều khiển →
   **📳 Bật nhận thông báo** → bấm "Cho phép" khi trình duyệt hỏi.
   Trên tablet con: vào bằng 5 chạm logo 🛡️ + PIN rồi bấm nút này.
3. Tablet của con nên **cài app ra màn hình chính**: Chrome → menu ⋮ →
   "Thêm vào Màn hình chính" — để thông báo hoạt động ổn định nhất.

## Bước 4 — Thử ngay
Máy bố mẹ → nút đỏ **📡 GỌI VÀO HỌC** → tablet (đang tắt app) phải reo
thông báo trong vài giây. Con chạm vào → còi hú + Fury đọc lệnh + nút xác nhận.

## Ghi chú
- Có server rồi thì báo cáo 23h chạy luôn trên server (GitHub Actions cũ vẫn
  để được, nhận 2 tin thì vào Actions tắt workflow đi là còn 1).
- Thông báo đẩy hoạt động tốt trên Android/Chrome. iPhone/iPad cần iOS 16.4+
  và app phải được "Thêm vào MH chính".
- Chi phí: chỉ Railway $5/tháng, các phần khác 0đ.
