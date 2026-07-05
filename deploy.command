#!/bin/bash
# ═══ SPIDER-KUA AUTO DEPLOY ═══
# Cách dùng: sửa code xong, nháy đúp file này (hoặc chạy ./deploy.command)
# Web tự cập nhật sau ~1 phút tại: https://trantuanbevn-cell.github.io/Spider-Kua-3/

cd "$(dirname "$0")"

git add -A

if git diff --cached --quiet; then
  echo "ℹ️  Không có thay đổi nào để đẩy lên."
  exit 0
fi

git commit -m "Cập nhật $(date '+%d/%m/%Y %H:%M')"
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ ĐÃ DEPLOY! Web cập nhật sau ~1 phút:"
  echo "   https://trantuanbevn-cell.github.io/Spider-Kua-3/"
else
  echo ""
  echo "❌ Push thất bại. Nếu là lần đầu, cần đăng nhập GitHub:"
  echo "   Cách 1: brew install gh && gh auth login"
  echo "   Cách 2: dùng Personal Access Token làm mật khẩu khi git hỏi"
fi
