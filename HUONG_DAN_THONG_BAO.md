# Bật thông báo về điện thoại bố mẹ — làm 1 lần, ~15 phút

Kết quả sau khi làm xong:
- 🟢 Con mở app → điện thoại bố mẹ nhận tin ngay
- 📚 Con bắt đầu buổi học → nhận tin
- 🏁 Con học xong → nhận tin kèm kết quả + nhận xét của Fury
- 🕚 23h đêm hằng ngày → tổng kết (kể cả hôm con KHÔNG học)
Thông báo hiện nổi trên màn hình điện thoại như tin nhắn, không cần mở app.

## Bước 1 — Tạo bot Telegram (5 phút)
1. Cài Telegram trên điện thoại bố và mẹ (nếu chưa có).
2. Tìm và chat với **@BotFather** → gõ `/newbot` → đặt tên (VD: SpiderKua Bot)
   → đặt username (VD: spiderkua_tb_bot).
3. BotFather trả về **TOKEN** dạng `1234567890:AAxxxxxxx...` → copy lại.

## Bước 2 — Lấy CHAT ID (3 phút)
Cách dễ nhất cho cả bố và mẹ cùng nhận tin:
1. Tạo 1 nhóm Telegram (VD: "Spider-Kua Báo cáo"), thêm bố + mẹ + bot vừa tạo.
2. Nhắn 1 tin bất kỳ vào nhóm.
3. Mở trình duyệt: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   (thay <TOKEN> bằng token thật) → tìm `"chat":{"id":-100xxxxx` → số đó
   (kể cả dấu trừ) là **CHAT ID**.

## Bước 3 — Nhập vào app (1 phút)
Máy bố mẹ → Bảng điều khiển → **🔔 Thông báo Telegram** → dán TOKEN và CHAT ID.
App sẽ gửi 1 tin thử — thấy tin trên điện thoại là xong. Cấu hình tự đồng bộ
sang máy của con qua mã phòng.

## Bước 4 — Bảng cấu hình trên Supabase (2 phút)
Supabase Dashboard → SQL Editor → chạy:

```sql
create table if not exists app_config (
  room_code text not null,
  k text not null,
  v text,
  primary key (room_code, k)
);
alter table app_config enable row level security;
create policy "read config" on app_config for select using (true);
create policy "write config" on app_config for insert with check (length(room_code) >= 3);
create policy "update config" on app_config for update using (true);
```

## Bước 5 — Hẹn giờ tổng kết 23h (5 phút)
GitHub → repo Spider-Kua-3 → **Settings → Secrets and variables → Actions**
→ New repository secret, tạo đủ 5 secret:

| Name | Value |
|---|---|
| `TG_TOKEN` | token bot ở Bước 1 |
| `TG_CHAT` | chat id ở Bước 2 |
| `SB_URL` | `https://fwzlxitynbpfjngiakqw.supabase.co` |
| `SB_KEY` | anon key Supabase (Settings → API trong Supabase) |
| `ROOM` | mã phòng đồng bộ trong app (Bảng điều khiển → 🔑) |

Chạy thử ngay không cần đợi 23h: repo → Actions → "Bao cao 23h dem"
→ Run workflow. Điện thoại nhận được tin tổng kết là hoàn tất.

Lưu ý: báo cáo 23h đọc dữ liệu từ bảng study_log (Bước 4 của SECURITY.md) —
cần chạy SQL đó trước thì tổng kết mới có số liệu.
