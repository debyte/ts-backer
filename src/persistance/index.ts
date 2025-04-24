import postgres from "postgres";
import { env } from "process";
import { ENV_VARS, FALSY_STRINGS } from "../constants";

export const sql = postgres({
  host: env[ENV_VARS.host],
  port: asNumber(ENV_VARS.port),
  database: env[ENV_VARS.database],
  user: env[ENV_VARS.user],
  username: env[ENV_VARS.username],
  password: env[ENV_VARS.password],
  idle_timeout: asNumber(ENV_VARS.idle_timeout),
  connect_timeout: asNumber(ENV_VARS.connect_timeout),
  ssl: isFalsy(ENV_VARS.ssl_auth) ? { rejectUnauthorized: false } : undefined,
});

function asNumber(key: string): number | undefined {
  return env[key] !== undefined ? Number(env[key]) : undefined;
}

function isFalsy(key: string): boolean {
  return env[key] !== undefined
    && FALSY_STRINGS.indexOf(env[key].toLowerCase()) >= 0;
}
