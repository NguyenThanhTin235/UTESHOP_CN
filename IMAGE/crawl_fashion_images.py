"""
KỊCH BẢN CRAWL SHOPEE TỐI ƯU HÓA CHỐNG BOT (AKAMAI / CLOUDFLARE BYPASS)
----------------------------------------------------------------------
Đặc điểm: Shopee sử dụng Akamai Bot Manager cực kỳ khắt khe để chặn Playwright.
Giải pháp Đột Phá:
1. Sử dụng thư viện `playwright-stealth` để che giấu hoàn toàn dấu vết WebDriver.
2. Tự động phát hiện trang Captcha (`/verify/captcha`) và dừng chờ 60 giây để bạn thao tác giải đố.

Hướng dẫn cài đặt bổ sung (chạy trong Terminal/Command Prompt):
pip install playwright-stealth

Hướng dẫn chạy:
python -u crawl_fashion_images.py
"""

import os
import time
import requests
import re
import urllib.parse
from playwright.sync_api import sync_playwright

try:
    from playwright_stealth import stealth_sync
except ImportError:
    print("[!] CHÚ Ý: Chưa cài đặt thư viện tàng hình chống bot 'playwright-stealth'.")
    print("[!] Hãy chạy lệnh: pip install playwright-stealth")
    stealth_sync = None

