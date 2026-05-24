import express from 'express';
import { createOrder, verifyPayment, getFundingStatusPublic } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/status', getFundingStatusPublic);
router.post('/order', createOrder);
router.post('/verify', verifyPayment);

export default router;
