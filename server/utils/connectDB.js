import mongoose from "mongoose";

const connectDB=async ()=>{
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not configured")
        }
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB Connected")
    } catch (error) {
        // Keep connection strings and driver details out of logs.
        console.error(`MongoDB connection failed (${error?.name || "Error"}). Check Atlas cluster status, IP access list, and network connectivity.`)
        throw new Error("MongoDB connection failed")
    }
}

export default connectDB
