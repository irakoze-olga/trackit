import mongoose from 'mongoose'
import { env } from './env.js'; 


const connectToDatabase=async ()=>{
    if(!env.DB_URI){
    throw new Error('please define the mongodb uri');
}
    try{
await mongoose.connect(env.DB_URI)
console.log(`✅✅connected to the database in ${env.NODE_ENV} mode`)
    }catch(error){
        console.log('❌❌error on connecting to database',error)
        process.exit(1)
    }
}
export default connectToDatabase
