# โปรเจกต์ร้านสบู่ บ้านสบู่

เว็บไซต์ตัวอย่างสำหรับโจทย์: ร้านค้าอย่างน้อย 2 SKU, ตะกร้าสินค้า, บันทึกคำสั่งซื้อ Google Sheets, หน้าจัดการคำสั่งซื้อเพื่อหยิบ/แพ็คสินค้า และพิมพ์ใบปะหน้าพัสดุ

## ไฟล์ในโปรเจกต์
- `index.html` หน้าร้านและ checkout
- `admin.html` หน้าจัดการคำสั่งซื้อ / หยิบสินค้า / แพ็ค / พิมพ์ใบปะหน้า
- `images/` โฟลเดอร์รูปสินค้าแยกต่างหาก
- `google-apps-script/Code.gs` API เชื่อม Google Sheets
- `config.js` ตั้งค่า URL และรหัสผู้ดูแลระบบ

## ตั้งค่า Google Sheets
1. สร้าง Google Sheet ใหม่
2. เปิด Extensions > Apps Script
3. คัดลอกเนื้อหา `google-apps-script/Code.gs` ไปวาง
4. แทน `PASTE_GOOGLE_SHEET_ID_HERE` ด้วย Spreadsheet ID จาก URL ของชีต
5. เปลี่ยน `ADMIN_TOKEN` เป็นรหัสลับของคุณ
6. กด Run ฟังก์ชัน `setupSheet` ครั้งแรก และอนุญาตสิทธิ์
7. Deploy > New deployment > Web app
   - Execute as: Me
   - Who has access: Anyone
8. คัดลอก Web app URL ไปใส่ `GOOGLE_SCRIPT_URL` ใน `config.js`
9. ใส่ค่า `ADMIN_TOKEN` ให้ตรงกันทั้ง `config.js` และ `Code.gs`
10. ทดสอบสั่งซื้อจากหน้าร้าน และเปิด `admin.html`

## ทดสอบโดยไม่เชื่อม Google Sheets
เปิด `index.html` ผ่านเว็บเซิร์ฟเวอร์ (เช่น VS Code Live Server) แล้วสั่งซื้อได้ ข้อมูลจะเก็บใน localStorage ของเบราว์เซอร์เครื่องนั้นเพื่อเดโมเท่านั้น ไม่ใช่ Google Sheets

## นำขึ้น GitHub และ Vercel
1. สร้าง GitHub repository แล้วอัปโหลดไฟล์และโฟลเดอร์ทั้งหมด โดยคงโฟลเดอร์ `images/` ไว้
2. เข้า Vercel แล้วเลือก Add New > Project > Import Git Repository
3. เลือก repository นี้ แล้ว Deploy (เป็นเว็บ static ไม่ต้องตั้ง Build Command)
4. ทดสอบ URL ที่ Vercel ให้ ทั้งหน้าร้านและ `/admin.html`

## SKU ตัวอย่าง
- SOAP-001 สบู่น้ำนมข้าว ราคา 89 บาท
- SOAP-002 สบู่ชาเขียว ราคา 99 บาท

## ข้อควรทราบ
- ชื่อสินค้า ราคา และเบอร์โทรเป็นข้อมูลตัวอย่าง เปลี่ยนใน `app.js` ให้เป็นข้อมูลจริงก่อนส่ง
- ใบปะหน้าเป็นแบบฟอร์มภายในร้าน ไม่ใช่ใบจ่าหน้าทางการของบริษัทขนส่ง
- สำหรับใช้งานจริง ควรจำกัดสิทธิ์หน้า admin และเก็บ token ในระบบ backend ที่ปลอดภัย ไม่ควรเผยแพร่ token ในไฟล์หน้าเว็บสาธารณะ
