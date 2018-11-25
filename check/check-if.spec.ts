import { RequestHandler } from 'express';
import { checkIf } from './check-if';
import { check } from './validation-chain-builders';

const chain = check('foo').equals('foo');
const randomMiddleware: RequestHandler = () => {};

// one condition, one validation
let middleware: RequestHandler = checkIf(chain, chain);

// one condition, one random middleware
middleware = checkIf(chain, randomMiddleware);

// one condition, mixed validations/random middlewares
middleware = checkIf(chain, [chain, randomMiddleware]);

// multiple conditions, one validation
middleware = checkIf([chain, chain], chain);

// multiple conditions, mixed validations/random middlewares
middleware = checkIf([chain, chain], [chain, randomMiddleware]);