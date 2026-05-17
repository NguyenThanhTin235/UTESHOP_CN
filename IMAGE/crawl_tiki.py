"""
KỊCH BẢN CRAWL DỮ LIỆU THỜI TRANG TỪ TIKI.VN (FULL 39 THƯ MỤC 3 CẤP)
-------------------------------------------------------------------
Đặc điểm:
1. Bao phủ toàn bộ 39 thư mục 3 cấp theo đúng đặc tả kiến trúc ban đầu.
2. Số lượng ảnh tải về: 10 ảnh chất lượng cao (750x750) cho mỗi danh mục (Tổng cộng ~390 ảnh).
3. Sử dụng Tiki API siêu tốc kết hợp cơ chế tự động làm sạch tên file.

Hướng dẫn chạy:
python -u crawl_tiki.py
"""

import os
import time
import requests
import re
import urllib.parse
from playwright.sync_api import sync_playwright

# CẤU HÌNH TOÀN BỘ 39 DANH MỤC 3 CẤP VỚI TỪ KHÓA TIKI CHUẨN XÁC
TIKI_CONFIG = [
    # ==================== 1. MEN (12 Thư mục) ====================
    {"keyword": "áo sơ mi nam", "folder": r"d:\IMAGE\MEN\Clothing\Shirts"},
    {"keyword": "áo thun nam", "folder": r"d:\IMAGE\MEN\Clothing\T-Shirts"},
    {"keyword": "áo hoodie nam", "folder": r"d:\IMAGE\MEN\Clothing\Hoodies"},
    {"keyword": "quần dài nam", "folder": r"d:\IMAGE\MEN\Clothing\Pants"},
    {"keyword": "quần short nam", "folder": r"d:\IMAGE\MEN\Clothing\Shorts"},
    {"keyword": "áo khoác nam", "folder": r"d:\IMAGE\MEN\Outerwear\Jackets"},
    {"keyword": "áo blazer nam", "folder": r"d:\IMAGE\MEN\Outerwear\Blazers"},
    {"keyword": "áo khoác phao nam mùa đông", "folder": r"d:\IMAGE\MEN\Outerwear\Winter Coats"},
    {"keyword": "giày sneaker nam", "folder": r"d:\IMAGE\MEN\Footwear\Sneakers"},
    {"keyword": "giày tây nam công sở", "folder": r"d:\IMAGE\MEN\Footwear\Dress Shoes"},
    {"keyword": "giày boot nam", "folder": r"d:\IMAGE\MEN\Footwear\Boots"},
    {"keyword": "giày sandal nam", "folder": r"d:\IMAGE\MEN\Footwear\Sandals"},
    
    # ==================== 2. WOMEN (15 Thư mục) ====================
    {"keyword": "áo kiểu nữ", "folder": r"d:\IMAGE\WOMEN\Clothing\Tops"},
    {"keyword": "áo sơ mi nữ", "folder": r"d:\IMAGE\WOMEN\Clothing\Blouses"},
    {"keyword": "quần dài nữ", "folder": r"d:\IMAGE\WOMEN\Clothing\Pants"},
    {"keyword": "quần short nữ", "folder": r"d:\IMAGE\WOMEN\Clothing\Shorts"},
    {"keyword": "quần legging nữ", "folder": r"d:\IMAGE\WOMEN\Clothing\Leggings"},
    {"keyword": "đầm váy nữ dự tiệc", "folder": r"d:\IMAGE\WOMEN\Dresses & Skirts\Casual & Formal Dresses"},
    {"keyword": "chân váy nữ", "folder": r"d:\IMAGE\WOMEN\Dresses & Skirts\Skirts"},
    {"keyword": "áo blazer nữ", "folder": r"d:\IMAGE\WOMEN\Outerwear\Blazers"},
    {"keyword": "áo khoác nữ", "folder": r"d:\IMAGE\WOMEN\Outerwear\Jackets"},
    {"keyword": "áo khoác măng tô nữ", "folder": r"d:\IMAGE\WOMEN\Outerwear\Coats"},
    {"keyword": "giày cao gót nữ", "folder": r"d:\IMAGE\WOMEN\Footwear\Heels"},
    {"keyword": "giày búp bê nữ đế bằng", "folder": r"d:\IMAGE\WOMEN\Footwear\Flats"},
    {"keyword": "giày sneaker nữ", "folder": r"d:\IMAGE\WOMEN\Footwear\Sneakers"},
    {"keyword": "giày boot nữ", "folder": r"d:\IMAGE\WOMEN\Footwear\Boots"},
    {"keyword": "giày sandal nữ", "folder": r"d:\IMAGE\WOMEN\Footwear\Sandals"},

    # ==================== 3. KIDS & BABY (7 Thư mục) ====================
    {"keyword": "áo trẻ em bé trai bé gái", "folder": r"d:\IMAGE\KIDS & BABY\Boys & Girls\Tops"},
    {"keyword": "quần trẻ em bé trai bé gái", "folder": r"d:\IMAGE\KIDS & BABY\Boys & Girls\Bottoms"},
    {"keyword": "váy đầm bé gái", "folder": r"d:\IMAGE\KIDS & BABY\Boys & Girls\Dresses"},
    {"keyword": "bodysuit em bé sơ sinh", "folder": r"d:\IMAGE\KIDS & BABY\Baby (0-24M)\Bodysuits"},
    {"keyword": "mũ nón bao tay sơ sinh", "folder": r"d:\IMAGE\KIDS & BABY\Baby (0-24M)\Accessories"},
    {"keyword": "giày sneaker trẻ em", "folder": r"d:\IMAGE\KIDS & BABY\Footwear\Sneakers"},
    {"keyword": "giày sandal trẻ em", "folder": r"d:\IMAGE\KIDS & BABY\Footwear\Sandals"},

    # ==================== 4. SPORTS & UNISEX (5 Thư mục) ====================
    {"keyword": "bộ quần áo thể thao nam nữ", "folder": r"d:\IMAGE\SPORTS & UNISEX\Sportswear\Activewear"},
    {"keyword": "áo khoác thể thao nam nữ", "folder": r"d:\IMAGE\SPORTS & UNISEX\Sportswear\Tracksuits"},
    {"keyword": "áo thun form rộng unisex", "folder": r"d:\IMAGE\SPORTS & UNISEX\Unisex\Oversized Tees"},
    {"keyword": "áo hoodie unisex", "folder": r"d:\IMAGE\SPORTS & UNISEX\Unisex\Hoodies"},
    {"keyword": "quần túi hộp cargo pants", "folder": r"d:\IMAGE\SPORTS & UNISEX\Unisex\Cargo Pants"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*"
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

def crawl_tiki_api(keyword, target_folder, max_items=10):
    """Cào dữ liệu Tiki siêu tốc qua đường dẫn API chính thức"""
    encoded_keyword = urllib.parse.quote(keyword)
    # Tăng limit lên 20 để có dải sản phẩm rộng lọc ra 10 món chuẩn nhất
    api_url = f"https://tiki.vn/api/v2/products?limit=20&include=advertisement&aggregations=2&q={encoded_keyword}"
    
    try:
        res = requests.get(api_url, headers=HEADERS, timeout=15)
        if res.status_code == 200:
            data = res.json()
            products = data.get('data', [])
            
            if not products:
                print("  [?] API Tiki không tìm thấy sản phẩm nào cho từ khóa này.")
                return False
                
            print(f"  [*] API Tiki tìm thấy {len(products)} sản phẩm. Bắt đầu tải ảnh...")
            count = 0
            for idx, item in enumerate(products):
                if count >= max_items:
                    break
                
                title = item.get('name', f"{keyword}_{idx+1}")
                img_url = item.get('thumbnail_url')
                
                if not img_url:
                    continue
                    
                # Nâng cấp chất lượng ảnh Tiki: chuyển từ thumbnail (280x280) sang ảnh lớn (750x750)
                img_url_large = img_url.replace('280x280', '750x750').replace('200x200', '750x750')
                
                safe_title = clean_filename(title)
                file_name = f"{safe_title}.jpg"
                
                if download_image(img_url_large, target_folder, file_name):
                    count += 1
                    time.sleep(0.3) # Nghỉ nhẹ 0.3s giữa các ảnh
                    
            print(f"  [+] Đã tải thành công {count} ảnh từ Tiki API.")
            return True
        else:
            print(f"  [-] API Tiki phản hồi mã lỗi {res.status_code}.")
            return False
    except Exception as e:
        print(f"  [-] Lỗi kết nối API Tiki: {e}")
        return False

def crawl_tiki_playwright(keyword, target_folder, max_items=10):
    """Phương pháp dự phòng (Fallback): Dùng Playwright mở giao diện Tiki"""
    print("  [*] Kích hoạt phương pháp dự phòng Playwright (mở trình duyệt)...")
    encoded_keyword = urllib.parse.quote(keyword)
    search_url = f"https://tiki.vn/search?q={encoded_keyword}"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, args=['--disable-blink-features=AutomationControlled'])
        context = browser.new_context(user_agent=HEADERS["User-Agent"], viewport={"width": 1366, "height": 768})
        page = context.new_page()
        
        try:
            page.goto(search_url, timeout=60000)
            page.wait_for_timeout(3000)
            
            for _ in range(5):
                page.keyboard.press("PageDown")
                page.wait_for_timeout(1500)
                
            img_locators = page.locator('img[src*="salt.tikicdn.com/cache"]').all()
            print(f"  [*] Tìm thấy {len(img_locators)} ảnh từ Tiki CDN.")
            
            count = 0
            for idx, img in enumerate(img_locators):
                if count >= max_items:
                    break
                try:
                    img_url = img.get_attribute('src')
                    if not img_url or "http" not in img_url:
                        continue
                        
                    if any(bad in img_url for bad in ['logo', 'icon', 'banner', 'w100', 'author']):
                        continue
                        
                    alt_text = img.get_attribute('alt')
                    safe_title = clean_filename(alt_text) if alt_text else f"{clean_filename(keyword)}_{count+1}"
                    file_name = f"{safe_title}.jpg"
                    
                    img_url_large = img_url.replace('280x280', '750x750').replace('200x200', '750x750')
                    
                    if download_image(img_url_large, target_folder, file_name):
                        count += 1
                        time.sleep(0.5)
                except Exception as e:
                    continue
                    
            print(f"  [+] Đã tải thành công {count} ảnh qua Playwright.")
        except Exception as e:
            print(f"  [-] Lỗi Playwright Tiki: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    print("="*60)
    print("    CÔNG CỤ CRAWL ẢNH TIKI.VN (FULL 39 THƯ MỤC 3 CẤP)      ")
    print("="*60)
    
    # Số lượng ảnh mỗi danh mục: 10 ảnh (Tổng cộng 39 x 10 = 390 ảnh)
    ITEMS_PER_CATEGORY = 10
    total_categories = len(TIKI_CONFIG)
    
    for idx, config in enumerate(TIKI_CONFIG):
        keyword = config["keyword"]
        target_folder = config["folder"]
        
        print(f"\n{'='*60}")
        print(f"[*] [{idx+1}/{total_categories}] Đang xử lý: '{keyword}'")
        print(f"[*] Thư mục đích: {target_folder}")
        print(f"{'='*60}")
        
        success = crawl_tiki_api(keyword, target_folder, max_items=ITEMS_PER_CATEGORY)
        
        if not success:
            crawl_tiki_playwright(keyword, target_folder, max_items=ITEMS_PER_CATEGORY)
            
        time.sleep(1) # Nghỉ nhẹ 1s trước khi sang danh mục mới
        
    print("\n" + "="*60)
    print("[+] HOÀN TẤT CRAWL TOÀN BỘ 39 DANH MỤC THỜI TRANG TỪ TIKI!")
    print("="*60)
