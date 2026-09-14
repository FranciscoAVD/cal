import { Service } from "@/lib/service.types";
import { Resource } from "@/lib/types";

export namespace Storage {
  // Storage-layer concerns only (transactions, tracing, connection handles)
  export type CTX = {};

  type Insert<R extends Resource> = Omit<R, "id" | "createdAt" | "updatedAt">;

  type FilterOp<V> = V extends Date | number
    ? { eq?: V; ne?: V; in?: V[]; gt?: V; gte?: V; lt?: V; lte?: V }
    : { eq?: V; ne?: V; in?: V[] };

  export type Query<R extends Resource, Extra extends object = {}> = {
    [K in keyof R]?: R[K] | FilterOp<R[K]>;
  } & Extra;

  export type Adapter<R extends Resource, Q extends Query<R> = Query<R>> = {
    select: (query: Q, ctx?: CTX) => Promise<R[]>;
    insert: (resource: Insert<R>, ctx?: CTX) => Promise<R>;
    update: (
      patch: Partial<Insert<R>>,
      query: Q,
      ctx?: CTX,
    ) => Promise<R | null>;
    delete: (query: Q, ctx?: CTX) => Promise<Pick<R, "id"> | null>;
  };
}
