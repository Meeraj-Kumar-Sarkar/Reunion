import express from 'express';
import {
  login,
  getContributions,
  verifyContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getFundingStatus,
  updateFundingStatus,
} from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/login', login);
router.get('/contributions', adminAuth, getContributions);
router.patch('/contributions/:id/verify', adminAuth, verifyContribution);
router.post('/contributions', adminAuth, createContribution);
router.put('/contributions/:id', adminAuth, updateContribution);
router.delete('/contributions/:id', adminAuth, deleteContribution);
router.get('/settings/funding-status', adminAuth, getFundingStatus);
router.patch('/settings/funding-status', adminAuth, updateFundingStatus);

export default router;
