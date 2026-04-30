import dotenv from 'dotenv';
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
    EMAIL: process.env.EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_SECURE: parseBoolean(process.env.EMAIL_SECURE),
};
