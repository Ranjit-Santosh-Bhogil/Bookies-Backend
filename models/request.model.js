import mongoose from "mongoose";

const bookRequest = new mongoose.Schema({
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    connectionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status_accepted:{
        type:Boolean,
        default:null,
    }
});
const BookRequest = mongoose.model("BookRequest",bookRequest);
export default BookRequest;