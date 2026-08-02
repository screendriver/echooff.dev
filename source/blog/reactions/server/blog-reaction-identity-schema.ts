import { type } from "arktype";

export const anonymousReactorIdentifierByteCount = 32;
export const anonymousReactorIdentifierSchema = type("/^[A-Za-z0-9_-]{43}$/");

export type AnonymousReactorIdentifier = typeof anonymousReactorIdentifierSchema.infer;
