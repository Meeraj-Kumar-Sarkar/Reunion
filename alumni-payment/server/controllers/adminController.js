import Contribution from '../models/Contribution.js';
import SystemSetting from '../models/SystemSetting.js';
import { sendVerificationEmail } from '../utils/email.js';

const login = async (req, res) => {
  try {
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = Buffer.from(password).toString('base64');
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getContributions = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const contributions = await Contribution.find(filter).sort({ createdAt: -1 });

    const all = await Contribution.find();
    const stats = {
      total: all.length,
      totalAmount: all.reduce((sum, c) => sum + c.amount, 0),
      pending: all.filter((c) => c.status === 'pending').length,
      verified: all.filter((c) => c.status === 'verified').length,
    };

    res.json({ contributions, stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching contributions' });
  }
};

const verifyContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    contribution.status = 'verified';
    await contribution.save();

    await sendVerificationEmail(contribution.email, contribution.name, contribution.amount);

    res.json(contribution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error verifying contribution' });
  }
};

const createContribution = async (req, res) => {
  try {
    const { name, email, amount, examType, passoutYear, status } = req.body;
    if (!name || !email || !amount || !examType || !passoutYear) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newContribution = new Contribution({
      name,
      email,
      amount,
      examType,
      passoutYear,
      status: status || 'pending',
    });
    await newContribution.save();

    if (newContribution.status === 'verified') {
      await sendVerificationEmail(newContribution.email, newContribution.name, newContribution.amount);
    }

    res.status(201).json(newContribution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating contribution' });
  }
};

const updateContribution = async (req, res) => {
  try {
    const { name, email, amount, examType, passoutYear, status } = req.body;
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    const previousStatus = contribution.status;

    if (name !== undefined) contribution.name = name;
    if (email !== undefined) contribution.email = email;
    if (amount !== undefined) contribution.amount = amount;
    if (examType !== undefined) contribution.examType = examType;
    if (passoutYear !== undefined) contribution.passoutYear = passoutYear;
    if (status !== undefined) contribution.status = status;

    await contribution.save();

    if (status === 'verified' && previousStatus === 'pending') {
      await sendVerificationEmail(contribution.email, contribution.name, contribution.amount);
    }

    res.json(contribution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating contribution' });
  }
};

const deleteContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndDelete(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }
    res.json({ message: 'Contribution deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting contribution' });
  }
};

const getFundingStatus = async (req, res) => {
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

const updateFundingStatus = async (req, res) => {
  try {
    const { fundingActive } = req.body;
    if (typeof fundingActive !== 'boolean') {
      return res.status(400).json({ message: 'fundingActive must be a boolean' });
    }
    let setting = await SystemSetting.findOneAndUpdate(
      { key: 'fundingActive' },
      { value: fundingActive },
      { new: true, upsert: true }
    );
    res.json({ fundingActive: setting.value });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating funding status' });
  }
};

export {
  login,
  getContributions,
  verifyContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getFundingStatus,
  updateFundingStatus,
};
