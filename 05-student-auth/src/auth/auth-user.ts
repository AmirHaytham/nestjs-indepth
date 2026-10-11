import type { Request } from 'express';
import type { Role } from './decorators/roles.decorator.js';

// What we put inside the access token, and what the guard puts on request.user.
export type AuthUser = { userid: string; role: Role };

export type RequestWithUser = Request & { user?: AuthUser };
