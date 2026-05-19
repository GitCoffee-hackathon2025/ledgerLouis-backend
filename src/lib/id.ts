import { ulid, isValid } from "ulid";

export type ULID = string & { readonly __brand: unique symbol };

export const generateId = (): ULID => ulid() as ULID;

export const isValidId = (v: string): boolean => isValid(v);

export const toId = (v: string): ULID => v as ULID;
