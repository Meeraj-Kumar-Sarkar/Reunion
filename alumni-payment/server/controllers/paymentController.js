import Contribution from '../models/Contribution.js';
import SystemSetting from '../models/SystemSetting.js';
// import sendThankYouEmail from '../utils/email.js';
import dotenv from 'dotenv';
dotenv.config();

const createOrder = async (req, res) => {
  // We no longer create a Razorpay order here since we use a static QR.
  // Kept for compatibility if the frontend still calls it, though it's optional now.
  res.json({ message: 'Static QR flow enabled, order creation bypassed' });
};

const getFundingStatusPublic = async (req, res) => {
  try {
    let setting = await SystemSetting.findOne({ key: 'fundingActive' });
    if (!setting) {
      setting = await SystemSetting.create({ key: 'fundingActive', value: true });
    }
    res.json({ fundingActive: setting.value });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching funding status' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    // Check if funding website is closed
    let setting = await SystemSetting.findOne({ key: 'fundingActive' });
    if (setting && setting.value === false) {
      return res.status(400).json({ message: 'Contributions are temporarily closed' });
    }

    const { name, email, amount, examType, passoutYear, transactionRef } = req.body;

    if (!name || !email || !amount || !examType || !passoutYear) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save to database as pending (or verified depending on how you want to handle it)
    const newContribution = new Contribution({
      name,
      email,
      amount,
      examType,
      passoutYear,
      transactionRef: transactionRef || '',
      status: 'pending', // You can later verify this UTR against your bank statement
    });

    if (process.env.MONGODB_URI) {
      await newContribution.save();
    } else {
      console.warn('MongoDB URI missing. Skipping save to DB.');
    }

    // Send thank you email
    // await sendThankYouEmail(email, name, amount);

    res.json({ message: 'Payment details submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during payment submission' });
  }
};

export { createOrder, verifyPayment, getFundingStatusPublic };
