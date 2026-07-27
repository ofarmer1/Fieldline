import { getDemoDb } from "../../../db/runtime";

type DemoAction = {
  action?: "create_request" | "invitation_response" | "counter_offer" | "fdi_approve" | "message" | "reset";
  invitationId?: number;
  response?: "accepted" | "declined";
  facilityId?: number;
  title?: string;
  description?: string;
  area?: string;
  nte?: number;
  customerWo?: string;
  urgent?: boolean;
  workOrderId?: number;
  body?: string;
  senderRole?: string;
  amount?: number;
};

function estimateRequest(title: string, description: string, nte: number) {
  const text = `${title} ${description}`.toLowerCase();
  const baseline = text.includes("spring") || text.includes("door") ? 750 : text.includes("clean") ? 630 : text.includes("light") ? 540 : 650;
  const vendorCeiling = Math.floor(nte * 0.75);
  const vendorCost = Math.max(1, Math.min(baseline, vendorCeiling));
  return { vendorCost, customerPrice: Math.ceil(vendorCost / 0.75), trade: text.includes("door") || text.includes("spring") ? "Commercial door systems" : "Facilities maintenance" };
}

async function seedIfEmpty() {
  const db = getDemoDb();
  const count = await db.prepare("SELECT COUNT(*) AS count FROM facilities").first<{ count: number }>();
  if (Number(count?.count ?? 0) > 0) return;
  await db.batch([
    db.prepare("INSERT INTO facilities (customer,name,address,city,latitude,longitude) VALUES (?,?,?,?,?,?)").bind("Northpoint Retail Group","Parkview Commons","2840 E. Maple Rd","Troy, MI",42.5484,-83.1454),
    db.prepare("INSERT INTO facilities (customer,name,address,city,latitude,longitude) VALUES (?,?,?,?,?,?)").bind("Northpoint Retail Group","Westgate Plaza","31100 Novi Rd","Novi, MI",42.5216,-83.4755),
    db.prepare("INSERT INTO facilities (customer,name,address,city,latitude,longitude) VALUES (?,?,?,?,?,?)").bind("Redwood Residential","Woodward Flats","410 S. Main St","Royal Oak, MI",42.4863,-83.1447),
  ]);
  await db.batch([
    db.prepare("INSERT INTO work_orders (customer_wo,facility_id,title,description,status,priority,nte,customer_price,vendor_cost,assigned_vendor,service_window) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind("SC-847219",1,"Loading dock door won’t close","Spring appears damaged and the door is secured.","Service scheduled","routine",1200,1000,750,"Great Lakes Door Co.","Tue · 8–10 AM"),
    db.prepare("INSERT INTO work_orders (customer_wo,facility_id,title,description,status,priority,nte,customer_price,vendor_cost,assigned_vendor,service_window) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind("SC-846882",1,"Exterior light outage","Three pole lights are not operating.","FDI reviewing","routine",900,null,null,null,null),
    db.prepare("INSERT INTO work_orders (customer_wo,facility_id,title,description,status,priority,nte,customer_price,vendor_cost,assigned_vendor,service_window) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind("SC-845104",1,"Back-room floor drain","Drain cleared and area cleaned.","Completed","routine",800,640,480,"Motor City Access","Closed Jul 21"),
    db.prepare("INSERT INTO work_orders (customer_wo,facility_id,title,description,status,priority,nte,customer_price,vendor_cost,assigned_vendor,service_window) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind("FDI-1052",3,"Rear entry spring failure","Rear entry spring failed; door is secured.","Vendor invitation","urgent",1200,null,920,null,"Today · 2–5 PM"),
    db.prepare("INSERT INTO work_orders (customer_wo,facility_id,title,description,status,priority,nte,customer_price,vendor_cost,assigned_vendor,service_window) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind("FDI-1056",2,"Overhead door safety inspection","Inspect overhead door and document safety condition.","Vendor invitation","routine",700,null,480,null,"Wed · Flexible"),
  ]);
  await db.batch([
    db.prepare("INSERT INTO invitations (work_order_id,vendor,status,offered_amount) VALUES (?,?,?,?)").bind(1,"Great Lakes Door Co.","accepted",750),
    db.prepare("INSERT INTO invitations (work_order_id,vendor,status,offered_amount) VALUES (?,?,?,?)").bind(4,"Great Lakes Door Co.","invited",920),
    db.prepare("INSERT INTO invitations (work_order_id,vendor,status,offered_amount) VALUES (?,?,?,?)").bind(5,"Great Lakes Door Co.","invited",480),
    db.prepare("INSERT INTO messages (work_order_id,sender_role,sender_name,body) VALUES (?,?,?,?)").bind(1,"fdi","Zak Keller","Please confirm your arrival window. Diagnose and make safe, then contact me before additional work."),
  ]);
}

export async function GET(request: Request) {
  await seedIfEmpty();
  const db = getDemoDb();
  const view = new URL(request.url).searchParams.get("view") ?? "fdi";
  if (view === "vendor") {
    const { results } = await db.prepare("SELECT i.id AS invitationId, i.status AS invitationStatus, i.offered_amount AS offeredAmount, w.*, f.name AS facilityName, f.city, f.address FROM invitations i JOIN work_orders w ON w.id=i.work_order_id JOIN facilities f ON f.id=w.facility_id WHERE i.vendor=? ORDER BY w.id DESC").bind("Great Lakes Door Co.").all();
    return Response.json({ jobs: results });
  }
  if (view === "customer") {
    const { results } = await db.prepare("SELECT w.*, f.name AS facilityName, f.city, f.address, f.customer, f.latitude, f.longitude FROM work_orders w JOIN facilities f ON f.id=w.facility_id WHERE f.customer=? ORDER BY w.id DESC").bind("Northpoint Retail Group").all();
    return Response.json({ workOrders: results });
  }
  const { results } = await db.prepare("SELECT w.*, f.name AS facilityName, f.city, f.address, f.customer, f.latitude, f.longitude FROM work_orders w JOIN facilities f ON f.id=w.facility_id ORDER BY w.id DESC").all();
  return Response.json({ workOrders: results });
}

export async function POST(request: Request) {
  await seedIfEmpty();
  const db = getDemoDb();
  const payload = await request.json() as DemoAction;
  if (payload.action === "create_request") {
    if (!payload.title?.trim() || !payload.description?.trim()) return Response.json({ error:"A title and description are required." },{status:400});
    const nte = Number(payload.nte) || 0;
    if (nte <= 0) return Response.json({ error:"A customer-authorized NTE is required." },{status:400});
    const customerWo = payload.customerWo?.trim() || `DEMO-${Date.now().toString().slice(-6)}`;
    const estimate = estimateRequest(payload.title, payload.description, nte);
    const result = await db.prepare("INSERT INTO work_orders (customer_wo,facility_id,title,description,status,priority,nte,customer_price,vendor_cost) VALUES (?,?,?,?,?,?,?,?,?)").bind(customerWo,payload.facilityId||1,payload.title.trim(),payload.description.trim(),"Vendor invitation",payload.urgent?"urgent":"routine",nte,estimate.customerPrice,estimate.vendorCost).run();
    const workOrderId = Number(result.meta.last_row_id);
    await db.prepare("INSERT INTO invitations (work_order_id,vendor,status,offered_amount) VALUES (?,?,?,?)").bind(workOrderId,"Great Lakes Door Co.","invited",estimate.vendorCost).run();
    return Response.json({ ok:true, id:workOrderId, customerWo, estimate },{status:201});
  }
  if (payload.action === "invitation_response" && payload.invitationId && payload.response) {
    await db.prepare("UPDATE invitations SET status=? WHERE id=?").bind(payload.response,payload.invitationId).run();
    if (payload.response === "accepted") await db.prepare("UPDATE work_orders SET status='Service scheduled', assigned_vendor='Great Lakes Door Co.', service_window=COALESCE(service_window,'Next business day · 8–10 AM') WHERE id=(SELECT work_order_id FROM invitations WHERE id=?)").bind(payload.invitationId).run();
    if (payload.response === "declined") await db.prepare("UPDATE work_orders SET status='FDI exception — vendor declined' WHERE id=(SELECT work_order_id FROM invitations WHERE id=?)").bind(payload.invitationId).run();
    return Response.json({ ok:true });
  }
  if (payload.action === "counter_offer" && payload.invitationId && Number(payload.amount) > 0) {
    const vendorCost = Math.round(Number(payload.amount));
    const customerPrice = Math.ceil(vendorCost / 0.75);
    await db.batch([
      db.prepare("UPDATE invitations SET status='countered', offered_amount=? WHERE id=?").bind(vendorCost,payload.invitationId),
      db.prepare("UPDATE work_orders SET status='FDI review — vendor counter', vendor_cost=?, customer_price=? WHERE id=(SELECT work_order_id FROM invitations WHERE id=?)").bind(vendorCost,customerPrice,payload.invitationId),
    ]);
    return Response.json({ ok:true, vendorCost, customerPrice });
  }
  if (payload.action === "fdi_approve" && payload.workOrderId) {
    const job = await db.prepare("SELECT customer_price AS customerPrice, nte FROM work_orders WHERE id=?").bind(payload.workOrderId).first<{customerPrice:number;nte:number}>();
    if (!job) return Response.json({error:"Work order not found"},{status:404});
    if (job.customerPrice > job.nte) {
      await db.prepare("UPDATE work_orders SET status='Customer approval required' WHERE id=?").bind(payload.workOrderId).run();
      return Response.json({ok:true,status:"Customer approval required"});
    }
    await db.batch([
      db.prepare("UPDATE work_orders SET status='Service scheduled', assigned_vendor='Great Lakes Door Co.', service_window=COALESCE(service_window,'Next business day · 8–10 AM') WHERE id=?").bind(payload.workOrderId),
      db.prepare("UPDATE invitations SET status='accepted' WHERE work_order_id=? AND status='countered'").bind(payload.workOrderId),
    ]);
    return Response.json({ok:true,status:"Service scheduled"});
  }
  if (payload.action === "message" && payload.workOrderId && payload.body?.trim()) {
    await db.prepare("INSERT INTO messages (work_order_id,sender_role,sender_name,body) VALUES (?,?,?,?)").bind(payload.workOrderId,payload.senderRole||"vendor",payload.senderRole==="customer"?"Maria Santos":"Great Lakes Door Co.",payload.body.trim()).run();
    return Response.json({ ok:true },{status:201});
  }
  if (payload.action === "reset") {
    await db.batch([db.prepare("DELETE FROM messages"),db.prepare("DELETE FROM invitations"),db.prepare("DELETE FROM work_orders"),db.prepare("DELETE FROM facilities")]);
    await seedIfEmpty();
    return Response.json({ ok:true });
  }
  return Response.json({ error:"Unsupported action" },{status:400});
}
