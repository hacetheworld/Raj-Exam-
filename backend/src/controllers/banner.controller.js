import { asyncHandler } from '../utils/asyncHandler.js';
import { todayIST } from '../utils/date.js';
import * as bannerService from '../services/banner.service.js';

export const getBanner = asyncHandler(async (_req, res) => {
  const banner = await bannerService.getActiveBanner(todayIST());
  res.json({ data: banner });
});
