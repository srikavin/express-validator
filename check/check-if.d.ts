import { RequestHandler } from 'express';
import { ValidationChain } from './check';

export type Conditions = ValidationChain | ValidationChain[];
export function checkIf(conditions: Conditions, validations: RequestHandler | RequestHandler[]): RequestHandler;