import { Document } from 'mongoose';

export interface PersonalDetail extends Document {
  readonly height: string;
  readonly dob: String;
  readonly city: String;
  readonly bio: string;
  readonly gender : Number, 
}