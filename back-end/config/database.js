import mongoose from 'mongoose'
import { env } from './env.js'; 


const connectToDatabase=async ()=>{
    if(!env.DB_URI){
    throw new Error('please define the mongodb uri');
}
    try{
await mongoose.connect(env.DB_URI)
console.log(`✅✅DB connected in ${env.NODE_ENV} mode`)
    }catch(error){
        console.log(' something went wrong on the db side\n',error)
        process.exit(1)
    }
}
export default connectToDatabase
