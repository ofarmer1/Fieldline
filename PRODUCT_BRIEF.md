# FDI Facilities Marketplace — Recovered Product Brief

## Purpose and boundary

This repository is Oliver Farmer's independent prototype for FDI's facilities-maintenance workflow. It is separate from FDI's current PBR roadmap. The prototype is a private, managed network—not an open marketplace. Customers receive one final FDI proposal; vendor invitations, bids, selection logic, and FDI margin remain internal.

Version one demonstrates routine facilities-maintenance work and does not move money or collect banking/card information. QuickBooks Online remains the accounting system of record. The first pilot is intentionally small: Southeast Michigan, initially door springs and unit cleanouts, with fewer than five customer participants, fewer than five vendors, and a small FDI team.

## End-to-end workflow

1. An FDI employee records a request received through ServiceChannel, a customer app, `wo@farmerdevelopment.com`, phone, or another channel.
2. Intake captures customer, facility, customer work-order number, requester when known, scope, photos, issued NTE, assigned Facility Maintenance Coordinator (FMC), source, and urgency.
3. FDI privately invites approved vendors. Recommendations may consider trade, territory, insurance, licensing, expertise, availability, past performance, responsiveness, quality, and callback risk.
4. Vendors submit private scopes, schedules, and prices. They never see other vendors, bids, FDI's customer price, margin, or selection logic.
5. FDI selects the best-fit vendor—not automatically the lowest price—and records a short internal reason, especially when not selecting the lowest bid.
6. FDI prices using gross margin. Default gross margin is 25%; `customer price = vendor cost / (1 - gross margin)`. Thus $750 vendor cost becomes $1,000 customer price and $250 gross profit.
7. Work priced within the customer-issued NTE needs no additional customer approval. Above NTE, FDI records an increased NTE or higher-proposal approval. Approved amount, date when available, source, customer-system reference, and named approver when known are recorded; approver name is optional.
8. FDI authorizes and assigns the vendor, schedules work, communicates updates, preserves change-order/NTE history, collects completion evidence, tracks both invoices, and closes out the job.

## Important operating rules

- There is no automatic $5,000 FM-to-CapEx transfer. The assigned FMC normally keeps a growing FM job.
- Fire/flood exceptions may split stabilization and restoration. A distinct restoration or larger follow-on becomes a linked PBR project; the original FM request is not transferred.
- Department-transfer functionality is not part of v1. A configurable division/coordinator warning may be added later.
- Emergency flow remains configurable while Zak develops the final on-call process. Urgent jobs can be sent directly to an approved vendor without multiple bids.
- An emergency vendor may diagnose, make safe, and perform authorized work within NTE. Beyond NTE, an increase is required. If unavailable, document conditions/photos and price the extra work before proceeding.
- Each emergency record should capture arrival, diagnosis, photos, temporary measures, completed work, and whether a return visit is required.
- Vendors cannot continue beyond the authorized NTE. Preserve original NTE and every increase, including reason, vendor cost, revised customer amount, photos, approval source/date, and whether the vendor continued or returned.
- Expired required insurance or licensing blocks or clearly flags new assignments.
- FDI invoices the customer, the vendor invoices FDI, and FDI pays the vendor. V1 tracks proposal, NTE, approvals, authorization, both invoices, accounting status, and payment status but processes no payments.

## Vendor records

Track business/contact information, insurance and expiry, approved trades, service territory, relevant experience, required licenses and expiry, approval status, and internal FDI performance notes.

## Pilot evidence

Oliver should work with Zak to obtain three anonymized examples: a routine repair within original NTE; a door-spring or unit-cleanout job with one vendor; and a job requiring an NTE increase or proposal approval. Capture intake source, original NTE, scope/photos, vendor pricing, FDI price, approval, scheduling, completion, vendor invoice, and customer billing. Remove customer names, contacts, access details, banking details, and other sensitive information.

## Prototype direction

Provisional product name: **Fieldline** — “Every work order, under control.” The prototype is a desktop-first operations cockpit with realistic Michigan pilot data, a guided job record, private bid review, pricing calculator, NTE history, evidence, and closeout status. It uses browser-local demo state only; no production integrations or persistent customer data are implied.