SHOPEE_CONFIG = [
    # --- MEN ---
    {"keyword": "áo sơ mi nam", "folder": r"d:\IMAGE\MEN\Clothing\Shirts"},
    {"keyword": "áo thun nam", "folder": r"d:\IMAGE\MEN\Clothing\T-Shirts"},
    {"keyword": "áo hoodie nam", "folder": r"d:\IMAGE\MEN\Clothing\Hoodies"},
    {"keyword": "quần dài nam", "folder": r"d:\IMAGE\MEN\Clothing\Pants"},
    {"keyword": "quần short nam", "folder": r"d:\IMAGE\MEN\Clothing\Shorts"},
    {"keyword": "áo khoác nam", "folder": r"d:\IMAGE\MEN\Outerwear\Jackets"},
    {"keyword": "giày sneaker nam", "folder": r"d:\IMAGE\MEN\Footwear\Sneakers"},
    
    # --- WOMEN ---
    {"keyword": "áo kiểu nữ thời trang", "folder": r"d:\IMAGE\WOMEN\Clothing\Tops"},
    {"keyword": "đầm váy nữ dự tiệc", "folder": r"d:\IMAGE\WOMEN\Dresses & Skirts\Casual & Formal Dresses"},
    {"keyword": "giày cao gót nữ", "folder": r"d:\IMAGE\WOMEN\Footwear\Heels"},

    # --- KIDS & BABY ---
    {"keyword": "quần áo trẻ em bé trai bé gái", "folder": r"d:\IMAGE\KIDS & BABY\Boys & Girls\Tops"},
    {"keyword": "bodysuit sơ sinh em bé", "folder": r"d:\IMAGE\KIDS & BABY\Baby (0-24M)\Bodysuits"},

    # --- SPORTS & UNISEX ---
    {"keyword": "bộ quần áo thể thao nam nữ", "folder": r"d:\IMAGE\SPORTS & UNISEX\Sportswear\Activewear"},
    {"keyword": "áo hoodie unisex form rộng", "folder": r"d:\IMAGE\SPORTS & UNISEX\Unisex\Hoodies"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def clean_filename(text):
    if not text:
        return ""
    clean = re.sub(r'[\\/*?:"<>|]', "", text)
    clean = clean.replace('\n', ' ').replace('\r', '').replace('/', '_')
    return clean[:60].strip()

def download_image(img_url, save_folder, file_name):
    try:
        if not os.path.exists(save_folder):
            os.makedirs(save_folder, exist_ok=True)
            
        file_path = os.path.join(save_folder, file_name)
        if os.path.exists(file_path):
            return True
            
        response = requests.get(img_url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            with open(file_path, 'wb') as f:
                f.write(response.content)
            print(f"    [+] Đã tải: {file_name}")
            return True
        else:
            return False
    except Exception as e:
        return False

def check_and_solve_captcha(page):
    """Kiểm tra nếu bị dính trang Captcha hoặc Anti-bot thì dừng chờ người dùng giải"""
    if "verify/captcha" in page.url or "anti_bot" in page.url or "traffic" in page.url:
        print("\n" + "!"*60)
        print(" [CẢNH BÁO] SHOPEE ĐANG CHẶN CAPTCHA / ANTI-BOT")
        print(" -> Trình duyệt đang bị chuyển hướng sang trang xác minh an ninh.")
        print(" -> VUI LÒNG NHÌN VÀO TRÌNH DUYỆT VÀ TỰ TAY KÉO THANH TRƯỢT / GIẢI CAPTCHA.")
        print(" -> Bạn có 60 giây để hoàn thành. Sau khi giải xong, kịch bản sẽ tự đi tiếp!")
        print("!"*60 + "\n")
        page.wait_for_timeout(60000) # Dừng chờ 60 giây
        print("[*] Đã hết thời gian chờ Captcha, tiếp tục kiểm tra...")
        return True
    return False

def start_crawling(max_items=5):
    profile_dir = r"d:\IMAGE\shopee_profile"
    if not os.path.exists(profile_dir):
        os.makedirs(profile_dir, exist_ok=True)

    print("="*60)
    print("    KHỞI ĐỘNG CRAWL SHOPEE (CHẾ ĐỘ TÀNG HÌNH STEALTH)       ")
    print("="*60)
    print(f"[*] Profile lưu tại: {profile_dir}")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=False,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1366, "height": 768},
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        
        page = context.pages[0] if context.pages else context.new_page()

        # BẬT CHẾ ĐỘ TÀNG HÌNH (STEALTH) NẾU CÓ THƯ VIỆN
        if stealth_sync:
            stealth_sync(page)
            print("[+] Đã bật chế độ Tàng Hình (Stealth Mode) chống phát hiện WebDriver.")

        print("\n[*] Đang truy cập Shopee để kiểm tra trạng thái...")
        page.goto("https://shopee.vn", timeout=60000)
        page.wait_for_timeout(5000)

        # Kiểm tra Captcha ngay trang chủ
        check_and_solve_captcha(page)

        if "login" in page.url or page.locator('a[href*="login"]').count() > 0:
            print("\n" + "!"*60)
            print(" [CHÚ Ý] SHOPEE YÊU CẦU ĐĂNG NHẬP")
            print(" -> Vui lòng thao tác ĐĂNG NHẬP trực tiếp trên cửa sổ trình duyệt.")
            print(" -> Bạn có 60 giây để đăng nhập.")
            print("!"*60 + "\n")
            page.wait_for_timeout(60000)

        for config in SHOPEE_CONFIG:
            keyword = config["keyword"]
            target_folder = config["folder"]
            
            print(f"\n{'='*60}")
            print(f"[*] Đang tìm kiếm: '{keyword}'")
            print(f"[*] Thư mục lưu: {target_folder}")
            print(f"{'='*60}")

            encoded_keyword = urllib.parse.quote(keyword)
            search_url = f"https://shopee.vn/search?keyword={encoded_keyword}"

            try:
                page.goto(search_url, timeout=60000)
                page.wait_for_timeout(3000)
                
                # Kiểm tra xem có bị dính Captcha khi search không
                if check_and_solve_captcha(page):
                    # Chờ thêm 3s để trang kết quả load sau khi giải captcha
                    page.wait_for_timeout(3000)
                
                print("  [*] Đang cuộn trang bằng phím PageDown...")
                for _ in range(6):
                    page.keyboard.press("PageDown")
                    page.wait_for_timeout(2000)
                    
                all_imgs = page.locator('img').all()
                print(f"  [*] Tổng số thẻ <img> tìm thấy: {len(all_imgs)}")
                
                count = 0
                for idx, img in enumerate(all_imgs):
                    if count >= max_items:
                        break
                        
                    try:
                        img_url = img.get_attribute('src') or img.get_attribute('data-src')
                        if not img_url or "http" not in img_url:
                            continue
                            
                        if any(bad in img_url for bad in ['logo', 'icon', 'banner', 'badge', 'official_store', 'rating', 'captcha']):
                            continue
                            
                        alt_text = img.get_attribute('alt')
                        safe_title = clean_filename(alt_text)
                        
                        if not safe_title or len(safe_title) < 5:
                            safe_title = f"{clean_filename(keyword)}_{count+1}"
                            
                        file_name = f"{safe_title}.jpg"
                        
                        if download_image(img_url, target_folder, file_name):
                            count += 1
                            time.sleep(1)
                            
                    except Exception as item_err:
                        continue
                        
                print(f"  [+] Đã xử lý xong danh mục '{keyword}'. Tải thành công {count} ảnh.")
                        
            except Exception as e:
                print(f"  [-] Lỗi trong quá trình tìm {keyword}: {e}")
                
            time.sleep(3)

        context.close()
        print("\n[+] Hoàn tất toàn bộ quá trình cào dữ liệu từ Shopee!")

if __name__ == "__main__":
    ITEMS_PER_CATEGORY = 5
    start_crawling(max_items=ITEMS_PER_CATEGORY)
