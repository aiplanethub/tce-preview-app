import { index, pgTable } from "drizzle-orm/pg-core";

export const boards = pgTable(
  "boards",
  (t) => ({
    id: t.char({ length: 32 }).primaryKey(),
    active: t.boolean().notNull(),
    created_at: t.bigint({ mode: "number" }),
    created_by: t.varchar({ length: 255 }),
    deleted: t.boolean().notNull(),
    last_modified_by: t.varchar({ length: 255 }),
    modified_at: t.bigint({ mode: "number" }),
    board: t.varchar({ length: 255 }),
    discription: t.varchar({ length: 255 }),
  }),
  (table) => [index("boardsid_index").on(table.id)],
);
