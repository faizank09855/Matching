import { Document } from 'mongoose';

export interface Likes extends Document {
  readonly userId: string;
  readonly likedId: String;
  readonly status: String ; 
}