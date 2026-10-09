import { asyncHandler } from '../utils/asyncHandler.js';
import { todayIST } from '../utils/date.js';
import * as digestService from '../services/digest.service.js';

export const getDigest = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const targetDate = date === 'today' ? todayIST() : date;
  const digest = await digestService.getReadyDigest(targetDate);
  res.json({ data: digest });
});
