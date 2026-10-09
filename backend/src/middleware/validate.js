import { AppError } from '../utils/AppError.js';
import { isValidDateString } from '../utils/date.js';

export function validateDateParam(req, _res, next) {
  const { date } = req.params;
  if (date === 'today' || isValidDateString(date)) {
    return next();
  }
  throw new AppError(400, 'VALIDATION_ERROR', 'Invalid date parameter. Use "today" or YYYY-MM-DD');
}
