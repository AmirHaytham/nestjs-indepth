import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export function checkId(id: string) {
  if (!isValidObjectId(id)) throw new BadRequestException(`"${id}" is not a valid id`);
}

export function notFound(what: string, id: string): never {
  throw new NotFoundException(`${what} ${id} not found`);
}

// A duplicate unique field becomes 409 instead of a 500.
export function rethrowDuplicate(error: unknown): never {
  if ((error as { code?: number }).code === 11000) {
    const field = Object.keys((error as { keyValue?: object }).keyValue ?? {})[0];
    throw new ConflictException(`${field} already exists`);
  }
  throw error;
}
