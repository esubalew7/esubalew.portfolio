import rateLimit from 'express-rate-limit';

// Rate limiter for contact route: 100 requests / 15 min
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many contact messages sent from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter for all other /api routes: 200 requests / 15 min
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  skip: (req) => req.originalUrl.startsWith('/api/contact'),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many 2FA attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const setupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many 2FA setup attempts. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many password change attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
