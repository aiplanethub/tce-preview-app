import { pgTable } from "drizzle-orm/pg-core";

export const chapter_assets = pgTable("chapter_assets", (t) => ({
  id: t.char({ length: 32 }).primaryKey(),
  active: t.boolean().notNull(),
  created_at: t.bigint({ mode: "number" }),
  created_by: t.varchar({ length: 255 }),
  deleted: t.boolean().notNull(),
  last_modified_by: t.varchar({ length: 255 }),
  modified_at: t.bigint({ mode: "number" }),
  asset_id: t.varchar({ length: 255 }).notNull(),
  asset_mime_type: t.varchar({ length: 50 }).notNull(),
  asset_sub_type: t.varchar({ length: 50 }).notNull(),
  asset_type: t.varchar({ length: 32 }).notNull(),
  chapter_id: t.varchar({ length: 255 }).notNull(),
  content_consumer: t.varchar({ length: 20 }).notNull(),
  content_type: t.varchar({ length: 30 }),
  title: t.varchar({ length: 255 }).notNull(),
}));
