import mongoose from 'mongoose';

const connectdb =async()=>{
    try {
        const connect=await mongoose.connect(process.env.MONGO_URI);

        console.log("Connecting to database with URI:", process.env.MONGO_URI); 

        console.log('DataBase connected Successfully')
    } catch (error) {
        console.log(error.message);
    }
}
export default connectdb;