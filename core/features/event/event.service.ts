import type { Event } from "@f/event/lib/event.types";
import type { Storage } from "@/lib/storage.types";
import { tryCatch } from "@/lib/utils";

export function createEventService(
  storage: Storage.Adapter<Event>,
): Event.Service {
  return {
    get: async (event, ctx, opts) => {
      const [res, error] = await tryCatch(
        storage.select({
          id: {
            eq: event.id,
          },
          userId: {
            eq: ctx.userId,
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
      if (opts?.expand) {
        // expand events
        // would change return type to array
      }
      return {
        data: res[0] ?? null,
      };
    },
    getAll: async (ctx, opts) => {
      const [res, error] = await tryCatch(
        storage.select({
          userId: {
            eq: ctx.userId,
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

      return {
        data: res,
      };
    },
  };
}
