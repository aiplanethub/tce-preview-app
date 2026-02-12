import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "~/lib/env";

export const master_db = drizzle(env.master_db_url);
export const user_db = drizzle(env.users_db_url);
export const content_db = drizzle(env.content_db_url);
