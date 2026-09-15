import type { Storage } from "@/lib/storage.types";
import type { Resource } from "@/lib/types";

type FilterOpObject = Partial<
  Record<"eq" | "ne" | "in" | "gt" | "gte" | "lt" | "lte", unknown>
>;

const FILTER_OP_KEYS = new Set(["eq", "ne", "in", "gt", "gte", "lt", "lte"]);

function isFilterOp(value: unknown): value is FilterOpObject {
  if (value === null || typeof value !== "object") return false;
  if (value instanceof Date || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => FILTER_OP_KEYS.has(key));
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a instanceof Date || b instanceof Date)
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  if (Array.isArray(a) || Array.isArray(b))
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((v, i) => valuesEqual(v, b[i]))
    );
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null)
    return JSON.stringify(a) === JSON.stringify(b);
  return a === b;
}

function orderableValue(value: unknown): number {
  return value instanceof Date ? value.getTime() : (value as number);
}

function matchesFilterOp(fieldValue: unknown, op: FilterOpObject): boolean {
  if ("eq" in op && !valuesEqual(fieldValue, op.eq)) return false;
  if ("ne" in op && valuesEqual(fieldValue, op.ne)) return false;
  if ("in" in op && !(op.in as unknown[]).some((v) => valuesEqual(fieldValue, v)))
    return false;
  if ("gt" in op && !(orderableValue(fieldValue) > orderableValue(op.gt)))
    return false;
  if ("gte" in op && !(orderableValue(fieldValue) >= orderableValue(op.gte)))
    return false;
  if ("lt" in op && !(orderableValue(fieldValue) < orderableValue(op.lt)))
    return false;
  if ("lte" in op && !(orderableValue(fieldValue) <= orderableValue(op.lte)))
    return false;
  return true;
}

function matches<R extends Resource>(record: R, query: Storage.Query<R>): boolean {
  return (Object.keys(query) as (keyof R)[]).every((key) => {
    const filter = query[key];
    if (filter === undefined) return true;
    const fieldValue = record[key];
    return isFilterOp(filter)
      ? matchesFilterOp(fieldValue, filter)
      : valuesEqual(fieldValue, filter);
  });
}

/** In-memory `Storage.Adapter`, useful for tests and local development. */
export function createMemoryAdapter<
  R extends Resource,
  Q extends Storage.Query<R> = Storage.Query<R>,
>(seed: R[] = []): Storage.Adapter<R, Q> {
  const store = new Map<string, R>(seed.map((record) => [record.id, record]));

  return {
    select: async (query) => {
      return Array.from(store.values()).filter((record) => matches(record, query));
    },
    insert: async (resource) => {
      const record = {
        ...resource,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as R;
      store.set(record.id, record);
      return record;
    },
    update: async (patch, query) => {
      const existing = Array.from(store.values()).find((record) =>
        matches(record, query),
      );
      if (!existing) return null;

      const updated = { ...existing, ...patch, updatedAt: new Date() } as R;
      store.set(updated.id, updated);
      return updated;
    },
    delete: async (query) => {
      const existing = Array.from(store.values()).find((record) =>
        matches(record, query),
      );
      if (!existing) return null;

      store.delete(existing.id);
      return { id: existing.id } as Pick<R, "id">;
    },
  };
}
