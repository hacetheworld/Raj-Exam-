import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'UNAUTHORIZED', 'Please log in again');

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) throw new AppError(401, 'UNAUTHORIZED', 'Please log in again');

  req.user = { id: data.user.id, email: data.user.email };
  next();
});
