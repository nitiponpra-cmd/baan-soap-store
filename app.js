const products = [
  {sku:"SOAP-001",name:"สบู่น้ำนมข้าว",desc:"สบู่ก้อนกลิ่นละมุน สำหรับการดูแลผิวในทุกวัน",price:89,image:"images/rice-milk.svg",tag:"ขายดี"},
  {sku:"SOAP-002",name:"สบู่ชาเขียว",desc:"สบู่ก้อนกลิ่นสดชื่น เหมาะกับกิจวัตรยามเช้า",price:99,image:"images/green-tea.svg",tag:"แนะนำ"}
];
let cart = [];
const money = n => "฿" + Number(n).toLocaleString("th-TH");
const grid = document.getElementById("productGrid");
grid.innerHTML = products.map((p,i)=>`<article class="product-card">
  <div class="product-image"><img src="${p.image}" alt="${p.name}"><span>${p.tag}</span></div>
  <div class="product-info"><p class="sku">${p.sku}</p><h3>${p.name}</h3><p>${p.desc}</p>
  <div class="product-bottom"><strong>${money(p.price)}</strong><button class="add-button" data-index="${i}">เพิ่มลงตะกร้า +</button></div></div></article>`).join("");
grid.addEventListener("click",e=>{const b=e.target.closest("[data-index]");if(!b)return;const p=products[+b.dataset.index];const item=cart.find(x=>x.sku===p.sku);if(item)item.qty++;else cart.push({...p,qty:1});renderCart();openCart();});
const drawer=document.getElementById("cartDrawer"),overlay=document.getElementById("cartOverlay");
function openCart(){drawer.classList.add("show");overlay.classList.add("show")}
function closeCart(){drawer.classList.remove("show");overlay.classList.remove("show")}
document.getElementById("openCart").onclick=openCart;document.getElementById("closeCart").onclick=closeCart;overlay.onclick=closeCart;
function renderCart(){
 document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
 document.getElementById("cartTotal").textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0));
 const el=document.getElementById("cartItems");
 el.innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-line"><img src="${x.image}"><div><strong>${x.name}</strong><small>${x.sku} · ${money(x.price)}</small><div class="qty"><button data-dec="${i}">−</button><span>${x.qty}</span><button data-inc="${i}">+</button><button class="remove" data-remove="${i}">ลบ</button></div></div><b>${money(x.price*x.qty)}</b></div>`).join(""):'<p class="muted">ยังไม่มีสินค้าในตะกร้า</p>';
}
document.getElementById("cartItems").addEventListener("click",e=>{const t=e.target;if(t.dataset.inc!==undefined)cart[+t.dataset.inc].qty++;if(t.dataset.dec!==undefined){const x=cart[+t.dataset.dec];x.qty--;if(x.qty<=0)cart.splice(+t.dataset.dec,1)}if(t.dataset.remove!==undefined)cart.splice(+t.dataset.remove,1);renderCart()});
document.getElementById("checkoutForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!cart.length){document.getElementById("checkoutMessage").textContent="กรุณาเลือกสินค้าก่อน";return}
 const form=new FormData(e.target),order={customerName:form.get("customerName"),phone:form.get("phone"),address:form.get("address"),items:cart.map(({sku,name,price,qty})=>({sku,name,price,qty})),total:cart.reduce((s,x)=>s+x.price*x.qty,0)};
 const msg=document.getElementById("checkoutMessage");const url=window.APP_CONFIG.GOOGLE_SCRIPT_URL;
 try{
   if(!url){const saved=JSON.parse(localStorage.getItem("baanSoapDemoOrders")||"[]");order.orderId="DEMO-"+Date.now();order.createdAt=new Date().toISOString();order.status="รอดำเนินการ";saved.unshift(order);localStorage.setItem("baanSoapDemoOrders",JSON.stringify(saved));msg.textContent="บันทึกคำสั่งซื้อในโหมดทดลองแล้ว เลขที่ "+order.orderId+" (ยังไม่ได้ส่งเข้า Google Sheets)";}
   else{const response=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"createOrder",order})});const result=await response.json();if(!result.success)throw new Error(result.message||"บันทึกไม่สำเร็จ");msg.textContent="สั่งซื้อสำเร็จ เลขที่ "+result.orderId;}
   cart=[];renderCart();e.target.reset();
 }catch(err){msg.textContent="เกิดข้อผิดพลาด: "+err.message}
});