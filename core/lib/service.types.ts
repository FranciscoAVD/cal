export namespace Service {
  export type ValidationError<T extends object> = {
    [K in keyof T]:
      | {
          errors: string[];
        }
      | undefined;
  };

  export type Return<Expected, Shape extends object> =
    | {
        data: Expected;
        error?: undefined;
      }
    | {
        data?: undefined;
        error:
          | {
              kind: "validation";
              fields: ValidationError<Shape>;
            }
          | {
              kind: "storage";
              error: Error;
            };
      };
}
