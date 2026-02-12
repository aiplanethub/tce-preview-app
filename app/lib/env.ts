import { z } from "zod";

const envSchema = z.object({
  api_url: z.string(),
  api_proxy_target: z.url(),
  login_url: z.url(),
  tce_url: z.url(),

  master_db_url: z.string(),
  users_db_url: z.string(),
  content_db_url: z.string(),
});

const viteEnvSchema = z
  .object({
    VITE_API_URL: z.string(),
    VITE_API_PROXY_TARGET: z.url(),
    VITE_LOGIN_BASE_URL: z.url(),
    VITE_TCE_API_BASE_URL: z.url(),

    VITE_DB_HOSTNAME: z.string(),
    VITE_DB_PASSWORD: z.string(),
    VITE_DB_USER: z.string(),

    VITE_MASTER_DB: z.string(),
    VITE_USERS_DB: z.string(),
    VITE_CONTENT_DB: z.string(),
  })
  .transform((e) => {
    const db_host = e.VITE_DB_HOSTNAME;
    const db_pass = e.VITE_DB_PASSWORD;
    const db_user = e.VITE_DB_USER;

    function db_url_builder(db_name: string) {
      return `postgresql://${db_user}:${db_pass}@${db_host}/${db_name}`;
    }

    return {
      master_db_url: db_url_builder(e.VITE_MASTER_DB),
      users_db_url: db_url_builder(e.VITE_USERS_DB),
      content_db_url: db_url_builder(e.VITE_CONTENT_DB),

      api_url: e.VITE_API_URL,
      api_proxy_target: e.VITE_API_PROXY_TARGET,
      login_url: e.VITE_LOGIN_BASE_URL,
      tce_url: e.VITE_TCE_API_BASE_URL,
    };
  })
  .pipe(envSchema);

export type Env = z.infer<typeof envSchema>;
export const env = viteEnvSchema.parse(import.meta.env);
