# Spider-Kua 4.0 — Gia sư AI cho học sinh lớp 4

App học tập cá nhân hóa: chat với gia sư AI "Nick Fury", luyện tập ngân hàng
1.100 câu hỏi cả năm lớp 4 (Toán · Tiếng Việt · Tiếng Anh 4 kỹ năng),
đồng bộ bài tập bố mẹ giao, hệ thống xu/XP/huy hiệu.

## Cấu trúc
| File | Vai trò |
|---|---|
| `index.html` | Khung giao diện |
| `styles.css` | Toàn bộ giao diện |
| `app.js` | Logic chính: chat Fury, TKB, lịch thi, xu, đồng bộ |
| `practice.js` | Engine luyện tập (trắc nghiệm, toán giải có gợi ý, nghe-nói-đọc-viết TA) |
| `tts.js` | Giọng nói Gemini TTS (fallback giọng máy) |
| `sw.js` | Service worker — mở nhanh, offline một phần |
| `data/index.json` | Mục lục kho bài tập |
| `data/toan/` `data/tv/` `data/ta/` | Ngân hàng câu hỏi theo chủ đề |
| `SGK_*.txt` | Văn bản SGK để Fury tra cứu (tải khi cần) |

## Phát triển & deploy
Sửa code xong → nháy đúp `deploy.command` (macOS) — tự commit + push,
GitHub Pages tự cập nhật sau ~1 phút.

## Bảo mật
Đọc `SECURITY.md` — có 3 việc cần làm 1 lần trên tài khoản GitHub/Supabase/Google.
