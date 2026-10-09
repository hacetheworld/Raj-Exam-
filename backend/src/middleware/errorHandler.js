import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const notFound = (_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'Route not found'));

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    logger.warn({ reqId: req.id, code: err.code, status: err.status }, err.message);
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }

  logger.error({ reqId: req.id, err }, 'unhandled error');
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong', details: {} } });
}
