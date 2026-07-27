import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const facilities = sqliteTable("facilities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customer: text("customer").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
});

export const workOrders = sqliteTable("work_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerWo: text("customer_wo").notNull().unique(),
  facilityId: integer("facility_id").notNull().references(() => facilities.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("FDI reviewing"),
  priority: text("priority").notNull().default("routine"),
  nte: integer("nte").notNull().default(0),
  customerPrice: integer("customer_price"),
  vendorCost: integer("vendor_cost"),
  assignedVendor: text("assigned_vendor"),
  serviceWindow: text("service_window"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const invitations = sqliteTable("invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workOrderId: integer("work_order_id").notNull().references(() => workOrders.id),
  vendor: text("vendor").notNull(),
  status: text("status").notNull().default("invited"),
  offeredAmount: integer("offered_amount").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workOrderId: integer("work_order_id").notNull().references(() => workOrders.id),
  senderRole: text("sender_role").notNull(),
  senderName: text("sender_name").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
