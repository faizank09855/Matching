// cats/schemas/cat.schema.ts
import { Schema } from 'mongoose';


export const PersonalDetailSchema = new Schema({
    height: String,
    dob: String,
    city : String , 
    bio : String , 
    gender : String, 
    work : String ,
    education : String ,
    hometown : String,
    interests : String , 
    hobby : String , 
    userId : String, 
    creativity : Array<String> , 
    sportType : Array<String> , 
    filmType : Array<String>  ,
    smoke : String , 
});
