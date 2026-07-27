"use client";

import { useMemo, useState } from "react";

type Stage = "overview" | "intake" | "bids" | "approval" | "field" | "closeout";

const stages: { id: Stage; label: string; short: string }[] = [
  { id: "overview", label: "Job overview", short: "Overview" },
  { id: "intake", label: "Request intake", short: "Intake" },
  { id: "bids", label: "Private bidding", short: "Bids" },
  { id: "approval", label: "Price & approval", short: "Approval" },
  { id: "field", label: "Field execution", short: "Field" },
  { id: "closeout", label: "Invoice & closeout", short: "Closeout" },
];

const bids = [
  { name: "Great Lakes Door Co.", price: 750, eta: "Tue, 8–10 AM", score: 94, note: "Strong door-spring history", selected: true },
  { name: "Motor City Access", price: 690, eta: "Thu, 1–4 PM", score: 86, note: "Lowest price · later arrival", selected: false },
  { name: "Northstar Facilities", price: 825, eta: "Wed, 9–11 AM", score: 81, note: "Good coverage · limited history", selected: false },
];

function Money({ value }: { value: number }) {
  return <>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)}</>;
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "green" | "amber" | "blue" | "neutral" | "red" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("overview");
  const [margin, setMargin] = useState(25);
  const [selectedVendor, setSelectedVendor] = useState(0);
  const [notice, setNotice] = useState("");
  const [emergency, setEmergency] = useState(false);
  const vendorCost = bids[selectedVendor].price;
  const customerPrice = useMemo(() => Math.round(vendorCost / (1 - margin / 100)), [vendorCost, margin]);
  const withinNte = customerPrice <= 1200;

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <main className="app-shell">
      {notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">F</span><div><strong>Fieldline</strong><small>by FDI</small></div></div>
        <nav aria-label="Primary">
          <button className="nav-item active"><span>⌂</span> Work orders <b>12</b></button>
          <button className="nav-item"><span>◈</span> Vendors</button>
          <button className="nav-item"><span>▤</span> Customers</button>
          <button className="nav-item"><span>◎</span> Accounting</button>
        </nav>
        <div className="pilot-card"><Badge tone="blue">Pilot workspace</Badge><p>Southeast Michigan</p><small>3 customers · 4 vendors</small></div>
        <div className="user-card"><span className="avatar">OF</span><div><strong>Oliver Farmer</strong><small>Administrator</small></div><span>•••</span></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="breadcrumbs"><span>Work orders</span><i>/</i><strong>WO-1048</strong></div>
          <div className="top-actions"><button className="icon-button" aria-label="Search">⌕</button><button className="icon-button" aria-label="Notifications">♢<em>2</em></button><button className="primary" onClick={() => flash("Update shared with the assigned team")}>Send update <span>↗</span></button></div>
        </header>

        <div className="content">
          <div className="job-heading">
            <div><div className="eyebrow"><Badge tone="green">Approved to schedule</Badge><span>•</span><span>Routine FM</span></div><h1>Loading dock door won’t close</h1><p>Parkview Commons <span>·</span> 2840 E. Maple Rd, Troy, MI</p></div>
            <div className="heading-actions"><button className="secondary" onClick={() => flash("Work order details copied")}>Copy link</button><button className="primary" onClick={() => setStage("field")}>Schedule vendor</button></div>
          </div>

          <div className="stat-strip">
            <div><small>Customer WO</small><strong>SC-847219</strong></div>
            <div><small>Authorized NTE</small><strong>$1,200</strong><span className="micro green-text">Original</span></div>
            <div><small>FDI customer price</small><strong><Money value={customerPrice} /></strong><span className="micro">{margin}% margin</span></div>
            <div><small>Assigned FMC</small><span className="person"><span className="avatar coral">ZK</span><strong>Zak Keller</strong></span></div>
            <div><small>Target service</small><strong>Tue, Jul 28</strong><span className="micro">8:00–10:00 AM</span></div>
          </div>

          <div className="stage-tabs" role="tablist" aria-label="Work order stages">
            {stages.map((item, index) => <button key={item.id} role="tab" aria-selected={stage === item.id} className={stage === item.id ? "selected" : ""} onClick={() => setStage(item.id)}><span>{index === 0 ? "✓" : index}</span>{item.short}</button>)}
          </div>

          {stage === "overview" && <Overview onOpen={setStage} />}
          {stage === "intake" && <Intake emergency={emergency} setEmergency={setEmergency} flash={flash} />}
          {stage === "bids" && <Bids selected={selectedVendor} setSelected={setSelectedVendor} onContinue={() => setStage("approval")} />}
          {stage === "approval" && <Approval margin={margin} setMargin={setMargin} vendorCost={vendorCost} customerPrice={customerPrice} withinNte={withinNte} flash={flash} />}
          {stage === "field" && <Field flash={flash} />}
          {stage === "closeout" && <Closeout flash={flash} />}
        </div>
      </section>
    </main>
  );
}

