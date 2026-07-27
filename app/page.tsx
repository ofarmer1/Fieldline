"use client";

import { useMemo, useState } from "react";

type Stage = "overview" | "intake" | "bids" | "approval" | "field" | "closeout";
type Section = "work" | "vendors" | "customers" | "accounting";
type Role = "fdi" | "vendor" | "customer";

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
  const [role, setRole] = useState<Role>("fdi");
  const [section, setSection] = useState<Section>("work");
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

  if (role !== "fdi") return <ExternalPortal role={role} setRole={setRole} flash={flash} notice={notice} />;

  return (
    <main className="app-shell">
      {notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">F</span><div><strong>Fieldline</strong><small>by FDI</small></div></div>
        <nav aria-label="Primary">
          <button className={`nav-item ${section === "work" ? "active" : ""}`} onClick={() => setSection("work")}><span>⌂</span> Work orders <b>12</b></button>
          <button className={`nav-item ${section === "vendors" ? "active" : ""}`} onClick={() => setSection("vendors")}><span>◈</span> Vendors</button>
          <button className={`nav-item ${section === "customers" ? "active" : ""}`} onClick={() => setSection("customers")}><span>▤</span> Customers</button>
          <button className={`nav-item ${section === "accounting" ? "active" : ""}`} onClick={() => setSection("accounting")}><span>◎</span> Accounting</button>
        </nav>
        <div className="pilot-card"><Badge tone="blue">Pilot workspace</Badge><p>Southeast Michigan</p><small>3 customers · 4 vendors</small></div>
        <div className="user-card"><span className="avatar">OF</span><div><strong>Oliver Farmer</strong><small>Administrator</small></div><span>•••</span></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="breadcrumbs"><span>{section === "work" ? "Work orders" : section[0].toUpperCase() + section.slice(1)}</span>{section === "work" && <><i>/</i><strong>WO-1048</strong></>}</div>
          <div className="top-actions"><RoleSwitcher role={role} setRole={setRole} /><button className="icon-button" aria-label="Search">⌕</button><button className="icon-button" aria-label="Notifications">♢<em>2</em></button><button className="primary" onClick={() => flash("Update shared with the assigned team")}>Send update <span>↗</span></button></div>
        </header>

        {section === "work" ? <div className="content">
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
        </div> : <SectionPage section={section} flash={flash} />}
      </section>
    </main>
  );
}

function RoleSwitcher({ role, setRole, light = false }: { role: Role; setRole: (role: Role) => void; light?: boolean }) {
  return <div className={`role-switcher ${light ? "light" : ""}`} aria-label="View prototype as"><small>View as</small>{(["fdi","vendor","customer"] as Role[]).map(item => <button key={item} className={role === item ? "active" : ""} onClick={() => setRole(item)}>{item === "fdi" ? "FDI" : item === "vendor" ? "Vendor" : "Store Manager"}</button>)}</div>;
}

