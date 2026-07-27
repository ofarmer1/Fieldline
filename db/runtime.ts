import { AsyncLocalStorage } from "node:async_hooks";

type RuntimeBindings = { DB: D1Database };
const bindings = new AsyncLocalStorage<RuntimeBindings>();

export function runWithBindings<T>(env: RuntimeBindings, task: () => T): T {
  return bindings.run(env, task);
}

export function getDemoDb(): D1Database {
  const db = bindings.getStore()?.DB;
  if (!db) throw new Error("The demo database binding is unavailable.");
  return db;
}
