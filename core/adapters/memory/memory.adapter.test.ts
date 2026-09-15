import { describe, expect, test } from "bun:test";
import { createMemoryAdapter } from "@/adapters/memory/memory.adapter";
import type { Resource } from "@/lib/types";

type Item = Resource & {
  userId: string;
  name: string;
  score: number;
  dueAt: Date;
  tags: string[];
};

function makeAdapter() {
  return createMemoryAdapter<Item>();
}

describe("memory adapter", () => {
  test("insert assigns id/createdAt/updatedAt and select finds it", async () => {
    const storage = makeAdapter();
    const inserted = await storage.insert({
      userId: "u1",
      name: "first",
      score: 1,
      dueAt: new Date("2026-01-01"),
      tags: ["a"],
    });

    expect(inserted.id).toBeTruthy();
    expect(inserted.createdAt).toBeInstanceOf(Date);
    expect(inserted.updatedAt).toBeInstanceOf(Date);

    const found = await storage.select({ id: { eq: inserted.id } });
    expect(found).toEqual([inserted]);
  });

  test("select filters by implicit equality and eq/ne/in", async () => {
    const storage = makeAdapter();
    const a = await storage.insert({
      userId: "u1",
      name: "a",
      score: 1,
      dueAt: new Date("2026-01-01"),
      tags: ["x"],
    });
    const b = await storage.insert({
      userId: "u1",
      name: "b",
      score: 2,
      dueAt: new Date("2026-01-02"),
      tags: ["y"],
    });
    await storage.insert({
      userId: "u2",
      name: "c",
      score: 3,
      dueAt: new Date("2026-01-03"),
      tags: ["z"],
    });

    expect(await storage.select({ userId: "u1" })).toEqual(
      expect.arrayContaining([a, b]),
    );
    expect((await storage.select({ userId: "u1" })).length).toBe(2);

    expect(await storage.select({ name: { ne: "a" }, userId: { eq: "u1" } })).toEqual([
      b,
    ]);

    expect(await storage.select({ name: { in: ["a", "c"] } })).toEqual(
      expect.arrayContaining([a, expect.objectContaining({ name: "c" })]),
    );
  });

  test("select filters by ordering operators on numbers and dates", async () => {
    const storage = makeAdapter();
    const low = await storage.insert({
      userId: "u1",
      name: "low",
      score: 1,
      dueAt: new Date("2026-01-01"),
      tags: [],
    });
    const high = await storage.insert({
      userId: "u1",
      name: "high",
      score: 10,
      dueAt: new Date("2026-06-01"),
      tags: [],
    });

    expect(await storage.select({ score: { gt: 5 } })).toEqual([high]);
    expect(await storage.select({ score: { lte: 1 } })).toEqual([low]);
    expect(
      await storage.select({ dueAt: { gte: new Date("2026-03-01") } }),
    ).toEqual([high]);
  });

  test("update merges a patch into the matching record and bumps updatedAt", async () => {
    const storage = makeAdapter();
    const item = await storage.insert({
      userId: "u1",
      name: "before",
      score: 1,
      dueAt: new Date("2026-01-01"),
      tags: [],
    });

    const updated = await storage.update(
      { name: "after" },
      { id: { eq: item.id } },
    );

    expect(updated?.name).toBe("after");
    expect(updated?.score).toBe(1);
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
      item.updatedAt.getTime(),
    );

    expect(await storage.select({ id: { eq: item.id } })).toEqual([updated]);
  });

  test("update returns null when nothing matches", async () => {
    const storage = makeAdapter();
    const updated = await storage.update(
      { name: "nope" },
      { id: { eq: "missing" } },
    );
    expect(updated).toBeNull();
  });

  test("delete removes the matching record and returns its id", async () => {
    const storage = makeAdapter();
    const item = await storage.insert({
      userId: "u1",
      name: "gone",
      score: 1,
      dueAt: new Date("2026-01-01"),
      tags: [],
    });

    const deleted = await storage.delete({ id: { eq: item.id } });
    expect(deleted).toEqual({ id: item.id });
    expect(await storage.select({ id: { eq: item.id } })).toEqual([]);
  });

  test("delete returns null when nothing matches", async () => {
    const storage = makeAdapter();
    expect(await storage.delete({ id: { eq: "missing" } })).toBeNull();
  });

  test("seed data is loaded upfront", async () => {
    const seeded: Item = {
      id: "seed-1",
      userId: "u1",
      name: "seeded",
      score: 1,
      dueAt: new Date("2026-01-01"),
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const storage = createMemoryAdapter<Item>([seeded]);

    expect(await storage.select({ id: { eq: "seed-1" } })).toEqual([seeded]);
  });
});
