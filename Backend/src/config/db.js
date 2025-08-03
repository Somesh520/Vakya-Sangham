import mongoose from 'mongoose';

const connectdb =async()=>{
    try {
        const connect=await mongoose.connect(process.env.MONGO_URI);
<<<<<<< HEAD
        console.log("Connecting to database with URI:", process.env.MONGO_URI); 
=======
>>>>>>> 613bbb4c0073d8a42f746877835fb7060a2b698d
        console.log('DataBase connected Successfully')
    } catch (error) {
        console.log(error.message);
    }
}
export default connectdb;