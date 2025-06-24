// cats/schemas/cat.schema.ts
import { Schema } from 'mongoose';


export const LikeSchema = new Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
    },
    likedId: Array<String>,
});
