import { Document } from "mongoose";

export interface Chat extends Document {
    readonly sender: String,
    readonly receiver: String,
    readonly message: String , 
    readonly createdAt: String , 
}