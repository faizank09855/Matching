import { Document } from 'mongoose';

export interface Likes extends Document {
  readonly userId: string;
  readonly likedId: Array<String>;
}