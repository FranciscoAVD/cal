// Extracted event & calendar types (standalone copies, no imports).
// Source: packages/trpc/server/routers/viewer/eventTypes/types.ts
// Source: packages/trpc/server/routers/viewer/calendars/connectedCalendars.schema.ts
// Source: packages/trpc/server/routers/viewer/calendars/setDestinationCalendar.schema.ts
// Source: packages/trpc/server/routers/viewer/calendars/setDestinationReminder.schema.ts
//
// Pruned to only the types directly describing a calendar event and its
// linked calendar (unrelated booking-app config like pricing, hosts,
// custom form fields, video settings, etc. has been removed).

/** Types describing a calendar event and its scheduling rules. */
export namespace Event {
  /**
   * How the event's availability window is bounded.
   * - `UNLIMITED` - bookable indefinitely into the future
   * - `ROLLING` - bookable within a rolling N-day window from today
   * - `ROLLING_WINDOW` - like `ROLLING`, but the window only advances once fully booked
   * - `RANGE` - bookable only within a fixed `periodStartDate`–`periodEndDate` range
   */
  export type PeriodType = "UNLIMITED" | "ROLLING" | "ROLLING_WINDOW" | "RANGE";

  /**
   * How a host is chosen when an event has multiple assignable hosts.
   * - `ROUND_ROBIN` - rotate through hosts
   * - `COLLECTIVE` - all hosts attend together
   * - `MANAGED` - hosts are assigned centrally rather than self-selecting
   */
  export type SchedulingType = "ROUND_ROBIN" | "COLLECTIVE" | "MANAGED";

  /** Where a booked event takes place (in person, a video link, a phone number, etc). */
  export type Location = {
    type: string;
    address?: string;
    link?: string;
    displayLocationPublicly?: boolean;
    hostPhoneNumber?: string;
    credentialId?: number;
    teamName?: string;
    customLabel?: string;
  };

  /** Recurrence rule for an event that repeats on a fixed interval. */
  export type Recurrence = {
    /** Recurrence frequency unit (e.g. daily/weekly/monthly), as a numeric code. */
    freq: number;
    /** Number of times the event recurs. */
    count: number;
    /** Number of `freq` units between occurrences. */
    interval: number;
  };

  /** Color used to render the event in a calendar view, for light and dark themes. */
  export type Color = {
    lightEventTypeColor: string;
    darkEventTypeColor: string;
  } | null;

  /**
   * Partial update payload for an event.
   *
   * `id` identifies the event being updated; every other field is optional
   * and only overwrites the event when explicitly provided.
   */
  export type Update = {
    id: number;

    title?: string;
    slug?: string;
    description?: string | null;
    /** Duration of the event, in minutes. */
    length?: number;
    locations?: Event.Location[] | null;
    timeZone?: string | null;
    /** Whether the event is hidden from public booking pages. */
    hidden?: boolean;

    periodType?: Event.PeriodType;
    /** Start of the bookable range, used when `periodType` is `RANGE`. */
    periodStartDate?: Date | null;
    /** End of the bookable range, used when `periodType` is `RANGE`. */
    periodEndDate?: Date | null;
    /** Length of the bookable window in days, used when `periodType` is `ROLLING`/`ROLLING_WINDOW`. */
    periodDays?: number | null;
    /** Whether `periodDays` counts calendar days rather than business days. */
    periodCountCalendarDays?: boolean | null;

    schedulingType?: Event.SchedulingType | null;
    recurringEvent?: Event.Recurrence;
    eventTypeColor?: Event.Color;

    /** Calendar that new bookings of this event are written to. */
    destinationCalendar?: Calendar.Destination;

    createdAt?: Date | null;
    updatedAt?: Date | null;
  };
}

/** Types describing a connected calendar and how it's used for scheduling. */
export namespace Calendar {
  /** Filter used when listing a user's (or an event's) connected calendars. */
  export type ConnectedCalendarsQuery =
    | {
        /** Whether this query is happening during onboarding. */
        onboarding?: boolean;
        // Fetches the calendars for this event-type only if present
        // Otherwise, fetches the calendars for the authenticated user
        eventTypeId?: number | null;
        /** Skip re-syncing calendar data before returning results. */
        skipSync?: boolean;
      }
    | undefined;

  /** Input for setting which calendar new bookings should be written to. */
  export type SetDestinationInput = {
    integration: string;
    externalId: string;
    /** Scope the destination to a specific event type, if provided. */
    eventTypeId?: number | null;
    /** Scope the destination to a specific existing booking, if provided. */
    bookingId?: number | null;
  };

  /** Reference to a specific calendar within a connected calendar integration. */
  export type Destination = {
    /** Calendar provider/integration slug (e.g. `google_calendar`). */
    integration: string;
    /** Calendar's id within that provider. */
    externalId: string;
  } | null;

  /** Minutes before an event to trigger a reminder, or `null` for no reminder. */
  export type ReminderMinutes = 0 | 10 | 30 | 60 | null;

  /** Input for setting the default reminder time on a connected calendar's credential. */
  export type SetReminderInput = {
    credentialId: number;
    integration: string;
    defaultReminder: Calendar.ReminderMinutes;
  };
}
