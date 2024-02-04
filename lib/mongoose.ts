import mongoose from 'mongoose'

let isConnected = false;

export const ConnectToDB = async ()=>{
    mongoose.set('strictQuery',true);

    if(!process.env.MONGO_URL) return console.log('Mongo Url not found')
    if(isConnected) return console.log('Already connected');

    try {
        
        await mongoose.connect(process.env.MONGO_URL);
        isConnected = true;
        console.log('Connected successful')
    } catch (error) {
        console.log(error)
    }

}
