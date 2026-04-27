import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    DB_URI: process.env.DB_URL || process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || process.env.SECRET_KEY,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    EMAIL: process.env.EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    //EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',

};

 let us validate for missing values 
 if(!PORT||!DB_URI||!JWT_EXPIRES_IN||!JWT_SECRET||!NODE_ENV||!CLIENT_URL||!EMAIL||!EMAIL_PASSWORD||!EMAIL_PORT||!EMAIL_SECURE||!EMAIL_SERVICE){
     console.log("Some env values are missing\n double check your env file");
     process.exit(1)
}
