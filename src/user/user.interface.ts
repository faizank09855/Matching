import { Document } from 'mongoose';

export interface User extends Document { 
  readonly name: string;
  readonly email: string;
  readonly age: number;
  readonly password: string;
  readonly onboardingStatus: String;
}