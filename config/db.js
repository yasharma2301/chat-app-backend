import mongoose from 'mongoose';

const connectDB = () => {
    try {
        const connection = mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Connected to Mongo: ${connection.host}`)
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;