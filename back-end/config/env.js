import dotenv from 'dotenv';
<<<<<<< HEAD

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    DB_URI: process.env.DB_URL || process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || process.env.SECRET_KEY,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
=======
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const requiredVariables = [
    "PORT",
    "DB_URI",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "NODE_ENV",
    "CLIENT_URL",
];

const missingVariables = requiredVariables.filter((key) => !process.env[key]?.trim());

if (missingVariables.length) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
}

const parseBoolean = (value) => value === "true";

export const env = {
    PORT: process.env.PORT,
    DB_URI: process.env.DB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL: process.env.CLIENT_URL,
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    EMAIL: process.env.EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_PORT: process.env.EMAIL_PORT,
<<<<<<< HEAD
    EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',

=======
    EMAIL_SECURE: parseBoolean(process.env.EMAIL_SECURE),
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SYSTEM_LOGIN_URL: process.env.SYSTEM_LOGIN_URL || `${process.env.CLIENT_URL}/auth/login`,
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
};
