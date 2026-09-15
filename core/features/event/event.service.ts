import type { Event } from "@f/event/lib/event.types";
import type { Storage } from "@/lib/storage.types";
import { tryCatch } from "@/lib/utils";

export function createEventService(
  storage: Storage.Adapter<Event>,
): Event.Service {
  return {
    get: (async (event, ctx, opts) => {
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
        return {
          data: res,
        };
      }

      return {
        data: res[0] ?? null,
      };
    }) as Event.Service["get"],
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
    create: async (event, { userId }) => {
      const [res, error] = await tryCatch(storage.insert({ ...event, userId }));
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
            error: new Error("Event not found"),
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
            error: new Error("Event not found"),
          },
        };

      return {
        data: res,
      };
    },
  };
}