function Overview({ onOpen }: { onOpen: (stage: Stage) => void }) {
  return <div className="dashboard-grid">
    <section className="panel timeline-panel"><div className="panel-title"><div><h2>Job progress</h2><p>Everything that has happened on this work order.</p></div><button className="text-button">View activity log</button></div>
      <div className="timeline">
        <article className="done"><span className="timeline-dot">✓</span><div><strong>Request received</strong><p>Created from ServiceChannel by Maria Santos</p><small>Today, 8:42 AM</small></div><Badge>6 photos</Badge></article>
        <article className="done"><span className="timeline-dot">✓</span><div><strong>Vendor selected</strong><p>Great Lakes Door Co. selected from 3 private bids</p><small>Today, 10:18 AM</small></div><button onClick={() => onOpen("bids")}>Review bids</button></article>
        <article className="done"><span className="timeline-dot">✓</span><div><strong>Customer price authorized</strong><p>$1,000 is within the customer-issued $1,200 NTE</p><small>Today, 10:24 AM</small></div><Badge tone="green">No approval needed</Badge></article>
        <article className="current"><span className="timeline-dot">4</span><div><strong>Schedule service</strong><p>Vendor is ready for an arrival window.</p></div><button className="primary small" onClick={() => onOpen("field")}>Schedule</button></article>
        <article><span className="timeline-dot">5</span><div><strong>Complete & close out</strong><p>Evidence, invoices, and customer billing</p></div></article>
      </div>
    </section>
    <aside className="right-rail">
      <section className="panel"><div className="panel-title"><h2>Next best action</h2><Badge tone="amber">Due today</Badge></div><div className="action-illustration"><span>▣</span><i>✓</i></div><h3>Confirm the service window</h3><p>Great Lakes Door Co. can arrive Tuesday between 8:00 and 10:00 AM.</p><button className="primary full" onClick={() => onOpen("field")}>Schedule vendor</button><button className="secondary full" onClick={() => onOpen("bids")}>Message vendor</button></section>
      <section className="panel health-card"><div className="panel-title"><h2>Job controls</h2><Badge tone="green">On track</Badge></div><div className="check-row"><span>✓</span><div><strong>Vendor compliant</strong><small>Insurance through Mar 2027</small></div></div><div className="check-row"><span>✓</span><div><strong>Margin protected</strong><small>$250 gross profit · 25%</small></div></div><div className="check-row"><span>✓</span><div><strong>Inside authorized NTE</strong><small>$200 remaining</small></div></div></section>
    </aside>
  </div>;
}

function Intake({ emergency, setEmergency, flash }: { emergency: boolean; setEmergency: (v: boolean) => void; flash: (s: string) => void }) {
  return <section className="panel form-panel"><div className="panel-title"><div><h2>Request intake</h2><p>Captured from the customer’s source and normalized for FDI.</p></div><Badge tone="blue">ServiceChannel</Badge></div>
    <div className="source-banner"><span>↳</span><div><strong>Imported from ServiceChannel</strong><p>Original work order SC-847219 · received Today, 8:42 AM</p></div><button className="secondary">View source</button></div>
    <div className="form-grid"><label>Customer<input value="Northpoint Retail Group" readOnly /></label><label>Facility<input value="Parkview Commons — Troy" readOnly /></label><label>Customer work-order number<input value="SC-847219" readOnly /></label><label>Requester<input value="Maria Santos · Property Manager" readOnly /></label><label className="wide">Scope / description<textarea value="Loading dock door will not close fully. Spring appears damaged and the door is currently secured. Inspect, make safe, and replace failed spring as authorized." readOnly /></label><label>Issued NTE<div className="money-input"><span>$</span><input value="1,200" readOnly /></div></label><label>Assigned FMC<input value="Zak Keller" readOnly /></label></div>
    <div className="photo-row"><div className="photo p1"><span>Loading dock</span></div><div className="photo p2"><span>Damaged spring</span></div><div className="photo p3"><span>Door track</span></div><button className="upload">＋<small>Add photos</small></button></div>
    <div className={`emergency-toggle ${emergency ? "on" : ""}`}><div><strong>Urgent / emergency request</strong><p>Notify the assigned FMC or configured on-call person and enable direct vendor assignment.</p></div><button role="switch" aria-checked={emergency} onClick={() => setEmergency(!emergency)}><span /></button></div>
    {emergency && <div className="warning-box"><strong>Emergency controls enabled</strong><p>Direct assignment is allowed. The vendor may diagnose and make safe within the authorized NTE, but cannot exceed it without approval.</p></div>}
    <div className="form-footer"><span>Last synced 3 minutes ago</span><button className="primary" onClick={() => flash("Intake record saved")}>Save intake</button></div>
  </section>;
}

