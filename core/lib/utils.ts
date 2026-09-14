export async function tryCatch<T>(
  fn: Promise<T> | (() => Promise<T>),
): Promise<[T, null] | [null, Error]> {
  try {
    return [await (typeof fn === "function" ? fn() : fn), null];
  } catch (err) {
    return [null, err instanceof Error ? err : Error(String(err))];
  }
}
