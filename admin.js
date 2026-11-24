const message=document.getElementById("adminMessage"),list=document.getElementById("ordersList");
const demoKey="baanSoapDemoOrders";
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function loadOrders(){
 message.textContent="กำลังโหลดข้อมูล...";
 try{
  let orders;
  const url=window.APP_CONFIG.GOOGLE_SCRIPT_URL;
  if(url){const r=await fetch(url+"?action=listOrders&token="+encodeURIComponent(window.APP_CONFIG.ADMIN_TOKEN));const d=await r.json();if(!d.success)throw new Error(d.message||"โหลดข้อมูลไม่ได้");orders=d.orders;}
  else orders=JSON.parse(localStorage.getItem(demoKey)||"[]");
  message.textContent=orders.length?`พบ ${orders.length} รายการ`:"ยังไม่มีคำสั่งซื้อ";
  list.innerHTML=orders.map(o=>`<article class="order-card"><div class="order-head"><div><span class="sku">${esc(o.orderId)}</span><h2>${esc(o.customerName)}</h2><small>${esc(o.createdAt||"")}</small></div><span class="status">${esc(o.status||"รอดำเนินการ")}</span></div>
  <div class="order-details"><p><b>โทร:</b> ${esc(o.phone)}</p><p><b>ที่อยู่:</b> ${esc(o.address)}</p><p><b>รายการสินค้า:</b></p><ul>${(o.items||[]).map(i=>`<li>${esc(i.name)} (${esc(i.sku)}) × ${esc(i.qty)}</li>`).join("")}</ul><b>รวม ${Number(o.total||0).toLocaleString("th-TH")} บาท</b></div>
  <div class="order-actions"><button class="outline-button" data-status="${esc(o.orderId)}" data-value="กำลังแพ็ค">เริ่มหยิบ/แพ็คสินค้า</button><button class="outline-button" data-status="${esc(o.orderId)}" data-value="จัดส่งแล้ว">ทำเครื่องหมายจัดส่งแล้ว</button><button class="primary-button" data-print="${esc(o.orderId)}">พิมพ์ใบปะหน้า</button></div></article>`).join("");
  window.currentOrders=orders;
 }catch(e){message.textContent="โหลดข้อมูลไม่สำเร็จ: "+e.message}
}
list.addEventListener("click",async e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.print){const o=(window.currentOrders||[]).find(x=>x.orderId===b.dataset.print);if(o)printLabel(o);return}
 if(b.dataset.status){const id=b.dataset.status,status=b.dataset.value,url=window.APP_CONFIG.GOOGLE_SCRIPT_URL;
  if(url){try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"updateStatus",orderId:id,status,token:window.APP_CONFIG.ADMIN_TOKEN})});const d=await r.json();if(!d.success)throw new Error(d.message)}catch(err){alert(err.message);return}}
  else{let a=JSON.parse(localStorage.getItem(demoKey)||"[]");a=a.map(o=>o.orderId===id?{...o,status}:o);localStorage.setItem(demoKey,JSON.stringify(a))}
  loadOrders();
 }
});
function printLabel(o){
 const w=window.open("","_blank","width=700,height=800");if(!w){alert("กรุณาอนุญาตป๊อปอัปเพื่อพิมพ์");return}
 w.document.write(`<html lang="th"><head><meta charset="utf-8"><title>ใบปะหน้าพัสดุ ${esc(o.orderId)}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#222}.label{border:2px solid #222;padding:24px;max-width:620px;margin:auto}.top{display:flex;justify-content:space-between;border-bottom:1px solid #aaa;padding-bottom:12px}h1{font-size:25px}h2{font-size:19px;margin-bottom:8px}.address{font-size:18px;line-height:1.65;min-height:150px}.small{font-size:12px;color:#555}.items{border-top:1px dashed #777;margin-top:16px;padding-top:10px}@media print{button{display:none}}</style></head><body><div class="label"><div class="top"><b>บ้านสบู่ · พัสดุ</b><b>${esc(o.orderId)}</b></div><h2>ผู้รับ / SHIP TO</h2><div class="address"><b>${esc(o.customerName)}</b><br>${esc(o.phone)}<br>${esc(o.address).replace(/\n/g,"<br>")}</div><div class="items"><b>รายการสินค้า</b><ul>${(o.items||[]).map(i=>`<li>${esc(i.name)} (${esc(i.sku)}) × ${esc(i.qty)}</li>`).join("")}</ul><b>ยอดรวมสินค้า: ${Number(o.total||0).toLocaleString("th-TH")} บาท</b></div><p class="small">หมายเหตุ: ใบปะหน้าสำหรับจัดเตรียมพัสดุ ไม่ใช่ใบกำกับ/ใบจ่าหน้าของบริษัทขนส่ง</p></div><script>window.onload=()=>window.print()<\/script></body></html>`);
 w.document.close();
}
document.getElementById("refreshOrders").onclick=loadOrders;loadOrders();