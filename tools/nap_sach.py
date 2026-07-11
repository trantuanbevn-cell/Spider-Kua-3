#!/usr/bin/env python3
"""Nạp ảnh trang sách lên kho riêng Supabase (bucket 'sach').
Dùng: python3 nap_sach.py <thư-mục-ảnh> <mã-sách> <trang-bắt-đầu>
VD:   python3 nap_sach.py anh-sach/toan5 toan5 4
Ảnh được nén về rộng 1100px, jpg ~75%, đặt tên p004.jpg, p005.jpg... theo thứ tự tên file.
"""
import sys, os, io, urllib.request
from PIL import Image, ImageOps
SB_URL='https://fwzlxitynbpfjngiakqw.supabase.co'
SB_KEY=os.environ.get('SB_KEY','')  # export SB_KEY=<anon key> trước khi chạy
def main():
    folder, book, start = sys.argv[1], sys.argv[2], int(sys.argv[3])
    files=sorted(f for f in os.listdir(folder) if f.lower().endswith(('.jpg','.jpeg','.png','.heic','.webp')))
    for i,f in enumerate(files):
        im=ImageOps.exif_transpose(Image.open(os.path.join(folder,f))).convert('RGB')
        w=1100; im=im.resize((w,int(im.height*w/im.width)), Image.LANCZOS)
        buf=io.BytesIO(); im.save(buf,'JPEG',quality=75); data=buf.getvalue()
        page=start+i; name=f'p{page:03d}.jpg'
        req=urllib.request.Request(f'{SB_URL}/storage/v1/object/sach/{book}/{name}', data=data, method='POST',
            headers={'apikey':SB_KEY,'Authorization':f'Bearer {SB_KEY}','Content-Type':'image/jpeg','x-upsert':'true'})
        urllib.request.urlopen(req)
        print(f'✅ {f} → {book}/{name} ({len(data)//1024} KB)')
if __name__=='__main__': main()
