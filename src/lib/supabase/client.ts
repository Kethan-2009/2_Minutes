"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Supabase client for the browser. Holds the user's session in cookies so the
 * server can read it too.
 */
export function createClient() {
  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}