function Bids({ selected, setSelected, onContinue }: { selected: number; setSelected: (n: number) => void; onContinue: () => void }) {
  return <section className="panel bids-panel"><div className="panel-title"><div><h2>Private vendor review</h2><p>Only FDI can see the invited vendors, bids, and selection notes.</p></div><Badge tone="green">3 of 3 responded</Badge></div>
    <div className="privacy-note"><span>◉</span><p><strong>FDI private</strong> Vendors cannot see who else was invited, competing scopes or prices, the customer price, or FDI margin.</p></div>
    <div className="bid-header"><span>Vendor & fit</span><span>Schedule</span><span>Vendor cost</span><span>Decision</span></div>
    {bids.map((bid, index) => <button key={bid.name} className={`bid-row ${selected === index ? "chosen" : ""}`} onClick={() => setSelected(index)}><div className="vendor-cell"><span className={`vendor-logo v${index}`}>{bid.name.slice(0, 2)}</span><div><strong>{bid.name}</strong><small><span className="stars">★★★★★</span> {bid.score}% fit · {bid.note}</small></div></div><div><strong>{bid.eta}</strong><small>Confirmed availability</small></div><div><strong><Money value={bid.price} /></strong>{index === 1 && <Badge tone="blue">Lowest</Badge>}</div><div><span className="radio">{selected === index ? "●" : "○"}</span>{selected === index ? "Selected" : "Select"}</div></button>)}
    <div className="selection-reason"><label>Internal selection reason <span>Required when not choosing the lowest bid</span><textarea value={selected === 1 ? "Lowest qualified bid with acceptable schedule and scope." : "Best door-spring experience and earliest confirmed arrival. The $60 premium reduces schedule and callback risk."} readOnly /></label><div className="score-card"><small>Recommendation</small><strong>{bids[selected].score}% match</strong><div className="scorebar"><i style={{ width: `${bids[selected].score}%` }} /></div><span>Scope 96 · Schedule 98 · Quality 91</span></div></div>
    <div className="form-footer"><span>Selection notes are internal and audit-ready.</span><button className="primary" onClick={onContinue}>Continue to pricing →</button></div>
  </section>;
}

function Approval({ margin, setMargin, vendorCost, customerPrice, withinNte, flash }: { margin: number; setMargin: (n: number) => void; vendorCost: number; customerPrice: number; withinNte: boolean; flash: (s: string) => void }) {
  return <div className="approval-grid"><section className="panel pricing-card"><div className="panel-title"><div><h2>FDI pricing</h2><p>Customer pricing is calculated using gross margin—not markup.</p></div><Badge tone="blue">Internal only</Badge></div>
    <div className="price-stack"><div><span>Selected vendor cost</span><strong><Money value={vendorCost} /></strong></div><div className="operator">÷</div><div><span>Cost percentage</span><strong>{100 - margin}%</strong></div><div className="operator">=</div><div className="customer-total"><span>Customer price</span><strong><Money value={customerPrice} /></strong></div></div>
    <label className="slider-label"><span><strong>Gross margin</strong><small>Authorized FDI users may adjust per job</small></span><output>{margin}%</output></label><input className="slider" type="range" min="10" max="40" value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
    <div className="margin-summary"><div><small>Gross profit</small><strong><Money value={customerPrice - vendorCost} /></strong></div><div><small>Gross margin</small><strong>{margin}%</strong></div><div><small>NTE remaining</small><strong className={withinNte ? "green-text" : "red-text"}><Money value={1200 - customerPrice} /></strong></div></div>
    <div className={`authorization ${withinNte ? "ok" : "over"}`}><span>{withinNte ? "✓" : "!"}</span><div><strong>{withinNte ? "No additional customer approval required" : "Customer approval or increased NTE required"}</strong><p>{withinNte ? `The ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(customerPrice)} FDI price is within the customer-issued $1,200 NTE.` : "Do not authorize work above $1,200 until an approval is recorded."}</p></div></div>
    <button className="primary full" onClick={() => flash(withinNte ? "Price approved within issued NTE" : "Approval request prepared")}>{withinNte ? "Approve price & authorize vendor" : "Record customer approval"}</button>
  </section>
  <aside className="panel history-card"><div className="panel-title"><div><h2>NTE & authorization history</h2><p>Original authority and every increase stay visible.</p></div></div><div className="nte-item current"><span /><div><small>Original NTE · Active</small><strong>$1,200</strong><p>ServiceChannel · SC-847219</p><time>Jul 27, 2026 · 8:42 AM</time></div></div><div className="nte-item future"><span /><div><small>If an increase is needed</small><strong>Capture the full decision</strong><p>Reason · vendor cost · revised customer amount · photos · source · date · continued or return visit</p></div></div><button className="secondary full" onClick={() => flash("NTE increase form opened")}>＋ Add NTE increase</button></aside></div>;
}

