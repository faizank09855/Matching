import { Schema } from "mongoose";


export const ChatSchema = new  Schema({
    sender : String,
    receiver : String,  
    message : String , 
    createdAt : String
})