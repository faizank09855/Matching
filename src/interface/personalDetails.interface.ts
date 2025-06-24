import { Document } from 'mongoose';

export interface PersonalDetail extends Document {  
  readonly height: string;
  readonly dob: String;
  readonly city: String;
  readonly bio: string;
  readonly gender : String, 
  readonly work : String ,
  readonly education : String ,
  readonly hometown : String,
  readonly interests : String , 
  readonly hobby : String,
  readonly userId : String,
  readonly creativity : Array<String> , 
  readonly sportType : Array<String> , 
  readonly filmType : Array<String>  ,
  readonly smoke : String , 
}