function ExternalPortal({ role, setRole, flash, notice }: { role: Exclude<Role,"fdi">; setRole: (role: Role) => void; flash: (s: string) => void; notice: string }) {
  const [tab, setTab] = useState(role === "vendor" ? "opportunity" : "request");
  const isVendor = role === "vendor";
  return <main className={`external-shell ${isVendor ? "vendor-portal" : "customer-portal"}`}>
    {notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}
    <header className="external-header"><div className="brand external-brand"><span className="brand-mark">F</span><div><strong>Fieldline</strong><small>{isVendor ? "Vendor portal" : "Customer portal"}</small></div></div><RoleSwitcher role={role} setRole={setRole} light /><div className="external-user"><span className="avatar">{isVendor ? "GL" : "MS"}</span><div><strong>{isVendor ? "Great Lakes Door Co." : "Maria Santos"}</strong><small>{isVendor ? "Approved vendor" : "Store Manager"}</small></div></div></header>
    <section className="external-content">
      <div className="portal-context"><div><Badge tone={isVendor ? "amber" : "green"}>{isVendor ? "Action required" : "Service scheduled"}</Badge><h1>{isVendor ? "Loading dock door won’t close" : "Your service request"}</h1><p>Parkview Commons · 2840 E. Maple Rd, Troy, MI</p></div><div className="wo-card"><small>WORK ORDER</small><strong>SC-847219</strong><span>{isVendor ? "FDI-1048" : "Submitted today at 8:42 AM"}</span></div></div>
      <div className="portal-tabs">{(isVendor ? [["opportunity","Job details"],["messages","Messages"],["schedule","Schedule"],["evidence","Completion"]] : [["request","Request"],["proposal","Proposal"],["schedule","Schedule"],["updates","Updates"]]).map(([id,label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</div>
      {isVendor ? <VendorExperience tab={tab} setTab={setTab} flash={flash} /> : <CustomerExperience tab={tab} setTab={setTab} flash={flash} />}
    </section>
    <footer className="portal-footer"><span>Fieldline by FDI</span><span>Need help? Contact your FDI coordinator.</span></footer>
  </main>;
}

function VendorExperience({ tab, setTab, flash }: { tab: string; setTab: (tab: string) => void; flash: (s: string) => void }) {
  if (tab === "messages") return <div className="portal-two-col"><section className="portal-panel"><div className="portal-panel-title"><div><h2>Messages with FDI</h2><p>Your private conversation about this assignment.</p></div><Badge tone="green">Zak Keller · FMC</Badge></div><div className="portal-message fdi"><span className="avatar coral">ZK</span><div><strong>Zak Keller <small>10:31 AM</small></strong><p>Please confirm your arrival window. Diagnose and make safe, then contact me before any work outside the authorized scope.</p></div></div><div className="portal-message mine"><div><strong>You <small>10:36 AM</small></strong><p>Confirmed. We can arrive Tuesday between 8:00 and 10:00 AM.</p></div></div><div className="portal-compose"><input placeholder="Message FDI about this job…"/><button onClick={() => flash("Message sent to FDI")}>Send</button></div></section><VendorGuardrail /></div>;
  if (tab === "schedule") return <div className="portal-two-col"><section className="portal-panel"><div className="portal-panel-title"><div><h2>Service schedule</h2><p>Coordinate arrival directly with FDI.</p></div></div><div className="big-date"><div><strong>28</strong><small>JUL</small></div><div><small>TUESDAY</small><h3>8:00–10:00 AM</h3><p>Parkview Commons · Loading dock</p></div><Badge tone="green">Confirmed</Badge></div><div className="access-note"><strong>Arrival instructions</strong><p>Check in through the work order on arrival. Site contact and access instructions will be released within 24 hours of service.</p></div><button className="secondary" onClick={() => flash("Reschedule request sent to FDI")}>Request a different time</button></section><VendorGuardrail /></div>;
  if (tab === "evidence") return <div className="portal-two-col"><section className="portal-panel"><div className="portal-panel-title"><div><h2>Complete the work order</h2><p>Submit a clear record before invoicing FDI.</p></div><Badge tone="blue">Not started</Badge></div><div className="vendor-checklist">{["Record arrival time","Add diagnosis","Upload condition photos","Describe temporary measures","Document completed work","Confirm whether a return visit is required"].map((x,i)=><label key={x}><span>{i+1}</span><div><strong>{x}</strong><small>{i===2?"At least 2 photos required":"Required for closeout"}</small></div><button onClick={() => flash(`${x} opened`)}>Add →</button></label>)}</div><button className="primary full" onClick={() => flash("Completion package saved as draft")}>Save completion draft</button></section><VendorGuardrail /></div>;
  return <div className="portal-two-col"><section className="portal-panel"><div className="portal-panel-title"><div><h2>Assignment details</h2><p>Review the scope and respond to FDI.</p></div><Badge tone="amber">Response due today</Badge></div><div className="vendor-job-hero"><div className="door-visual"><span>Loading dock</span></div><div><small>TRADE</small><strong>Commercial door systems</strong><small>SERVICE TYPE</small><strong>Routine repair</strong><small>REQUESTED ARRIVAL</small><strong>Tue, Jul 28 · 8–10 AM</strong></div></div><div className="scope-box"><small>AUTHORIZED SCOPE</small><h3>Inspect, make safe, and replace failed spring</h3><p>Loading dock door will not close fully. Spring appears damaged and the door is currently secured. Check in on arrival and send a diagnosis before beginning work outside this scope.</p></div><div className="vendor-money"><div><small>Your authorized amount</small><strong>$750</strong><span>Invoice FDI upon completion</span></div><div><small>Authorization status</small><strong className="green-text">Approved</strong><span>Do not exceed without approval</span></div></div><div className="portal-actions"><button className="secondary" onClick={() => setTab("messages")}>Ask FDI a question</button><button className="primary" onClick={() => {flash("Assignment accepted"); setTab("schedule")}}>Accept assignment</button></div></section><VendorGuardrail /></div>;
}

function VendorGuardrail() {
  return <aside className="portal-panel portal-side"><div className="shield">✓</div><h3>Your private vendor workspace</h3><p>Only your company and FDI can see your pricing, messages, schedule, evidence, and invoice.</p><div className="guardrail"><small>AUTHORIZED AMOUNT</small><strong>$750</strong><p>Stop and request authorization before exceeding this amount or the assigned scope.</p></div><div className="contact-card"><span className="avatar coral">ZK</span><div><small>FDI COORDINATOR</small><strong>Zak Keller</strong><p>Typically responds within 30 minutes</p></div></div></aside>;
}

function CustomerExperience({ tab, setTab, flash }: { tab: string; setTab: (tab: string) => void; flash: (s: string) => void }) {
  if (tab === "proposal") return <div className="portal-two-col"><section className="portal-panel"><div className="portal-panel-title"><div><h2>FDI service proposal</h2><p>A single, complete price for the authorized work.</p></div><Badge tone="green">Inside your NTE</Badge></div><div className="proposal-total"><div><small>FDI CUSTOMER PRICE</small><strong>$1,000</strong><span>Not to exceed for the described scope</span></div><div className="nte-ring"><strong>$200</strong><small>remaining under your<br/>$1,200 issued NTE</small></div></div><div className="scope-box"><small>PROPOSED WORK</small><h3>Inspect, make safe, and replace failed loading-dock spring</h3><p>FDI will coordinate a qualified, compliant service provider; oversee scheduling and communication; collect completion evidence; and invoice after accepted completion.</p></div><div className="approval-strip"><span>✓</span><div><strong>No further approval is required</strong><p>This proposal is within the NTE issued with ServiceChannel work order SC-847219.</p></div></div><button className="primary full" onClick={() => {flash("Proposal acknowledged");setTab("schedule")}}>Acknowledge & view schedule</button></section><CustomerHelp /></div>;
  if (tab === "schedule") return <div className="portal-two-col"><section className="portal-panel"><div className="portal-panel-title"><div><h2>Scheduled service</h2><p>FDI is coordinating the service visit.</p></div><Badge tone="green">Confirmed</Badge></div><div className="big-date"><div><strong>28</strong><small>JUL</small></div><div><small>TUESDAY</small><h3>8:00–10:00 AM</h3><p>Expected arrival window · Loading dock</p></div></div><div className="timeline customer-timeline"><article className="done"><span className="timeline-dot">✓</span><div><strong>Request received</strong><p>Today · 8:42 AM</p></div></article><article className="done"><span className="timeline-dot">✓</span><div><strong>FDI reviewed and scheduled service</strong><p>Today · 10:36 AM</p></div></article><article className="current"><span className="timeline-dot">3</span><div><strong>Service visit</strong><p>Tuesday · 8:00–10:00 AM</p></div></article><article><span className="timeline-dot">4</span><div><strong>Completion review</strong><p>Photos and work summary will appear here</p></div></article></div><button className="secondary" onClick={() => flash("Scheduling question sent to FDI")}>Ask FDI about the schedule</button></section><CustomerHelp /></div>;
  if (tab === "updates") return <div className="portal-two-col"><section className="portal-panel"><div className="portal-panel-title"><div><h2>Updates from FDI</h2><p>The latest status of your request.</p></div></div><div className="update-feed"><article><span>✓</span><div><strong>Service scheduled</strong><p>FDI has scheduled service for Tuesday between 8:00 and 10:00 AM.</p><small>Today · 10:36 AM</small></div></article><article><span>✓</span><div><strong>Proposal inside authorized NTE</strong><p>The $1,000 FDI price is within your issued $1,200 NTE, so no additional approval is required.</p><small>Today · 10:24 AM</small></div></article><article><span>↳</span><div><strong>Request received from ServiceChannel</strong><p>Work order SC-847219 was received and assigned to an FDI coordinator.</p><small>Today · 8:42 AM</small></div></article></div><div className="portal-compose"><input placeholder="Ask FDI for an update…"/><button onClick={() => flash("Question sent to FDI")}>Send</button></div></section><CustomerHelp /></div>;
  return <div className="portal-two-col"><section className="portal-panel"><div className="portal-panel-title"><div><h2>Request details</h2><p>Submitted from ServiceChannel today at 8:42 AM.</p></div><Badge tone="green">FDI coordinating</Badge></div><div className="customer-request"><div className="door-visual"><span>Your photo · Loading dock</span></div><div className="scope-box"><small>YOUR REQUEST</small><h3>Loading dock door won’t close</h3><p>Spring appears damaged and the door is currently secured. Inspect, make safe, and replace the failed spring as authorized.</p></div></div><div className="customer-facts"><div><small>Issued NTE</small><strong>$1,200</strong></div><div><small>FDI proposal</small><strong>$1,000</strong></div><div><small>Service window</small><strong>Tue · 8–10 AM</strong></div></div><div className="approval-strip"><span>✓</span><div><strong>Your request is moving forward</strong><p>FDI’s proposal is within your issued NTE. No additional action is required from you.</p></div></div><button className="primary" onClick={() => setTab("proposal")}>Review FDI proposal →</button></section><CustomerHelp /></div>;
}

function CustomerHelp() {
  return <aside className="portal-panel portal-side"><div className="shield customer-shield">F</div><h3>FDI is managing the work</h3><p>Your FDI coordinator handles service-provider selection, scheduling, quality control, evidence, and billing.</p><div className="contact-card"><span className="avatar coral">ZK</span><div><small>YOUR FDI COORDINATOR</small><strong>Zak Keller</strong><p>Typically responds within 30 minutes</p></div></div><div className="privacy-customer"><strong>A simpler customer view</strong><p>You see one FDI proposal and one accountable point of contact—without vendor bidding or internal administration.</p></div></aside>;
}

function SectionPage({ section, flash }: { section: Exclude<Section, "work">; flash: (s: string) => void }) {
  if (section === "vendors") return <VendorsPage flash={flash} />;
  if (section === "customers") return <CustomersPage flash={flash} />;
  return <AccountingPage flash={flash} />;
}

function VendorsPage({ flash }: { flash: (s: string) => void }) {
  const [filter, setFilter] = useState("All vendors");
  const vendors = [
    { initials: "GL", name: "Great Lakes Door Co.", trade: "Door systems", territory: "45 mi · SE Michigan", compliance: "Compliant", expiry: "Insurance Mar 2027", score: "94%", active: "2 active jobs" },
    { initials: "MC", name: "Motor City Access", trade: "Door systems", territory: "30 mi · Metro Detroit", compliance: "Compliant", expiry: "License Dec 2026", score: "86%", active: "1 active job" },
    { initials: "NF", name: "Northstar Facilities", trade: "Unit cleanouts", territory: "Oakland & Macomb", compliance: "Review soon", expiry: "Insurance expires Aug 12", score: "81%", active: "No active jobs" },
    { initials: "CR", name: "Clean Reset Services", trade: "Unit cleanouts", territory: "Wayne County", compliance: "Blocked", expiry: "Insurance expired Jul 20", score: "78%", active: "Assignments blocked" },
  ];
  const visible = filter === "All vendors" ? vendors : filter === "Compliant" ? vendors.filter(v => v.compliance === "Compliant") : vendors.filter(v => v.compliance !== "Compliant");
  return <div className="content section-page"><div className="section-heading"><div><div className="eyebrow">APPROVED NETWORK · SOUTHEAST MICHIGAN</div><h1>Vendors</h1><p>Control coverage, compliance, and performance across FDI’s private network.</p></div><button className="primary" onClick={() => flash("Vendor invitation prepared")}>＋ Invite vendor</button></div>
    <div className="summary-cards"><div><span className="summary-icon">◈</span><small>Approved vendors</small><strong>4</strong><em>2 trades covered</em></div><div><span className="summary-icon green-bg">✓</span><small>Fully compliant</small><strong>2</strong><em>Eligible for assignment</em></div><div><span className="summary-icon amber-bg">!</span><small>Needs attention</small><strong>2</strong><em>1 assignment blocked</em></div><div><span className="summary-icon blue-bg">◎</span><small>Average response</small><strong>41 min</strong><em>Past 30 days</em></div></div>
    <section className="panel directory"><div className="directory-tools"><div className="search-box">⌕<input aria-label="Search vendors" placeholder="Search vendors, trades, or territory" /></div><div className="filter-tabs">{["All vendors","Compliant","Needs attention"].map(item => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
      <div className="directory-head vendor-directory"><span>Vendor</span><span>Trade & territory</span><span>Compliance</span><span>Performance</span><span>Workload</span></div>
      {visible.map((v, i) => <button className="directory-row vendor-directory" key={v.name} onClick={() => flash(`${v.name} profile opened`)}><div className="vendor-cell"><span className={`vendor-logo v${i % 3}`}>{v.initials}</span><div><strong>{v.name}</strong><small>Approved FDI vendor</small></div></div><div><strong>{v.trade}</strong><small>{v.territory}</small></div><div><Badge tone={v.compliance === "Compliant" ? "green" : v.compliance === "Blocked" ? "red" : "amber"}>{v.compliance}</Badge><small>{v.expiry}</small></div><div><strong>{v.score} fit</strong><small>Quality & responsiveness</small></div><div><strong>{v.active}</strong><small>View details →</small></div></button>)}
    </section>
  </div>;
}

function CustomersPage({ flash }: { flash: (s: string) => void }) {
  return <div className="content section-page"><div className="section-heading"><div><div className="eyebrow">PILOT CUSTOMERS</div><h1>Customers & facilities</h1><p>Customer-specific work-order sources, approval rules, facilities, and service history.</p></div><button className="primary" onClick={() => flash("Customer setup started")}>＋ Add customer</button></div>
    <div className="summary-cards three"><div><span className="summary-icon">▤</span><small>Pilot customers</small><strong>3</strong><em>8 facilities</em></div><div><span className="summary-icon green-bg">✓</span><small>Open work orders</small><strong>7</strong><em>5 inside original NTE</em></div><div><span className="summary-icon blue-bg">↳</span><small>Connected sources</small><strong>3</strong><em>ServiceChannel · Email · App</em></div></div>
    <div className="customer-grid">{[
      { name:"Northpoint Retail Group", code:"NR", facilities:"3 facilities", source:"ServiceChannel", open:"4 open", spend:"$8,420", color:"forest", place:"Troy · Rochester Hills · Novi" },
      { name:"Redwood Residential", code:"RR", facilities:"2 facilities", source:"wo@ email", open:"2 open", spend:"$3,180", color:"blue", place:"Detroit · Royal Oak" },
      { name:"Lakeshore Commerce", code:"LC", facilities:"3 facilities", source:"Customer app", open:"1 open", spend:"$1,940", color:"sand", place:"Southfield · Livonia · Canton" },
    ].map(c => <button className="customer-card" key={c.name} onClick={() => flash(`${c.name} workspace opened`)}><div className="customer-top"><span className={`customer-logo ${c.color}`}>{c.code}</span><Badge tone="green">Active pilot</Badge></div><h3>{c.name}</h3><p>{c.place}</p><div className="customer-metrics"><div><small>Portfolio</small><strong>{c.facilities}</strong></div><div><small>Current work</small><strong>{c.open}</strong></div><div><small>30-day billing</small><strong>{c.spend}</strong></div></div><div className="source-chip"><span>↳</span><div><small>Primary intake</small><strong>{c.source}</strong></div><i>→</i></div></button>)}</div>
    <section className="panel activity-panel"><div className="panel-title"><div><h2>Facility activity</h2><p>Recent work across the pilot portfolio.</p></div><button className="text-button">View all work orders</button></div>{[
      ["Parkview Commons — Troy","Loading dock door won’t close","Approved to schedule","Northpoint Retail","$1,000"],
      ["Woodward Flats — Detroit","Unit 312 cleanout","Vendor onsite","Redwood Residential","$840"],
      ["Westgate Plaza — Livonia","Rear entry spring failure","Awaiting bids","Lakeshore Commerce","$1,600 NTE"],
    ].map((row,i) => <button className="activity-row" key={row[0]} onClick={() => flash(`${row[0]} work order opened`)}><span className="facility-mark">⌂</span><div><strong>{row[0]}</strong><small>{row[1]}</small></div><Badge tone={i===0?"green":i===1?"blue":"amber"}>{row[2]}</Badge><div><strong>{row[3]}</strong><small>{row[4]}</small></div><span>→</span></button>)}</section>
  </div>;
}

function AccountingPage({ flash }: { flash: (s: string) => void }) {
  const [accountingFilter, setAccountingFilter] = useState("Needs action");
  const rows = [
    { wo:"WO-1048", job:"Loading dock door", customer:"Northpoint Retail", vendor:"Great Lakes Door", vendorInvoice:"$750", customerInvoice:"$1,000", status:"Prepare invoice", tone:"amber" as const },
    { wo:"WO-1044", job:"Unit 312 cleanout", customer:"Redwood Residential", vendor:"Clean Reset Services", vendorInvoice:"$630", customerInvoice:"$840", status:"Ready for QBO", tone:"blue" as const },
    { wo:"WO-1039", job:"Rear door spring", customer:"Lakeshore Commerce", vendor:"Motor City Access", vendorInvoice:"$1,080", customerInvoice:"$1,440", status:"Customer invoiced", tone:"green" as const },
    { wo:"WO-1031", job:"Vacant unit cleanout", customer:"Northpoint Retail", vendor:"Northstar Facilities", vendorInvoice:"$525", customerInvoice:"$700", status:"Paid", tone:"green" as const },
  ];
  return <div className="content section-page"><div className="section-heading"><div><div className="eyebrow">OPERATIONAL ACCOUNTING</div><h1>Accounting</h1><p>Prepare clean handoffs to QuickBooks Online and track status without moving money.</p></div><button className="primary" onClick={() => flash("QuickBooks handoff report prepared")}>Export QBO handoff</button></div>
    <div className="accounting-banner"><span className="qbo-mark">QBO</span><div><strong>QuickBooks Online is the accounting system of record</strong><p>Fieldline holds the proposal, approvals, authorization, and operational evidence. Payments and bank information remain outside this prototype.</p></div><Badge tone="green">Workflow aligned</Badge></div>
    <div className="summary-cards"><div><span className="summary-icon amber-bg">!</span><small>Needs action</small><strong>2</strong><em>$1,840 customer billing</em></div><div><span className="summary-icon blue-bg">↗</span><small>Ready for QBO</small><strong>1</strong><em>Evidence complete</em></div><div><span className="summary-icon green-bg">✓</span><small>Customer invoiced</small><strong>$2,140</strong><em>This month</em></div><div><span className="summary-icon">$</span><small>Gross profit</small><strong>$745</strong><em>25.0% blended margin</em></div></div>
    <section className="panel directory"><div className="directory-tools"><div className="filter-tabs">{["Needs action","All jobs","Invoiced","Paid"].map(item => <button key={item} className={accountingFilter === item ? "active" : ""} onClick={() => setAccountingFilter(item)}>{item}</button>)}</div><button className="secondary" onClick={() => flash("Accounting list downloaded")}>↓ Download</button></div><div className="directory-head accounting-directory"><span>Work order</span><span>Customer / vendor</span><span>Vendor invoice</span><span>Customer invoice</span><span>Status</span></div>{rows.filter(r => accountingFilter === "All jobs" || accountingFilter === "Needs action" && ["Prepare invoice","Ready for QBO"].includes(r.status) || accountingFilter === "Invoiced" && r.status === "Customer invoiced" || accountingFilter === "Paid" && r.status === "Paid").map(r => <button className="directory-row accounting-directory" key={r.wo} onClick={() => flash(`${r.wo} accounting record opened`)}><div><strong>{r.wo}</strong><small>{r.job}</small></div><div><strong>{r.customer}</strong><small>{r.vendor}</small></div><div><strong>{r.vendorInvoice}</strong><small>Vendor → FDI</small></div><div><strong>{r.customerInvoice}</strong><small>FDI → customer</small></div><div><Badge tone={r.tone}>{r.status}</Badge><small>Open record →</small></div></button>)}</section>
  </div>;
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
