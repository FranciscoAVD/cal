import type { Calendar } from "@f/calendar/lib/calendar.types";
import type { Storage } from "@/lib/storage.types";
import { tryCatch } from "@/lib/utils";

export function createCalendarService(
  storage: Storage.Adapter<Calendar>,
): Calendar.Service {
  return {
    get: async (cal, ctx, opts) => {
      const [res, error] = await tryCatch(
        storage.select({
          id: { eq: cal.id },
          userId: { eq: ctx.userId },
          ...(opts && { visibility: { eq: opts.visibility } }),
        }),
      );
      if (error)
        return {
          error: {
            kind: "storage",
            error,
          },
        };
      return {
        data: res[0] ?? null,
      };
    },
    getAll: async (ctx, opts) => {
      const [res, error] = await tryCatch(
        storage.select({
          userId: { eq: ctx.userId },
          ...(opts && { visibility: opts.visibility }),
        }),
      );
      if (error)
        return {
          error: {
            kind: "storage",
            error,
          },
        };
      return {
        data: res,
      };
    },
    create: async (calendar, { userId }) => {
      const [res, error] = await tryCatch(
        storage.insert({ ...calendar, userId }),
      );
      if (error)
        return {
          error: {
            kind: "storage",
            error,
          },
        };

      return {
        data: res,
      };
    },
    update: async ({ id, ...patch }, { userId }) => {
      const [res, error] = await tryCatch(
        storage.update(patch, {
          id: {
            eq: id,
          },
          userId: {
            eq: userId,
          },
        }),
      );

      if (error)
        return {
          error: {
            kind: "storage",
            error,
          },
        };
      if (!res)
        return {
          error: {
            kind: "storage",
            error: new Error("Calendar not found"),
          },
        };
      return {
        data: res,
      };
    },
    delete: async ({ id }, { userId }) => {
      const [res, error] = await tryCatch(
        storage.delete({
          id: {
            eq: id,
          },
          userId: {
            eq: userId,
          },
        }),
      );

      if (error)
        return {
          error: {
            kind: "storage",
            error,
          },
        };

      if (!res)
        return {
          error: {
            kind: "storage",
            error: new Error("Calendar not found"),
          },
        };

      return {
        data: res,
      };
    },
  };
}
