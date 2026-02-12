import { index, pgTable } from "drizzle-orm/pg-core";
import { boards } from "./boards";
import { grades } from "./grades";
import { subjects } from "./subjects";
import { sub_topics } from "./sub-topics";

export const chapters = pgTable(
  "chapters",
  (t) => ({
    id: t.char({ length: 32 }).primaryKey(),
    active: t.boolean().notNull(),
    created_at: t.bigint({ mode: "number" }),
    created_by: t.varchar({ length: 255 }),
    deleted: t.boolean().notNull(),
    last_modified_by: t.varchar({ length: 255 }),
    modified_at: t.bigint({ mode: "number" }),
    approved_at: t.bigint({ mode: "number" }),
    approved_by: t.varchar({ length: 255 }),
    chapter: t.varchar({ length: 255 }),
    chapter_status: t.varchar({ length: 32 }).default("PENDING"),
    reason: t.text(),
    rejected_at: t.bigint({ mode: "number" }),
    rejected_by: t.varchar({ length: 255 }),
    thumbnail_path: t.varchar({ length: 255 }),
    board_id: t
      .char({ length: 32 })
      .notNull()
      .references(() => boards.id),
    grade_id: t
      .char({ length: 32 })
      .notNull()
      .references(() => grades.id),
    subject_id: t
      .char({ length: 32 })
      .notNull()
      .references(() => subjects.id),
    sub_topic_id: t
      .char({ length: 32 })
      .references(() => sub_topics.id),
  }),
  (table) => [
    index("chaptersid_index").on(table.id),
    index("chapters_board_grade_subject_subtopic_id_index").on(
      table.board_id,
      table.grade_id,
      table.subject_id,
      table.sub_topic_id,
    ),
  ],
);
