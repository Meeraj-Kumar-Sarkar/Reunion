import dotenv from 'dotenv';
dotenv.config();

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    if (decoded !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export default adminAuth;
