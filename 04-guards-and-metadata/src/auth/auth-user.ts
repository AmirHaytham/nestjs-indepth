import type { Request } from 'express';

export type AuthUser = { userid: string; role: string };

// Express's Request has no "user" field, so request['user'] does not compile.
export type RequestWithUser = Request & { user?: AuthUser };
