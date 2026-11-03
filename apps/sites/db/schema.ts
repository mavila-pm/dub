import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const links = sqliteTable("links", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  channel: text("channel").notNull().default(""),
  medium: text("medium").notNull().default(""),
  campaign: text("campaign").notNull().default(""),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (t) => [index("links_owner_idx").on(t.owner)]);

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  linkId: text("link_id").notNull().references(() => links.id),
  clickedAt: text("clicked_at").notNull(),
  day: text("day").notNull(),
  country: text("country").notNull().default("XX"),
  device: text("device").notNull(),
  browser: text("browser").notNull(),
  referrer: text("referrer").notNull().default(""),
  source: text("source").notNull(),
  channel: text("channel").notNull().default(""),
  campaign: text("campaign").notNull().default(""),
  trigger: text("trigger").notNull(),
  bot: integer("bot").notNull().default(0),
}, (t) => [index("events_link_date_idx").on(t.linkId, t.clickedAt), index("events_date_idx").on(t.clickedAt)]);
