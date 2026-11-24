// 1) สร้าง Google Sheet ใหม่ แล้วคัดลอก Spreadsheet ID จาก URL
// 2) วาง ID ใน SPREADSHEET_ID และตั้ง ADMIN_TOKEN เป็นรหัสของคุณ
// 3) Extensions > Apps Script วางโค้ดนี้ แล้ว Deploy > New deployment > Web app
// Execute as: Me | Who has access: Anyone
const SPREADSHEET_ID = "PASTE_GOOGLE_SHEET_ID_HERE";
const ADMIN_TOKEN = "change-this-admin-token";
const ORDER_SHEET = "Orders";

function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(ORDER_SHEET);
  if (!sh) sh = ss.insertSheet(ORDER_SHEET);
  if (sh.getLastRow() === 0) sh.appendRow(["Order ID","Created At","Customer Name","Phone","Address","Items JSON","Total","Status"]);
}
function doGet(e) {
  const action = e.parameter.action || "";
  if (action !== "listOrders" || e.parameter.token !== ADMIN_TOKEN) return json({success:false,message:"Unauthorized"});
  setupSheet();
  const rows = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(ORDER_SHEET).getDataRange().getValues();
  const orders = rows.slice(1).filter(r=>r[0]).map(r=>({orderId:r[0],createdAt:r[1],customerName:r[2],phone:r[3],address:r[4],items:JSON.parse(r[5]||"[]"),total:r[6],status:r[7]})).reverse();
  return json({success:true,orders:orders});
}
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    setupSheet();
    const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(ORDER_SHEET);
    if (data.action === "createOrder") {
      const o=data.order||{};
      if (!o.customerName || !o.phone || !o.address || !o.items || !o.items.length) throw new Error("ข้อมูลคำสั่งซื้อไม่ครบ");
      const id="BS"+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"yyMMddHHmmss")+"-"+Math.floor(Math.random()*90+10);
      sh.appendRow([id,new Date(),o.customerName,o.phone,o.address,JSON.stringify(o.items),Number(o.total)||0,"รอดำเนินการ"]);
      return json({success:true,orderId:id});
    }
    if (data.action === "updateStatus" && data.token === ADMIN_TOKEN) {
      const values=sh.getDataRange().getValues();
      for(let i=1;i<values.length;i++) if(String(values[i][0])===String(data.orderId)){sh.getRange(i+1,8).setValue(data.status);return json({success:true});}
      throw new Error("ไม่พบคำสั่งซื้อ");
    }
    return json({success:false,message:"Invalid action"});
  } catch(err) { return json({success:false,message:err.message}); }
}
function json(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}