import { Colors } from "@themes/type";
import { z } from "zod";
import { HttpStatusCode } from "axios";

export {};

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/ban-types
  function forwardRef<T, P = {}>(
    render: (
      props: P,
      ref: import("react").ForwardedRef<T>,
    ) => import("react").ReactElement | null,
  ): (
    props: P & import("react").RefAttributes<T>,
  ) => import("react").ReactElement | null;
}
declare global {
  type ActionBase<T = undefined> = T extends undefined
    ? {
        type: string;
      }
    : {
        type: string;
        payload: T;
      };
  type ZodShape<T> = {
    // Require all the keys from T
    [key in keyof T]-?: undefined extends T[key]
      ? // When optional, require the type to be optional in zod
        z.ZodOptionalType<z.ZodType<T[key]>>
      : z.ZodType<T[key]>;
  };
  type CustomOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

  type NestedNavigatorParams<ParamList> = {
    [K in keyof ParamList]: undefined extends ParamList[K]
      ? { screen: K; params?: ParamList[K] }
      : { screen: K; params: ParamList[K] };
  }[keyof ParamList];

  type IncludeMatchingProperties<T, V> = Pick<
    T,
    { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T]
  >;

  type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
    T,
    Exclude<keyof T, Keys>
  > &
    {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  type DataResponse = {
    Message: string;
    StatusCode: HttpStatusCode;
    Success: boolean;
    Expired: boolean;
    Language: string;
  };

  type ResponseBase<T = any> = {
    code: number;
    data: DataResponse & T;
    status: true;
  };

  type OptionData<T = any> = {
    key: T;

    text: string;

    subtitle?: string;

    color?: Colors;

    borderColor?: Colors;

    backgroundColor?: Colors;
  };

  /**
   * CallbackFn is a function type that accepts a value and returns void.
   * @template Params - The type of the value argument.
   */
  type CallbackFn<Args extends any[] = any[], ReturnType = void> = (
    ...args: Args
  ) => ReturnType;

  /**
   * KeysEndingInKey<T> extracts the keys of T that have names ending with 'Key'.
   * Produces a union of those key names.
   * @template T - The object type whose keys to filter.
   */
  type KeysEndingInKey<T> = {
    [K in keyof T]: K extends `${string}Key` ? K : never;
  }[keyof T];
}