function Field({ flash }: { flash: (s: string) => void }) {
  return <div className="field-grid"><section className="panel"><div className="panel-title"><div><h2>Schedule & communication</h2><p>One shared operational record, with private financial controls.</p></div><Badge tone="green">Vendor authorized</Badge></div><div className="schedule-card"><div className="calendar-date"><strong>28</strong><small>JUL</small></div><div><small>CONFIRMED ARRIVAL</small><h3>Tuesday · 8:00–10:00 AM</h3><p>Great Lakes Door Co. · Technician: Chris M.</p></div><button className="secondary">Reschedule</button></div><div className="message"><span className="avatar coral">ZK</span><div><strong>Zak Keller <small>FDI · 10:31 AM</small></strong><p>Dock contact and access notes confirmed. Please check in on arrival and send a diagnosis before beginning any work beyond the authorized scope.</p></div></div><div className="message vendor-message"><span className="avatar blue-avatar">GL</span><div><strong>Great Lakes Door Co. <small>Vendor · 10:36 AM</small></strong><p>Confirmed. We’ll arrive in the Tuesday window with the expected spring assembly.</p></div></div><div className="composer"><input placeholder="Write an update…"/><button onClick={() => flash("Message added to the work order")}>Send</button></div></section>
    <aside className="panel evidence-card"><div className="panel-title"><h2>Field checklist</h2><Badge tone="amber">0 of 6</Badge></div>{["Arrival time", "Diagnosis", "Condition photos", "Temporary measures", "Completed work", "Return visit required?"].map(item => <label key={item}><input type="checkbox" onChange={() => undefined}/><span>{item}</span></label>)}<div className="field-guard"><strong>NTE guardrail</strong><p>Vendor authorization: <b>$750</b>. Do not proceed beyond approved scope or NTE.</p></div><button className="primary full" onClick={() => flash("Completion evidence requested from vendor")}>Request completion evidence</button></aside></div>;
}

function Closeout({ flash }: { flash: (s: string) => void }) {
  return <section className="panel closeout"><div className="panel-title"><div><h2>Invoice & closeout</h2><p>Track the accounting handoff without moving money in Fieldline.</p></div><Badge tone="amber">2 items remaining</Badge></div><div className="closeout-steps"><article className="complete"><span>✓</span><div><small>1 · WORK COMPLETE</small><h3>Completion evidence accepted</h3><p>8 photos · technician notes · no return visit</p></div><button>View evidence</button></article><article className="complete"><span>✓</span><div><small>2 · VENDOR INVOICE</small><h3>Invoice GLD-8821 received</h3><p>$750 · matches vendor authorization</p></div><Badge tone="green">Ready for QBO</Badge></article><article className="active"><span>3</span><div><small>3 · CUSTOMER INVOICE</small><h3>Create customer invoice</h3><p>$1,000 approved customer price · SC-847219</p></div><button className="primary small" onClick={() => flash("Customer invoice prepared for QuickBooks Online")}>Prepare invoice</button></article><article><span>4</span><div><small>4 · ACCOUNTING STATUS</small><h3>Sync status from QuickBooks Online</h3><p>Invoice number, sent status, and payment status</p></div><Badge>Not started</Badge></article></div><div className="accounting-note"><span>QBO</span><div><strong>QuickBooks Online remains the accounting system</strong><p>Fieldline tracks the operational and approval record. No payments or bank details are collected here.</p></div></div></section>;
}
