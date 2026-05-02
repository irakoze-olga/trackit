import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    DB_URI: process.env.DB_URL || process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || process.env.SECRET_KEY,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    EMAIL: process.env.EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',

};
