import jwt from 'jsonwebtoken';

export const generateSecureQRToken = (sessionId: string) => {
  return jwt.sign(
    { sessionId }, 
    process.env.QR_SECRET!, 
    { expiresIn: '1m' } // Token expires in 60 seconds
  );
};