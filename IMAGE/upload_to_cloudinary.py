"""
KỊCH BẢN TẢI ẢNH LÊN CLOUDINARY VÀ LƯU TRỮ ĐƯỜNG DẪN (JSON & CSV) - PHIÊN BẢN V2 TỐI ƯU
-------------------------------------------------------------------------------------
Đặc điểm:
1. Tự động quét các thư mục thời trang (MEN, WOMEN, KIDS & BABY, SPORTS & UNISEX) trong d:\IMAGE.
2. Tự động chuẩn hóa tên folder và public_id trên Cloudinary (loại bỏ ký tự &, +, khoảng trắng lạ) để tránh lỗi invalid public_id.
3. Tự động lưu toàn bộ đường link URL vào file `cloudinary_links.json` và `cloudinary_links.csv`.
4. Cơ chế thông minh: Bỏ qua các ảnh đã upload thành công trước đó để tiết kiệm API Quota.

Hướng dẫn cài đặt thư viện (nếu chưa có):
pip install cloudinary

Hướng dẫn chạy:
python -u upload_to_cloudinary.py
"""

import os
import time
import json
import csv
import re
import cloudinary
import cloudinary.uploader
import cloudinary.api

# CẤU HÌNH THÔNG TIN TÀI KHOẢN CLOUDINARY
cloudinary.config( 
    cloud_name = "dmxxo6wgl", 
    api_key = "315628768938735", 
    api_secret = "w9ziEUTs3giXY9hR8O1S75NBIF4",
    secure = True
)

BASE_DIR = r"d:\IMAGE"
TARGET_FOLDERS = ["MEN", "WOMEN", "KIDS & BABY", "SPORTS & UNISEX"]
JSON_OUTPUT = os.path.join(BASE_DIR, "cloudinary_links.json")
CSV_OUTPUT = os.path.join(BASE_DIR, "cloudinary_links.csv")
CLOUDINARY_ROOT_FOLDER = "FASHION_DATA"

def sanitize_cloud_name(text):
    """Làm sạch các ký tự đặc biệt không hợp lệ trên Cloudinary (như &, +, khoảng trắng lạ)"""
    # Thay thế & thành and, + thành plus
    text = text.replace("&", "and").replace("+", "plus")
    # Thay thế các ký tự không phải chữ, số, gạch chéo, gạch ngang thành gạch dưới
    text = re.sub(r'[^a-zA-Z0-9_/-]', '_', text)
    # Loại bỏ các dấu gạch dưới thừa
    text = re.sub(r'_+', '_', text)
    return text

def load_existing_data():
    if os.path.exists(JSON_OUTPUT):
        try:
            with open(JSON_OUTPUT, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Lỗi đọc file JSON cũ: {e}. Khởi tạo mới.")
    return {}

def save_json_data(data):
    with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def save_csv_data(data):
    headers = ["Category", "Subcategory", "Local_Filename", "Cloudinary_URL", "Public_ID"]
    with open(CSV_OUTPUT, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for cat, subcats in data.items():
            for subcat, items in subcats.items():
                for item in items:
                    writer.writerow([
                        cat, 
                        subcat, 
                        item.get("local_filename"), 
                        item.get("cloudinary_url"), 
                        item.get("public_id")
                    ])

def start_upload():
    print("="*65)
    print("      KHỞI ĐỘNG TIẾN TRÌNH UPLOAD ẢNH LÊN CLOUDINARY (V2)  ")
    print("="*65)
    print(f"[*] Cloud Name: {cloudinary.config().cloud_name}")
    print(f"[*] Thư mục quét: {BASE_DIR}")
    print(f"[*] File lưu trữ JSON: {JSON_OUTPUT}")
    
    uploaded_records = load_existing_data()
    total_uploaded_session = 0
    total_skipped = 0
    total_errors = 0

    for cat in TARGET_FOLDERS:
        cat_path = os.path.join(BASE_DIR, cat)
        if not os.path.exists(cat_path):
            continue
            
        if cat not in uploaded_records:
            uploaded_records[cat] = {}

        for root, dirs, files in os.walk(cat_path):
            img_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            if not img_files:
                continue
                
            rel_subpath = os.path.relpath(root, cat_path)
            subcat_key = rel_subpath.replace('\\', '/')
            
            # Chuẩn hóa đường dẫn thư mục trên Cloudinary
            cloud_subfolder = sanitize_cloud_name(f"{cat}/{rel_subpath}".replace('\\', '/'))
            full_cloud_folder = f"{CLOUDINARY_ROOT_FOLDER}/{cloud_subfolder}"
            
            if subcat_key not in uploaded_records[cat]:
                uploaded_records[cat][subcat_key] = []
                
            existing_local_files = {item["local_filename"] for item in uploaded_records[cat][subcat_key]}
            
            print(f"\n[*] Đang xử lý danh mục: [{cat}] -> {subcat_key}")
            print(f"[*] Thư mục Cloudinary : {full_cloud_folder}")
            
            for img_name in img_files:
                if img_name in existing_local_files:
                    total_skipped += 1
                    continue
                    
                local_file_path = os.path.join(root, img_name)
                # Chuẩn hóa tên file trên Cloudinary để tránh lỗi public_id
                cloud_file_name = sanitize_cloud_name(os.path.splitext(img_name)[0])
                
                try:
                    res = cloudinary.uploader.upload(
                        local_file_path,
                        folder=full_cloud_folder,
                        public_id=cloud_file_name,
                        overwrite=True
                    )
                    
                    secure_url = res.get('secure_url')
                    public_id = res.get('public_id')
                    
                    record_item = {
                        "local_filename": img_name,
                        "cloudinary_url": secure_url,
                        "public_id": public_id,
                        "uploaded_at": time.strftime("%Y-%m-%d %H:%M:%S")
                    }
                    
                    uploaded_records[cat][subcat_key].append(record_item)
                    total_uploaded_session += 1
                    print(f"    [+] Upload thành công: {img_name}")
                    print(f"        -> URL: {secure_url}")
                    
                    save_json_data(uploaded_records)
                    save_csv_data(uploaded_records)
                    
                    time.sleep(0.5)
                    
                except Exception as e:
                    print(f"    [-] Lỗi upload file {img_name}: {e}")
                    total_errors += 1
                    time.sleep(2)

    print("\n" + "="*65)
    print("              BÁO CÁO TỔNG KẾT UPLOAD CLOUDINARY           ")
    print("="*65)
    print(f"[+] Số ảnh upload mới trong phiên : {total_uploaded_session}")
    print(f"[+] Số ảnh bỏ qua (đã có từ trước): {total_skipped}")
    print(f"[-] Số ảnh gặp lỗi upload         : {total_errors}")
    print(f"[+] Link tổng hợp JSON được lưu tại: {JSON_OUTPUT}")
    print(f"[+] Link tổng hợp CSV được lưu tại : {CSV_OUTPUT}")
    print("="*65)

if __name__ == "__main__":
    start_upload()
