// cats/schemas/cat.schema.ts
import { Schema } from 'mongoose';


export const LikeSchema = new Schema({
    userId: String,
    likedId: String,
    status: String
});
