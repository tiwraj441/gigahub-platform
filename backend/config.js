// Central config — reads from env vars, falls back to safe defaults for local/Vercel dev
const config = {
  JWT_ACCESS_SECRET:  process.env.JWT_ACCESS_SECRET  || 'gigahub_access_secret_key_12345!',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'gigahub_refresh_secret_key_12345!',
  JWT_RESET_SECRET:   process.env.JWT_RESET_SECRET   || 'gigahub_reset_secret_key_12345!',
  MONGO_URI:          process.env.MONGO_URI           || '',
  CONTACT_EMAIL:      process.env.CONTACT_EMAIL       || 'gigahub71@gmail.com',
  EMAIL_USER:         process.env.EMAIL_USER          || '',
  GEMINI_API_KEY:     process.env.GEMINI_API_KEY      || '',
  FRONTEND_URL:       process.env.FRONTEND_URL        || 'http://localhost:5000',
  COOKIE_SECURE:      process.env.COOKIE_SECURE === 'true',
  PORT:               parseInt(process.env.PORT)      || 5000,
};

export default config;
