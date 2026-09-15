import { Resource, DistributiveOmit, DistributivePartial } from "@/lib/types";
import { Service as ServiceContract } from "@/lib/service.types";
import { Calendar } from "@f/calendar/lib/calendar.types";

export namespace Event {
  // RFC 5545 RRULE
  type RecurrenceRule = string;

  /** Where the event takes place (in person, a video link, a phone number, etc). */
  export type Location = {
    type: string;
    address?: string;
    link?: string;
  };

  /** Color used to render the event in a calendar view, for light and dark themes. */
  export type Color = {
    light: string;
    dark: string;
  } | null;

  /**
   * Whether the event blocks time on the calendar.
   * - `busy` - occupies the time (the default for most events)
   * - `free` - doesn't occupy the time, so it's ignored by conflict/availability checks
   */
  export type BusyStatus = "busy" | "free";

  /**
   * Per-event visibility, independent of the calendar's own `visibility`.
   * - `default` - inherit the containing calendar's visibility
   */
  export type Visibility = "default" | Calendar.Visibility;

  export type AttendeeResponseStatus =
    | "needsAction"
    | "accepted"
    | "declined"
    | "tentative";

  /** A participant on the event, identified by a system user or a bare email. */
  export type Attendee = ({ userId: string } | { email: string }) & {
    responseStatus: Event.AttendeeResponseStatus;
  };

  type Base = {
    calendarId: string;
    userId: string;
    title: string;
    description?: string;
    location?: Event.Location;
    color?: Event.Color;
    visibility?: Event.Visibility;
    busyStatus: Event.BusyStatus;
    attendees?: Event.Attendee[];
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

  type CTX = {
    userId: string;
  };
  type Options = {
    expand: boolean;
  };
  type ID = Pick<Event, "id">;
  export type Insert = DistributiveOmit<
    Event,
    "id" | "userId" | "createdAt" | "updatedAt"
  >;
  export type Update = DistributivePartial<Insert> & ID;
  export type Service = {
    get: {
      (
        event: ID,
        ctx: CTX,
        opts: Options & { expand: true },
      ): Promise<ServiceContract.Return<Event[], ID>>;
      (
        event: ID,
        ctx: CTX,
        opts?: Options & { expand?: false },
      ): Promise<ServiceContract.Return<Event | null, ID>>;
    };
    getAll: (
      ctx: CTX,
      opts?: Options,
    ) => Promise<ServiceContract.Return<Event[], ID>>;
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
