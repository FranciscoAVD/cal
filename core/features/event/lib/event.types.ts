import { Resource } from "@/lib/types";
import { Service as ServiceContract } from "@/lib/service.types";

export namespace Event {
  // RFC 5545 RRULE
  export type RecurrenceRule = string;

  type Base = {
    calendarId: string;
    userId: string;
    title: string;
    description?: string;
    location?: string;
    recurrenceRule?: RecurrenceRule;
    // Present only on an exception event — one that overrides (or cancels)
    // a single occurrence of another event's recurrenceRule. The pair
    // identifies which occurrence is being replaced; occurrences aren't
    // tracked on the recurring event itself.
    recurringEventId?: string;
    originalStart?: Date;
  };

  export type AllDay = Base & {
    allDay: true;
    start: Date;
    end: Date;
  };

  export type Timed = Base & {
    allDay: false;
    timezone: string;
    start: Date;
    end: Date;
  };

  // Applies Omit/Partial to each union member individually instead of
  // collapsing to their shared keys, so variant-only fields (e.g. timezone)
  // survive rather than silently disappearing from Insert/Update.
  type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
    ? Omit<T, K>
    : never;
  type DistributivePartial<T> = T extends unknown ? Partial<T> : never;

  export type CTX = {
    userId: string;
  };
  type ID = Pick<Event, "id">;
  export type Insert = DistributiveOmit<
    Event,
    "id" | "userId" | "createdAt" | "updatedAt"
  >;
  export type Update = DistributivePartial<Insert> & ID;
  export type Service = {
    get: (
      event: ID,
      ctx: CTX,
    ) => Promise<ServiceContract.Return<Event | null, ID>>;
    getAll: (ctx: CTX) => Promise<ServiceContract.Return<Event[], ID>>;
    create: (
      event: Insert,
      ctx: CTX,
    ) => Promise<ServiceContract.Return<Event, Insert>>;
    update: (
      event: Update,
      ctx: CTX,
    ) => Promise<ServiceContract.Return<Event | null, Update>>;
    delete: (
      event: ID,
      ctx: CTX,
    ) => Promise<ServiceContract.Return<ID | null, ID>>;
  };
}

export type Event = Resource & (Event.AllDay | Event.Timed);
