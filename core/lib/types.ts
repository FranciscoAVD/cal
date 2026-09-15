export type Resource = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Applies Omit/Partial to each union member individually instead of
// collapsing to their shared keys, so variant-only fields (e.g. a
// discriminated union's per-branch fields) survive rather than silently
// disappearing.
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;
export type DistributivePartial<T> = T extends unknown ? Partial<T> : never;
