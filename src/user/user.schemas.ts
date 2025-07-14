// cats/schemas/cat.schema.ts
import { Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';

export const UserSchema = new Schema({
  
    name: String,
    age: Number,
  email: {
        type: String,
        unique: true,   // Ensures unique index in MongoDB
        required: true
    },
    password: String ,
    onboardingStatus: String
});


UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  });
