import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
    id: {type: String, require: true},
    username: {type: String, require: true,unique: true},
    name: {type: String, require: true},
    image: String,
    bio: String,
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    threads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread'
    }],
    onboarded: {
        type: Boolean,
        default: false
    },
    members:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
})
const Community = mongoose.models.Community || mongoose.model('Community', communitySchema)

export default Community;