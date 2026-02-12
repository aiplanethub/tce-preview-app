import { index, pgTable } from "drizzle-orm/pg-core";
import { subjects } from "./subjects";

export const sub_topics = pgTable(
  "sub_topics",
  (t) => ({
    id: t.char({ length: 32 }).primaryKey(),
    active: t.boolean().notNull(),
    created_at: t.bigint({ mode: "number" }),
    created_by: t.varchar({ length: 255 }),
    deleted: t.boolean().notNull(),
    last_modified_by: t.varchar({ length: 255 }),
    modified_at: t.bigint({ mode: "number" }),
    sub_topic: t.varchar({ length: 255 }),
    subject_id: t.char({ length: 32 }).references(() => subjects.id),
  }),
  (table) => [
    index("subtopicsid_index").on(table.id),
    index("subtopics_subject_id_index").on(table.id, table.subject_id),
  ],
);
