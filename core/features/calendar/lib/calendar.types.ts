import { Resource } from "@/lib/types";
import { Service as ServiceContract } from "@/lib/service.types";

export namespace Calendar {
  export type Visibility = "public" | "private";
  export type CTX = {
    userId: string;
  };
  type ID = Pick<Calendar, "id">;
  export type Insert = Omit<
    Calendar,
    "id" | "userId" | "createdAt" | "updatedAt"
  >;
  export type Update = Partial<Insert> & ID;
  export type Service = {
    get: (
      calendar: ID,
      ctx: CTX,
      opts?: {
        visibility: Visibility;
      },
    ) => Promise<ServiceContract.Return<Calendar | null, ID>>;
    getAll: (ctx: CTX) => Promise<ServiceContract.Return<Calendar[], ID>>;
    create: (
      calendar: Insert,
      ctx: CTX,
    ) => Promise<ServiceContract.Return<Calendar, Insert>>;
    update: (
      calendar: Update,
      ctx: CTX,
    ) => Promise<ServiceContract.Return<Calendar | null, Update>>;
    delete: (
      calendar: ID,
      ctx: CTX,
    ) => Promise<ServiceContract.Return<ID | null, ID>>;
  };
}

export interface Calendar extends Resource {
  name: string;
  description?: string;
  userId: string;
  visibility: Calendar.Visibility;
}
